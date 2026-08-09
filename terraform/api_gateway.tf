# ─────────────────────────────────────────────────────────────────────────────
# API Gateway — single REST API, one {proxy+} resource per service
# Routes: /auth/{proxy+}, /products/{proxy+}, /cart/{proxy+}, etc.
# ─────────────────────────────────────────────────────────────────────────────

resource "aws_api_gateway_rest_api" "main" {
  name        = "${var.project_name}-api"
  description = "EuphoriaX unified API Gateway for all microservices"

  endpoint_configuration {
    types = ["REGIONAL"]
  }

  tags = { Project = var.project_name, Environment = var.environment }
}

# ── Route definitions ──────────────────────────────────────────────────────────

locals {
  routes = {
    auth         = { path = "auth",         service = "authentication-service" }
    products     = { path = "products",     service = "product-service"        }
    cart         = { path = "cart",         service = "cart-service"           }
    orders       = { path = "orders",       service = "order-service"          }
    payments     = { path = "payments",     service = "payment-service"        }
    notifications = { path = "notifications", service = "notification-service" }
    inventory    = { path = "inventory",    service = "inventory-service"      }
  }
}

# Top-level path resources (/auth, /products, ...)
resource "aws_api_gateway_resource" "service_root" {
  for_each    = local.routes
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_rest_api.main.root_resource_id
  path_part   = each.value.path
}

# Greedy {proxy+} child under each top-level resource
resource "aws_api_gateway_resource" "service_proxy" {
  for_each    = local.routes
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.service_root[each.key].id
  path_part   = "{proxy+}"
}

# ANY method on the {proxy+} resource
resource "aws_api_gateway_method" "service_proxy_method" {
  for_each      = local.routes
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.service_proxy[each.key].id
  http_method   = "ANY"
  authorization = "NONE"
}

# Lambda proxy integration
resource "aws_api_gateway_integration" "service_proxy_integration" {
  for_each                = local.routes
  rest_api_id             = aws_api_gateway_rest_api.main.id
  resource_id             = aws_api_gateway_resource.service_proxy[each.key].id
  http_method             = aws_api_gateway_method.service_proxy_method[each.key].http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.services[each.value.service].invoke_arn
}

# OPTIONS method for CORS preflight on {proxy+}
resource "aws_api_gateway_method" "options" {
  for_each      = local.routes
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.service_proxy[each.key].id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "options_integration" {
  for_each    = local.routes
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.service_proxy[each.key].id
  http_method = aws_api_gateway_method.options[each.key].http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_method_response" "options_200" {
  for_each    = local.routes
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.service_proxy[each.key].id
  http_method = aws_api_gateway_method.options[each.key].http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_integration_response" "options_integration_response" {
  for_each    = local.routes
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.service_proxy[each.key].id
  http_method = aws_api_gateway_method.options[each.key].http_method
  status_code = aws_api_gateway_method_response.options_200[each.key].status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,POST,PUT,DELETE,OPTIONS,PATCH'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }

  depends_on = [aws_api_gateway_integration.options_integration]
}

# ── Deployment & Stage ─────────────────────────────────────────────────────────

resource "aws_api_gateway_deployment" "main" {
  rest_api_id = aws_api_gateway_rest_api.main.id

  # Force redeployment when any integration changes
  triggers = {
    redeployment = sha1(jsonencode([
      aws_api_gateway_resource.service_proxy,
      aws_api_gateway_method.service_proxy_method,
      aws_api_gateway_integration.service_proxy_integration,
    ]))
  }

  lifecycle {
    create_before_destroy = true
  }

  depends_on = [
    aws_api_gateway_integration.service_proxy_integration,
    aws_api_gateway_integration_response.options_integration_response,
  ]
}

resource "aws_api_gateway_stage" "prod" {
  deployment_id = aws_api_gateway_deployment.main.id
  rest_api_id   = aws_api_gateway_rest_api.main.id
  stage_name    = "prod"

  xray_tracing_enabled = true

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_gateway.arn
  }

  tags = { Project = var.project_name, Environment = var.environment }
}

# Enable detailed metrics on the stage
resource "aws_api_gateway_method_settings" "all" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  stage_name  = aws_api_gateway_stage.prod.stage_name
  method_path = "*/*"

  settings {
    metrics_enabled        = true
    logging_level          = "INFO"
    data_trace_enabled     = false
    throttling_rate_limit  = 1000
    throttling_burst_limit = 500
  }
}
