# ==============================================================================
# EuphoriaX Store - Terraform Outputs
# Key infrastructure endpoints and identifiers for deployment configuration
# ==============================================================================

output "frontend_s3_bucket_name" {
  description = "Name of the Amazon S3 bucket hosting static frontend SPA build"
  value       = aws_s3_bucket.storefront.bucket
}

output "cloudfront_domain_name" {
  description = "Global HTTPS CDN domain name for EuphoriaX Storefront"
  value       = aws_cloudfront_distribution.cdn.domain_name
}

output "cloudfront_distribution_id" {
  description = "ID of the CloudFront distribution (used for CDN cache invalidation in CI/CD)"
  value       = aws_cloudfront_distribution.cdn.id
}

output "api_gateway_endpoint" {
  description = "Base URL endpoint for serverless HTTP API Gateway v2"
  value       = aws_apigatewayv2_api.http_api.api_endpoint
}

output "cognito_user_pool_id" {
  description = "Amazon Cognito User Pool ID for backend authentication middleware"
  value       = aws_cognito_user_pool.pool.id
}

output "cognito_app_client_id" {
  description = "Amazon Cognito App Client ID for frontend auth store configuration"
  value       = aws_cognito_user_pool_client.client.id
}

output "dynamodb_tables" {
  description = "Map of all provisioned Amazon DynamoDB serverless table names"
  value = {
    users         = aws_dynamodb_table.users.name
    products      = aws_dynamodb_table.products.name
    cart          = aws_dynamodb_table.cart.name
    orders        = aws_dynamodb_table.orders.name
    inventory     = aws_dynamodb_table.inventory.name
    notifications = aws_dynamodb_table.notifications.name
    payments      = aws_dynamodb_table.payments.name
  }
}
