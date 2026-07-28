# ==============================================================================
# EuphoriaX Store - Amazon Cognito Authentication
# User Pool, App Client, and Role-Based User Groups (ADMIN / USER)
# ==============================================================================

resource "aws_cognito_user_pool" "pool" {
  name                     = "${var.project_name}-user-pool-${var.environment}"
  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]

  password_policy {
    minimum_length    = 8
    require_lowercase = true
    require_numbers   = true
    require_symbols   = false
    require_uppercase = true
  }

  verification_message_template {
    default_email_option = "CONFIRM_WITH_CODE"
    email_subject        = "EuphoriaX Store - Verification Code"
    email_message        = "Your verification code for EuphoriaX is {####}. Never share this code with anyone."
  }

  schema {
    attribute_data_type      = "String"
    developer_only_attribute = false
    mutable                  = true
    name                     = "name"
    required                 = true
    string_attribute_constraints {
      min_length = 1
      max_length = 100
    }
  }

  schema {
    attribute_data_type      = "String"
    developer_only_attribute = false
    mutable                  = true
    name                     = "role"
    required                 = false
    string_attribute_constraints {
      min_length = 1
      max_length = 50
    }
  }

  tags = { Service = "auth-service" }
}

resource "aws_cognito_user_pool_client" "client" {
  name                                 = "${var.project_name}-app-client-${var.environment}"
  user_pool_id                         = aws_cognito_user_pool.pool.id
  generate_secret                      = false
  explicit_auth_flows                  = ["ALLOW_USER_PASSWORD_AUTH", "ALLOW_REFRESH_TOKEN_AUTH", "ALLOW_USER_SRP_AUTH"]
  prevent_user_existence_errors        = "ENABLED"
  access_token_validity                = 60
  id_token_validity                    = 60
  refresh_token_validity               = 30
  token_validity_units {
    access_token  = "minutes"
    id_token      = "minutes"
    refresh_token = "days"
  }
}

# Role-Based User Groups for Access Control
resource "aws_cognito_user_group" "admin" {
  name         = "ADMIN"
  user_pool_id = aws_cognito_user_pool.pool.id
  description  = "Administrator group with full access to EuphoriaX Admin Portal and backend APIs"
  precedence   = 1
}

resource "aws_cognito_user_group" "user" {
  name         = "USER"
  user_pool_id = aws_cognito_user_pool.pool.id
  description  = "Standard customer group for shopping, checkout, and order tracking"
  precedence   = 10
}
