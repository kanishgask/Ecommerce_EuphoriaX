resource "aws_dynamodb_table" "cart" {
  name         = "EuphoriaX-Cart"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id" # Placeholder, we will fix this if terraform plan shows drift

  attribute {
    name = "id"
    type = "S"
  }
  
  lifecycle {
    ignore_changes = [read_capacity, write_capacity]
  }
}

resource "aws_dynamodb_table" "orders" {
  name         = "EuphoriaX-Orders"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }
  
  lifecycle {
    ignore_changes = [read_capacity, write_capacity]
  }
}

resource "aws_dynamodb_table" "products" {
  name         = "EuphoriaX-Products"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }
  
  lifecycle {
    ignore_changes = [read_capacity, write_capacity]
  }
}

resource "aws_dynamodb_table" "users" {
  name         = "EuphoriaX-Users"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }
  
  lifecycle {
    ignore_changes = [read_capacity, write_capacity]
  }
}
