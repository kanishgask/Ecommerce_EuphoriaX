variable "aws_region" {
  description = "AWS region to deploy all resources"
  type        = string
  default     = "ap-southeast-1"
}

variable "project_name" {
  description = "Project name prefix used for all resource names"
  type        = string
  default     = "euphoriax"
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "prod"
}

# ── Lambda ─────────────────────────────────────────────────────────────────────
variable "lambda_runtime" {
  description = "Node.js runtime for all Lambda functions"
  type        = string
  default     = "nodejs20.x"
}

variable "lambda_timeout" {
  description = "Default Lambda timeout in seconds"
  type        = number
  default     = 30
}

variable "lambda_memory_size" {
  description = "Default Lambda memory in MB"
  type        = number
  default     = 256
}

# ── Cognito ────────────────────────────────────────────────────────────────────
variable "cognito_user_pool_name" {
  description = "Cognito User Pool name"
  type        = string
  default     = "euphoriax-users"
}

# ── Notification / SMTP (stored as Lambda env vars) ───────────────────────────
variable "gmail_user" {
  description = "Gmail address used by notification-service to send emails"
  type        = string
  sensitive   = true
  default     = ""
}

variable "gmail_pass" {
  description = "Gmail app password for notification-service"
  type        = string
  sensitive   = true
  default     = ""
}

# ── Frontend S3 ───────────────────────────────────────────────────────────────
variable "frontend_bucket_name" {
  description = "S3 bucket name for the React frontend"
  type        = string
  default     = "euphoriaxbucket"
}
