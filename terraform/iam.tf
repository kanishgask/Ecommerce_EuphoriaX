# ─────────────────────────────────────────────────────────────────────────────
# IAM — Lambda execution roles with least-privilege policies per service
# ─────────────────────────────────────────────────────────────────────────────

# Shared assume-role policy for all Lambda functions
data "aws_iam_policy_document" "lambda_assume_role" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

# ── Per-service IAM roles ──────────────────────────────────────────────────────

locals {
  services = [
    "authentication-service",
    "product-service",
    "cart-service",
    "inventory-service",
    "order-service",
    "payment-service",
    "notification-service",
  ]
}

resource "aws_iam_role" "lambda_roles" {
  for_each           = toset(local.services)
  name               = "${var.project_name}-${each.key}-role"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role.json

  tags = { Project = var.project_name, Environment = var.environment }
}

# Attach basic Lambda execution (CloudWatch Logs) to every role
resource "aws_iam_role_policy_attachment" "basic_execution" {
  for_each   = toset(local.services)
  role       = aws_iam_role.lambda_roles[each.key].name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Attach X-Ray write access to every role
resource "aws_iam_role_policy_attachment" "xray" {
  for_each   = toset(local.services)
  role       = aws_iam_role.lambda_roles[each.key].name
  policy_arn = "arn:aws:iam::aws:policy/AWSXRayDaemonWriteAccess"
}

# ── Service-specific inline policies ──────────────────────────────────────────

# authentication-service: Cognito + Users DynamoDB table
resource "aws_iam_role_policy" "auth_policy" {
  name = "auth-service-policy"
  role = aws_iam_role.lambda_roles["authentication-service"].id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem", "dynamodb:PutItem", "dynamodb:UpdateItem",
          "dynamodb:DeleteItem", "dynamodb:Scan", "dynamodb:Query"
        ]
        Resource = [
          aws_dynamodb_table.users.arn,
          "${aws_dynamodb_table.users.arn}/index/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "cognito-idp:AdminCreateUser", "cognito-idp:AdminSetUserPassword",
          "cognito-idp:AdminInitiateAuth", "cognito-idp:SignUp",
          "cognito-idp:ConfirmSignUp", "cognito-idp:InitiateAuth",
          "cognito-idp:ForgotPassword", "cognito-idp:ConfirmForgotPassword",
          "cognito-idp:GetUser", "cognito-idp:ListUsers"
        ]
        Resource = aws_cognito_user_pool.main.arn
      }
    ]
  })
}

# product-service: Products DynamoDB table
resource "aws_iam_role_policy" "product_policy" {
  name = "product-service-policy"
  role = aws_iam_role.lambda_roles["product-service"].id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "dynamodb:GetItem", "dynamodb:PutItem", "dynamodb:UpdateItem",
        "dynamodb:DeleteItem", "dynamodb:Scan", "dynamodb:Query"
      ]
      Resource = [
        aws_dynamodb_table.products.arn,
        "${aws_dynamodb_table.products.arn}/index/*"
      ]
    }]
  })
}

# cart-service: Cart DynamoDB table
resource "aws_iam_role_policy" "cart_policy" {
  name = "cart-service-policy"
  role = aws_iam_role.lambda_roles["cart-service"].id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "dynamodb:GetItem", "dynamodb:PutItem", "dynamodb:UpdateItem",
        "dynamodb:DeleteItem", "dynamodb:Scan", "dynamodb:Query"
      ]
      Resource = [
        aws_dynamodb_table.cart.arn,
        "${aws_dynamodb_table.cart.arn}/index/*"
      ]
    }]
  })
}

# inventory-service: Inventory DynamoDB table + SNS publish + SQS receive
resource "aws_iam_role_policy" "inventory_policy" {
  name = "inventory-service-policy"
  role = aws_iam_role.lambda_roles["inventory-service"].id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem", "dynamodb:PutItem", "dynamodb:UpdateItem",
          "dynamodb:DeleteItem", "dynamodb:Scan", "dynamodb:Query"
        ]
        Resource = [
          aws_dynamodb_table.inventory.arn,
          "${aws_dynamodb_table.inventory.arn}/index/*"
        ]
      },
      {
        Effect   = "Allow"
        Action   = ["sns:Publish"]
        Resource = aws_sns_topic.inventory_events.arn
      },
      {
        Effect = "Allow"
        Action = [
          "sqs:ReceiveMessage", "sqs:DeleteMessage", "sqs:GetQueueAttributes"
        ]
        Resource = aws_sqs_queue.inventory_queue.arn
      }
    ]
  })
}

# order-service: Orders DynamoDB table + SNS publish
resource "aws_iam_role_policy" "order_policy" {
  name = "order-service-policy"
  role = aws_iam_role.lambda_roles["order-service"].id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem", "dynamodb:PutItem", "dynamodb:UpdateItem",
          "dynamodb:DeleteItem", "dynamodb:Scan", "dynamodb:Query"
        ]
        Resource = [
          aws_dynamodb_table.orders.arn,
          "${aws_dynamodb_table.orders.arn}/index/*"
        ]
      },
      {
        Effect   = "Allow"
        Action   = ["sns:Publish"]
        Resource = aws_sns_topic.order_events.arn
      }
    ]
  })
}

# payment-service: Payments DynamoDB table + SNS publish + SQS receive
resource "aws_iam_role_policy" "payment_policy" {
  name = "payment-service-policy"
  role = aws_iam_role.lambda_roles["payment-service"].id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem", "dynamodb:PutItem", "dynamodb:UpdateItem",
          "dynamodb:DeleteItem", "dynamodb:Scan", "dynamodb:Query"
        ]
        Resource = [
          aws_dynamodb_table.payments.arn,
          "${aws_dynamodb_table.payments.arn}/index/*"
        ]
      },
      {
        Effect   = "Allow"
        Action   = ["sns:Publish"]
        Resource = aws_sns_topic.payment_events.arn
      },
      {
        Effect = "Allow"
        Action = [
          "sqs:ReceiveMessage", "sqs:DeleteMessage", "sqs:GetQueueAttributes"
        ]
        Resource = aws_sqs_queue.payment_queue.arn
      }
    ]
  })
}

# notification-service: Orders + Users DynamoDB (read-only) + SQS receive
resource "aws_iam_role_policy" "notification_policy" {
  name = "notification-service-policy"
  role = aws_iam_role.lambda_roles["notification-service"].id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = ["dynamodb:GetItem", "dynamodb:Query"]
        Resource = [
          aws_dynamodb_table.orders.arn,
          "${aws_dynamodb_table.orders.arn}/index/*",
          aws_dynamodb_table.users.arn,
          "${aws_dynamodb_table.users.arn}/index/*",
          aws_dynamodb_table.notifications.arn
        ]
      },
      {
        Effect   = "Allow"
        Action   = ["dynamodb:PutItem"]
        Resource = aws_dynamodb_table.notifications.arn
      },
      {
        Effect = "Allow"
        Action = [
          "sqs:ReceiveMessage", "sqs:DeleteMessage", "sqs:GetQueueAttributes"
        ]
        Resource = aws_sqs_queue.notification_queue.arn
      }
    ]
  })
}
