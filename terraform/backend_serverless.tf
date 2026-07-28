# ==============================================================================
# EuphoriaX Store - Serverless Backend Architecture
# IAM Execution Roles, API Gateway HTTP API v2, & Lambda Function Configurations
# ==============================================================================

# 1. IAM Execution Role for Microservices Lambda Functions
resource "aws_iam_role" "lambda_exec" {
  name = "${var.project_name}-lambda-exec-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action    = "sts:AssumeRole"
        Effect    = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

# 2. IAM Policy granting access to DynamoDB, Cognito User Pool, SNS, and CloudWatch
resource "aws_iam_policy" "lambda_permissions" {
  name        = "${var.project_name}-lambda-policy-${var.environment}"
  description = "Permissions for EuphoriaX Lambda microservices to access DynamoDB, Cognito, SNS, and Logs"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "DynamoDBAccess"
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query",
          "dynamodb:Scan",
          "dynamodb:BatchGetItem",
          "dynamodb:BatchWriteItem"
        ]
        Resource = [
          aws_dynamodb_table.users.arn,
          aws_dynamodb_table.products.arn,
          aws_dynamodb_table.cart.arn,
          aws_dynamodb_table.orders.arn,
          aws_dynamodb_table.inventory.arn,
          aws_dynamodb_table.notifications.arn,
          aws_dynamodb_table.payments.arn,
          "${aws_dynamodb_table.users.arn}/index/*",
          "${aws_dynamodb_table.products.arn}/index/*",
          "${aws_dynamodb_table.orders.arn}/index/*",
          "${aws_dynamodb_table.notifications.arn}/index/*",
          "${aws_dynamodb_table.payments.arn}/index/*"
        ]
      },
      {
        Sid    = "CognitoAccess"
        Effect = "Allow"
        Action = [
          "cognito-idp:AdminGetUser",
          "cognito-idp:AdminCreateUser",
          "cognito-idp:AdminAddUserToGroup",
          "cognito-idp:AdminRemoveUserFromGroup",
          "cognito-idp:AdminSetUserPassword",
          "cognito-idp:ListUsers",
          "cognito-idp:ListGroups"
        ]
        Resource = [aws_cognito_user_pool.pool.arn]
      },
      {
        Sid    = "CloudWatchLogsAccess"
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      },
      {
        Sid    = "SNSNotificationsAccess"
        Effect = "Allow"
        Action = [
          "sns:Publish",
          "sns:CreateTopic",
          "sns:Subscribe"
        ]
        Resource = "arn:aws:sns:*:*:*euphoriax*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_attach" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = aws_iam_policy.lambda_permissions.arn
}

# 3. Amazon API Gateway (HTTP API v2) with CORS configuration
resource "aws_apigatewayv2_api" "http_api" {
  name          = "${var.project_name}-api-${var.environment}"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = [
      "https://${aws_cloudfront_distribution.cdn.domain_name}",
      "http://localhost:5173",
      "http://localhost:3000"
    ]
    allow_methods = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
    allow_headers = ["Content-Type", "Authorization", "X-Requested-With", "Accept"]
    allow_credentials = true
    max_age           = 86400
  }

  tags = { Service = "api-gateway" }
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.http_api.id
  name        = "$default"
  auto_deploy = true

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_logs.arn
    format          = jsonencode({
      requestId      = "$context.requestId"
      ip             = "$context.identity.sourceIp"
      requestTime    = "$context.requestTime"
      httpMethod     = "$context.httpMethod"
      routeKey       = "$context.routeKey"
      status         = "$context.status"
      protocol       = "$context.protocol"
      responseLength = "$context.responseLength"
    })
  }
}

resource "aws_cloudwatch_log_group" "api_logs" {
  name              = "/aws/apigateway/${var.project_name}-api-${var.environment}"
  retention_in_days = 30
}
