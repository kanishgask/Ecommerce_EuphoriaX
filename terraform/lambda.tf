# ─────────────────────────────────────────────────────────────────────────────
# Lambda Functions — all 7 microservices
# Uses a placeholder ZIP on first deploy; GitHub Actions replaces code via
# aws lambda update-function-code after CI builds the real ZIPs
# ─────────────────────────────────────────────────────────────────────────────

# Placeholder ZIP so Terraform can create the function without real code yet
data "archive_file" "placeholder" {
  type        = "zip"
  output_path = "${path.module}/placeholder.zip"

  source {
    content  = "exports.handler = async () => ({ statusCode: 200, body: 'placeholder' });"
    filename = "index.js"
  }
}

# ── Environment variables per service ─────────────────────────────────────────

locals {
  common_env = {
    NODE_ENV   = "production"
    AWS_REGION = var.aws_region
  }

  service_env = {
    "authentication-service" = merge(local.common_env, {
      COGNITO_USER_POOL_ID  = aws_cognito_user_pool.main.id
      COGNITO_CLIENT_ID     = aws_cognito_user_pool_client.web_client.id
      DYNAMODB_USERS_TABLE  = aws_dynamodb_table.users.name
    })

    "product-service" = merge(local.common_env, {
      DYNAMODB_PRODUCTS_TABLE = aws_dynamodb_table.products.name
    })

    "cart-service" = merge(local.common_env, {
      COGNITO_USER_POOL_ID = aws_cognito_user_pool.main.id
      COGNITO_CLIENT_ID    = aws_cognito_user_pool_client.web_client.id
      DYNAMODB_CART_TABLE  = aws_dynamodb_table.cart.name
    })

    "inventory-service" = merge(local.common_env, {
      DYNAMODB_INVENTORY_TABLE  = aws_dynamodb_table.inventory.name
      SNS_INVENTORY_EVENTS_TOPIC = aws_sns_topic.inventory_events.arn
    })

    "order-service" = merge(local.common_env, {
      COGNITO_USER_POOL_ID   = aws_cognito_user_pool.main.id
      COGNITO_CLIENT_ID      = aws_cognito_user_pool_client.web_client.id
      DYNAMODB_ORDERS_TABLE  = aws_dynamodb_table.orders.name
      SNS_ORDER_EVENTS_TOPIC = aws_sns_topic.order_events.arn
    })

    "payment-service" = merge(local.common_env, {
      COGNITO_USER_POOL_ID      = aws_cognito_user_pool.main.id
      COGNITO_CLIENT_ID         = aws_cognito_user_pool_client.web_client.id
      DYNAMODB_PAYMENTS_TABLE   = aws_dynamodb_table.payments.name
      SNS_PAYMENT_EVENTS_TOPIC  = aws_sns_topic.payment_events.arn
    })

    "notification-service" = merge(local.common_env, {
      DYNAMODB_ORDERS_TABLE  = aws_dynamodb_table.orders.name
      DYNAMODB_USERS_TABLE   = aws_dynamodb_table.users.name
      GMAIL_USER             = var.gmail_user
      GMAIL_PASS             = var.gmail_pass
    })
  }

  # Lambda handler per service — matches handler.js / lambda.js in each service
  service_handler = {
    "authentication-service" = "lambda.handler"
    "product-service"        = "lambda.handler"
    "cart-service"           = "lambda.handler"
    "inventory-service"      = "handler.processInventoryEvents"
    "order-service"          = "lambda.handler"
    "payment-service"        = "handler.processPaymentEvents"
    "notification-service"   = "handler.processNotificationEvents"
  }
}

# ── Lambda functions ───────────────────────────────────────────────────────────

resource "aws_lambda_function" "services" {
  for_each = toset(local.services)

  function_name = "${var.project_name}-${each.key}"
  role          = aws_iam_role.lambda_roles[each.key].arn
  runtime       = var.lambda_runtime
  handler       = local.service_handler[each.key]
  timeout       = var.lambda_timeout
  memory_size   = var.lambda_memory_size

  # Placeholder ZIP — GitHub Actions will update this via update-function-code
  filename         = data.archive_file.placeholder.output_path
  source_code_hash = data.archive_file.placeholder.output_base64sha256

  environment {
    variables = local.service_env[each.key]
  }

  # X-Ray active tracing
  tracing_config {
    mode = "Active"
  }

  tags = {
    Project     = var.project_name
    Environment = var.environment
    Service     = each.key
  }

  # Prevent Terraform from overwriting code deployed by GitHub Actions
  lifecycle {
    ignore_changes = [filename, source_code_hash]
  }
}

# ── API Gateway permissions to invoke HTTP-facing Lambdas ─────────────────────

locals {
  http_services = toset([
    "authentication-service",
    "product-service",
    "cart-service",
    "order-service",
    "payment-service",
    "notification-service",
  ])
}

resource "aws_lambda_permission" "apigw_invoke" {
  for_each      = local.http_services
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.services[each.key].function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}
