variable "service_name" {
  type = string
}

variable "lambda_zip_path" {
  type = string
}

variable "api_gateway_id" {
  type    = string
  default = ""
}

variable "api_gateway_execution_arn" {
  type    = string
  default = ""
}

variable "create_api_route" {
  type    = bool
  default = false
}

variable "route_key" {
  type    = string
  default = ""
}

variable "environment_variables" {
  type    = map(string)
  default = {}
}
