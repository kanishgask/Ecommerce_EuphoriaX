# ─────────────────────────────────────────────────────────────────────────────
# terraform.tfvars — override defaults here (do NOT commit gmail_pass)
# ─────────────────────────────────────────────────────────────────────────────

aws_region           = "ap-southeast-1"
project_name         = "euphoriax"
environment          = "prod"
lambda_runtime       = "nodejs20.x"
lambda_timeout       = 30
lambda_memory_size   = 256
frontend_bucket_name = "euphoriaxbucket"

# Set these via environment variables or GitHub secrets — never hardcode:
# gmail_user = "your-gmail@gmail.com"
# gmail_pass = "your-app-password"
