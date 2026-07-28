# ==============================================================================
# EuphoriaX Store - Terraform Input Variables
# ==============================================================================

variable "aws_region" {
  description = "AWS region for deploying EuphoriaX resources"
  type        = string
  default     = "ap-southeast-1"
}

variable "project_name" {
  description = "Project identifier used for prefixing and tagging AWS resources"
  type        = string
  default     = "euphoriax"
}

variable "environment" {
  description = "Deployment environment (e.g., dev, staging, production)"
  type        = string
  default     = "production"
}

variable "domain_name" {
  description = "Optional custom domain name for the storefront (e.g., store.euphoriax.com)"
  type        = string
  default     = ""
}

variable "api_stage_name" {
  description = "Stage name for API Gateway deployment"
  type        = string
  default     = "api"
}

variable "enable_point_in_time_recovery" {
  description = "Enable point-in-time recovery (PITR) for all DynamoDB tables"
  type        = bool
  default     = true
}

variable "lambda_runtime" {
  description = "Node.js runtime version for serverless Lambda microservices"
  type        = string
  default     = "nodejs20.x"
}
