resource "aws_cloudwatch_dashboard" "euphoriax_dashboard" {
  dashboard_name = "EuphoriaX-Production-Dashboard"
 
  dashboard_body = jsonencode({
    widgets = [
      {
        type       = "text"
        x          = 0, y = 0, width = 24, height = 2
        properties = { markdown = "# Executive Overview\nHigh-level production monitoring for EuphoriaX" }
      },
      {
        type       = "text", x = 0, y = 2, width = 24, height = 1
        properties = { markdown = "## CloudFront Monitoring" }
      },
      {
        type = "metric", x = 0, y = 3, width = 8, height = 6
        properties = {
          metrics = [["AWS/CloudFront", "Requests", "DistributionId", "E1234567890", "Region", "Global"]]
          view    = "timeSeries", stacked = false, region = "us-east-1", title = "CloudFront Requests"
        }
      },
      {
        type = "metric", x = 8, y = 3, width = 8, height = 6
        properties = {
          metrics = [
            ["AWS/CloudFront", "4xxErrorRate", "DistributionId", "E1234567890", "Region", "Global"],
            [".", "5xxErrorRate", ".", ".", ".", "."]
          ]
          view = "timeSeries", stacked = false, region = "us-east-1", title = "CloudFront Error Rates"
        }
      },
      {
        type = "metric", x = 16, y = 3, width = 8, height = 6
        properties = {
          metrics = [["AWS/CloudFront", "OriginLatency", "DistributionId", "E1234567890", "Region", "Global"]]
          view    = "timeSeries", stacked = false, region = "us-east-1", title = "CloudFront Origin Latency"
        }
      },
      {
        type       = "text", x = 0, y = 9, width = 24, height = 1
        properties = { markdown = "## API Gateway Monitoring" }
      },
      {
        type = "metric", x = 0, y = 10, width = 8, height = 6
        properties = {
          metrics = [["AWS/ApiGateway", "Count", "ApiName", "EuphoriaAPI"]]
          view    = "timeSeries", stacked = false, region = "ap-southeast-2", title = "API Requests"
        }
      },
      {
        type = "metric", x = 8, y = 10, width = 8, height = 6
        properties = {
          metrics = [
            ["AWS/ApiGateway", "4XXError", "ApiName", "EuphoriaAPI"],
            [".", "5XXError", ".", "."]
          ]
          view = "timeSeries", stacked = false, region = "ap-southeast-2", title = "API Errors"
        }
      },
      {
        type = "metric", x = 16, y = 10, width = 8, height = 6
        properties = {
          metrics = [["AWS/ApiGateway", "Latency", "ApiName", "EuphoriaAPI"]]
          view    = "timeSeries", stacked = false, region = "ap-southeast-2", title = "API Latency"
        }
      },
      {
        type       = "text", x = 0, y = 16, width = 24, height = 1
        properties = { markdown = "## Lambda Monitoring" }
      },
      {
        type = "metric", x = 0, y = 17, width = 8, height = 6
        properties = {
          metrics = [
            ["AWS/Lambda", "Invocations", "FunctionName", "euphoriax-auth-service"],
            [".", "Errors", ".", "."],
            [".", "Invocations", "FunctionName", "euphoriax-product-service"],
            [".", "Errors", ".", "."]
          ]
          view = "timeSeries", stacked = false, region = "ap-southeast-2", title = "Lambda Invocations & Errors"
        }
      },
      {
        type = "metric", x = 8, y = 17, width = 8, height = 6
        properties = {
          metrics = [
            ["AWS/Lambda", "Duration", "FunctionName", "euphoriax-auth-service"],
            [".", ".", ".", "euphoriax-product-service"],
            [".", ".", ".", "euphoriax-order-service"]
          ]
          view = "timeSeries", stacked = false, region = "ap-southeast-2", title = "Lambda Duration (Latency)"
        }
      },
      {
        type = "metric", x = 16, y = 17, width = 8, height = 6
        properties = {
          metrics = [
            ["AWS/Lambda", "ConcurrentExecutions"],
            [".", "Throttles"]
          ]
          view = "timeSeries", stacked = false, region = "ap-southeast-2", title = "Lambda Concurrency & Throttling"
        }
      },
      {
        type       = "text", x = 0, y = 23, width = 24, height = 1
        properties = { markdown = "## DynamoDB Monitoring" }
      },
      {
        type = "metric", x = 0, y = 24, width = 12, height = 6
        properties = {
          metrics = [
            ["AWS/DynamoDB", "ConsumedReadCapacityUnits", "TableName", "EuphoriaX-Users"],
            [".", "ConsumedWriteCapacityUnits", ".", "."],
            [".", "ConsumedReadCapacityUnits", "TableName", "EuphoriaX-Products"],
            [".", "ConsumedWriteCapacityUnits", ".", "."],
            [".", "ConsumedReadCapacityUnits", "TableName", "EuphoriaX-Orders"],
            [".", "ConsumedWriteCapacityUnits", ".", "."],
            [".", "ConsumedReadCapacityUnits", "TableName", "EuphoriaX-Cart"],
            [".", "ConsumedWriteCapacityUnits", ".", "."]
          ]
          view = "timeSeries", stacked = false, region = "ap-southeast-2", title = "DynamoDB Capacity Units"
        }
      },
      {
        type = "metric", x = 12, y = 24, width = 12, height = 6
        properties = {
          metrics = [
            ["AWS/DynamoDB", "SuccessfulRequestLatency", "TableName", "EuphoriaX-Products", "Operation", "GetItem"],
            [".", ".", ".", "EuphoriaX-Users", ".", "."]
          ]
          view = "timeSeries", stacked = false, region = "ap-southeast-2", title = "DynamoDB Request Latency"
        }
 
      },
      {
        type       = "text", x = 0, y = 37, width = 24, height = 1
        properties = { markdown = "## CloudWatch Alarm Status\nReal-time status of critical infrastructure alarms" }
      },
      {
        type = "alarm", x = 0, y = 38, width = 24, height = 6
        properties = {
          alarms = [
            "arn:aws:cloudwatch:ap-southeast-2:123456789012:alarm:dummy1",
            "arn:aws:cloudwatch:ap-southeast-2:123456789012:alarm:dummy2"
          ]
          title = "EuphoriaX System Alarms"
        }
      },
      {
        type       = "text", x = 0, y = 44, width = 24, height = 2
        properties = { markdown = "## AWS X-Ray Observability\nDistributed tracing is fully active for all Lambda functions via `Mode=Active`. You can view the **Service Map**, **Traces**, and **Latency Analysis** directly in the AWS X-Ray Console." }
      }
    ]
  })
}
