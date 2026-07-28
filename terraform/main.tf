# ==============================================================================
# EuphoriaX Store - Root Terraform Configuration
# Infrastructure as Code (IaC) for Full-Stack E-Commerce Platform
# ==============================================================================

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.50.0"
    }
  }

  # Optional: Configure S3 backend for remote state storage in collaborative environments
  # backend "s3" {
  #   bucket         = "euphoriax-terraform-state"
  #   key            = "production/terraform.tfstate"
  #   region         = "ap-southeast-1"
  #   encrypt        = true
  #   dynamodb_table = "euphoriax-terraform-locks"
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "Terraform"
      Application = "EuphoriaX-ECommerce"
    }
  }
}
