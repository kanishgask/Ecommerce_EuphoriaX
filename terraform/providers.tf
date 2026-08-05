provider "aws" {
  region = var.aws_region
}

# Aliased provider for CloudFront metrics and alarms which must be in us-east-1
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}
