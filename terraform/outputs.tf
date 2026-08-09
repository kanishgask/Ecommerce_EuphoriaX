# ─────────────────────────────────────────────────────────────────────────────
# Outputs — values needed by GitHub Actions / frontend .env
# ─────────────────────────────────────────────────────────────────────────────

output "api_gateway_url" {
  description = "Base URL for all API calls — set as VITE_API_BASE_URL in the frontend .env"
  value       = "https://${aws_api_gateway_rest_api.main.id}.execute-api.${var.aws_region}.amazonaws.com/${aws_api_gateway_stage.prod.stage_name}"
}

output "cognito_user_pool_id" {
  description = "Cognito User Pool ID — set as COGNITO_USER_POOL_ID in Lambda env vars"
  value       = aws_cognito_user_pool.main.id
}

output "cognito_client_id" {
  description = "Cognito App Client ID — set as COGNITO_CLIENT_ID in Lambda env vars"
  value       = aws_cognito_user_pool_client.web_client.id
}

output "cloudfront_domain" {
  description = "CloudFront URL for the React frontend"
  value       = "https://${aws_cloudfront_distribution.frontend.domain_name}"
}

output "cloudfront_distribution_id" {
  description = "CloudFront Distribution ID — add as CLOUDFRONT_DISTRIBUTION_ID GitHub secret"
  value       = aws_cloudfront_distribution.frontend.id
}

output "frontend_s3_bucket" {
  description = "S3 bucket name hosting the frontend build"
  value       = aws_s3_bucket.frontend.bucket
}

output "dynamodb_tables" {
  description = "DynamoDB table names for all services"
  value = {
    users         = aws_dynamodb_table.users.name
    products      = aws_dynamodb_table.products.name
    cart          = aws_dynamodb_table.cart.name
    orders        = aws_dynamodb_table.orders.name
    inventory     = aws_dynamodb_table.inventory.name
    payments      = aws_dynamodb_table.payments.name
    notifications = aws_dynamodb_table.notifications.name
  }
}

output "sns_topic_arns" {
  description = "SNS topic ARNs used in Lambda environment variables"
  value = {
    order_events     = aws_sns_topic.order_events.arn
    payment_events   = aws_sns_topic.payment_events.arn
    inventory_events = aws_sns_topic.inventory_events.arn
  }
}

output "lambda_function_names" {
  description = "Lambda function names for all microservices"
  value       = { for k, v in aws_lambda_function.services : k => v.function_name }
}
