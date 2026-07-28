# ==============================================================================
# EuphoriaX Store - Amazon DynamoDB Database Tables
# Serverless NoSQL persistence layer for all 8 microservices
# ==============================================================================

# 1. Users Table (user-service & auth-service)
resource "aws_dynamodb_table" "users" {
  name         = "${var.project_name}-users-${var.environment}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "userId"

  attribute {
    name = "userId"
    type = "S"
  }

  attribute {
    name = "email"
    type = "S"
  }

  global_secondary_index {
    name               = "EmailIndex"
    hash_key           = "email"
    projection_type    = "ALL"
  }

  point_in_time_recovery {
    enabled = var.enable_point_in_time_recovery
  }

  tags = { Service = "user-service" }
}

# 2. Products Catalog Table (product-service)
resource "aws_dynamodb_table" "products" {
  name         = "${var.project_name}-products-${var.environment}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "category"
    type = "S"
  }

  global_secondary_index {
    name               = "CategoryIndex"
    hash_key           = "category"
    projection_type    = "ALL"
  }

  point_in_time_recovery {
    enabled = var.enable_point_in_time_recovery
  }

  tags = { Service = "product-service" }
}

# 3. Shopping Cart Table (cart-service)
resource "aws_dynamodb_table" "cart" {
  name         = "${var.project_name}-cart-${var.environment}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "userId"
  range_key    = "productId"

  attribute {
    name = "userId"
    type = "S"
  }

  attribute {
    name = "productId"
    type = "S"
  }

  point_in_time_recovery {
    enabled = var.enable_point_in_time_recovery
  }

  tags = { Service = "cart-service" }
}

# 4. Customer Orders Table (order-service)
resource "aws_dynamodb_table" "orders" {
  name         = "${var.project_name}-orders-${var.environment}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "orderId"

  attribute {
    name = "orderId"
    type = "S"
  }

  attribute {
    name = "userId"
    type = "S"
  }

  global_secondary_index {
    name               = "UserOrdersIndex"
    hash_key           = "userId"
    projection_type    = "ALL"
  }

  point_in_time_recovery {
    enabled = var.enable_point_in_time_recovery
  }

  tags = { Service = "order-service" }
}

# 5. Stock Inventory Table (inventory-service)
resource "aws_dynamodb_table" "inventory" {
  name         = "${var.project_name}-inventory-${var.environment}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "productId"

  attribute {
    name = "productId"
    type = "S"
  }

  point_in_time_recovery {
    enabled = var.enable_point_in_time_recovery
  }

  tags = { Service = "inventory-service" }
}

# 6. Notifications Table (notification-service)
resource "aws_dynamodb_table" "notifications" {
  name         = "${var.project_name}-notifications-${var.environment}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "userId"
    type = "S"
  }

  global_secondary_index {
    name               = "UserNotificationsIndex"
    hash_key           = "userId"
    projection_type    = "ALL"
  }

  point_in_time_recovery {
    enabled = var.enable_point_in_time_recovery
  }

  tags = { Service = "notification-service" }
}

# 7. Payments Table (payment-service)
resource "aws_dynamodb_table" "payments" {
  name         = "${var.project_name}-payments-${var.environment}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "paymentId"

  attribute {
    name = "paymentId"
    type = "S"
  }

  attribute {
    name = "orderId"
    type = "S"
  }

  global_secondary_index {
    name               = "OrderPaymentIndex"
    hash_key           = "orderId"
    projection_type    = "ALL"
  }

  point_in_time_recovery {
    enabled = var.enable_point_in_time_recovery
  }

  tags = { Service = "payment-service" }
}
