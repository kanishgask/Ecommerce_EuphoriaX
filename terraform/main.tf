terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Uncomment to use S3 backend for state (recommended for teams)
  # backend "s3" {
  #   bucket = "euphoriax-terraform-state"
  #   key    = "prod/terraform.tfstate"
  #   region = "ap-southeast-1"
  # }
}

provider "aws" {
  region = var.aws_region
}

# Use current AWS account identity
data "aws_caller_identity" "current" {}
