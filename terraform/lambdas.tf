# ==========================================
# Generate Bootstrap ZIP for Lambdas
# ==========================================
data "archive_file" "dummy_lambda" {
  type        = "zip"
  source_file = "${path.module}/dummy.js"
  output_path = "${path.module}/dummy.zip"
}

# ==========================================
# Microservice Deployments
# ==========================================

module "auth_service" {
  source                    = "./modules/serverless_microservice"
  service_name              = "euphoriax-auth-service"
  lambda_zip_path           = data.archive_file.dummy_lambda.output_path
  api_gateway_id            = aws_apigatewayv2_api.main.id
  api_gateway_execution_arn = aws_apigatewayv2_api.main.execution_arn
  create_api_route          = true
  route_key                 = "ANY /auth/{proxy+}"

  environment_variables = {
    NODE_ENV = "production"
    PORT     = "4001"
  }
}

module "user_service" {
  source                    = "./modules/serverless_microservice"
  service_name              = "euphoriax-user-service"
  lambda_zip_path           = data.archive_file.dummy_lambda.output_path
  api_gateway_id            = aws_apigatewayv2_api.main.id
  api_gateway_execution_arn = aws_apigatewayv2_api.main.execution_arn
  create_api_route          = true
  route_key                 = "ANY /users/{proxy+}"

  environment_variables = {
    NODE_ENV = "production"
    PORT     = "4002"
  }
}

module "product_service" {
  source                    = "./modules/serverless_microservice"
  service_name              = "euphoriax-product-service"
  lambda_zip_path           = data.archive_file.dummy_lambda.output_path
  api_gateway_id            = aws_apigatewayv2_api.main.id
  api_gateway_execution_arn = aws_apigatewayv2_api.main.execution_arn
  create_api_route          = true
  route_key                 = "ANY /products/{proxy+}"

  environment_variables = {
    NODE_ENV = "production"
    PORT     = "4003"
  }
}

module "cart_service" {
  source                    = "./modules/serverless_microservice"
  service_name              = "euphoriax-cart-service"
  lambda_zip_path           = data.archive_file.dummy_lambda.output_path
  api_gateway_id            = aws_apigatewayv2_api.main.id
  api_gateway_execution_arn = aws_apigatewayv2_api.main.execution_arn
  create_api_route          = true
  route_key                 = "ANY /cart/{proxy+}"

  environment_variables = {
    NODE_ENV = "production"
    PORT     = "4004"
  }
}

module "order_service" {
  source                    = "./modules/serverless_microservice"
  service_name              = "euphoriax-order-service"
  lambda_zip_path           = data.archive_file.dummy_lambda.output_path
  api_gateway_id            = aws_apigatewayv2_api.main.id
  api_gateway_execution_arn = aws_apigatewayv2_api.main.execution_arn
  create_api_route          = true
  route_key                 = "ANY /orders/{proxy+}"

  environment_variables = {
    NODE_ENV = "production"
    PORT     = "4005"
  }
}

module "payment_service" {
  source                    = "./modules/serverless_microservice"
  service_name              = "euphoriax-payment-service"
  lambda_zip_path           = data.archive_file.dummy_lambda.output_path
  api_gateway_id            = aws_apigatewayv2_api.main.id
  api_gateway_execution_arn = aws_apigatewayv2_api.main.execution_arn
  create_api_route          = true
  route_key                 = "ANY /payments/{proxy+}"

  environment_variables = {
    NODE_ENV = "production"
    PORT     = "4006"
  }
}

module "inventory_service" {
  source                    = "./modules/serverless_microservice"
  service_name              = "euphoriax-inventory-service"
  lambda_zip_path           = data.archive_file.dummy_lambda.output_path
  api_gateway_id            = aws_apigatewayv2_api.main.id
  api_gateway_execution_arn = aws_apigatewayv2_api.main.execution_arn
  create_api_route          = true
  route_key                 = "ANY /inventory/{proxy+}"

  environment_variables = {
    NODE_ENV = "production"
    PORT     = "4007"
  }
}

module "notification_service" {
  source                    = "./modules/serverless_microservice"
  service_name              = "euphoriax-notification-service"
  lambda_zip_path           = data.archive_file.dummy_lambda.output_path
  api_gateway_id            = aws_apigatewayv2_api.main.id
  api_gateway_execution_arn = aws_apigatewayv2_api.main.execution_arn
  create_api_route          = true
  route_key                 = "ANY /notifications/{proxy+}"

  environment_variables = {
    NODE_ENV = "production"
    PORT     = "4008"
  }
}

# Consumers don't need API Gateway Routes
module "email_consumer" {
  source           = "./modules/serverless_microservice"
  service_name     = "euphoriax-email-consumer"
  lambda_zip_path  = data.archive_file.dummy_lambda.output_path
  create_api_route = false

  environment_variables = {
    NODE_ENV = "production"
  }
}

module "inventory_consumer" {
  source           = "./modules/serverless_microservice"
  service_name     = "euphoriax-inventory-consumer"
  lambda_zip_path  = data.archive_file.dummy_lambda.output_path
  create_api_route = false

  environment_variables = {
    NODE_ENV = "production"
  }
}
