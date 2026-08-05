# ==========================================
# DynamoDB Tables for Microservices
# ==========================================

locals {
  tables = [
    "EuphoriaX-Users",
    "EuphoriaX-Products",
    "EuphoriaX-Cart",
    "EuphoriaX-Orders",
    "EuphoriaX-Payments",
    "EuphoriaX-Inventory",
    "EuphoriaX-Notifications"
  ]
}

resource "aws_dynamodb_table" "tables" {
  for_each     = toset(local.tables)
  name         = each.key
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }

  tags = {
    Environment = "Production"
    ManagedBy   = "Terraform"
  }
}
