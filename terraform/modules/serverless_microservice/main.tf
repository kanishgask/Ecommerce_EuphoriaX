resource "aws_iam_role" "lambda_role" {
  name = "${var.service_name}-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "basic" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy_attachment" "dynamodb" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess"
}

resource "aws_lambda_function" "lambda" {
  function_name = var.service_name
  role          = aws_iam_role.lambda_role.arn
  handler       = "src/index.handler"
  runtime       = "nodejs18.x"
  filename      = var.lambda_zip_path
  timeout       = 30
  memory_size   = 256

  environment {
    variables = var.environment_variables
  }
}

resource "aws_apigatewayv2_integration" "api" {
  count                  = var.create_api_route ? 1 : 0
  api_id                 = var.api_gateway_id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.lambda.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "api" {
  count     = var.create_api_route ? 1 : 0
  api_id    = var.api_gateway_id
  route_key = var.route_key
  target    = "integrations/${aws_apigatewayv2_integration.api[0].id}"
}

resource "aws_lambda_permission" "api" {
  count         = var.create_api_route ? 1 : 0
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.lambda.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${var.api_gateway_execution_arn}/*/*"
}
