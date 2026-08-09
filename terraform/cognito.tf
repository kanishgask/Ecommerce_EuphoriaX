# ─────────────────────────────────────────────────────────────────────────────
# Cognito User Pool — used by auth-service, cart-service, payment-service,
# order-service for JWT validation
# ─────────────────────────────────────────────────────────────────────────────

resource "aws_cognito_user_pool" "main" {
  name = "${var.project_name}-users"

  # Allow users to sign in with email
  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]

  password_policy {
    minimum_length                   = 8
    require_lowercase                = true
    require_uppercase                = true
    require_numbers                  = true
    require_symbols                  = true
    temporary_password_validity_days = 7
  }

  # Email verification
  verification_message_template {
    default_email_option = "CONFIRM_WITH_CODE"
    email_subject        = "EuphoriaX - Verify your email"
    email_message        = "Your verification code is {####}"
  }

  # Schema — firstName and lastName match the auth-service user model
  schema {
    attribute_data_type = "String"
    name                = "email"
    required            = true
    mutable             = true

    string_attribute_constraints {
      min_length = 5
      max_length = 256
    }
  }

  schema {
    attribute_data_type = "String"
    name                = "given_name"
    required            = false
    mutable             = true
    string_attribute_constraints {}
  }

  schema {
    attribute_data_type = "String"
    name                = "family_name"
    required            = false
    mutable             = true
    string_attribute_constraints {}
  }

  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }

  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}

# ── App Client (no secret — used by SPA frontend) ─────────────────────────────
resource "aws_cognito_user_pool_client" "web_client" {
  name         = "${var.project_name}-web-client"
  user_pool_id = aws_cognito_user_pool.main.id

  # No client secret — browser-based app
  generate_secret = false

  explicit_auth_flows = [
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_USER_SRP_AUTH",
  ]

  # Token validity
  access_token_validity  = 1   # hours
  id_token_validity      = 1   # hours
  refresh_token_validity = 30  # days

  token_validity_units {
    access_token  = "hours"
    id_token      = "hours"
    refresh_token = "days"
  }

  prevent_user_existence_errors = "ENABLED"
}
