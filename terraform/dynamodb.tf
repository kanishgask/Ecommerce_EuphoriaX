# ─────────────────────────────────────────────────────────────────────────────
# DynamoDB Tables — one per microservice, PAY_PER_REQUEST billing
# ─────────────────────────────────────────────────────────────────────────────

# Simple tables (no GSIs needed)
resource "aws_dynamodb_table" "users" {
  name         = "EuphoriaX-Users"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }

  point_in_time_recovery { enabled = true }
  tags = { Project = var.project_name, Environment = var.environment }
}

resource "aws_dynamodb_table" "products" {
  name         = "EuphoriaX-Products"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }

  point_in_time_recovery { enabled = true }
  tags = { Project = var.project_name, Environment = var.environment }
}

resource "aws_dynamodb_table" "cart" {
  name         = "EuphoriaX-Cart"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "userId"

  attribute {
    name = "userId"
    type = "S"
  }

  point_in_time_recovery { enabled = true }
  tags = { Project = var.project_name, Environment = var.environment }
}

resource "aws_dynamodb_table" "inventory" {
  name         = "EuphoriaX-Inventory"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "productId"

  attribute {
    name = "productId"
    type = "S"
  }

  point_in_time_recovery { enabled = true }
  tags = { Project = var.project_name, Environment = var.environment }
}

resource "aws_dynamodb_table" "notifications" {
  name         = "EuphoriaX-Notifications"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }

  point_in_time_recovery { enabled = true }
  tags = { Project = var.project_name, Environment = var.environment }
}

# Orders table — GSI on userId so order-service can query by user
resource "aws_dynamodb_table" "orders" {
  name         = "EuphoriaX-Orders"
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
    name            = "UserIdIndex"
    hash_key        = "userId"
    projection_type = "ALL"
  }

  point_in_time_recovery { enabled = true }
  tags = { Project = var.project_name, Environment = var.environment }
}

# Payments table — GSIs on orderId and userId (used by payment.repository.js)
resource "aws_dynamodb_table" "payments" {
  name         = "EuphoriaX-Payments"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "orderId"
    type = "S"
  }

  attribute {
    name = "userId"
    type = "S"
  }

  global_secondary_index {
    name            = "OrderIdIndex"
    hash_key        = "orderId"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "UserIdIndex"
    hash_key        = "userId"
    projection_type = "ALL"
  }

  point_in_time_recovery { enabled = true }
  tags = { Project = var.project_name, Environment = var.environment }
}
