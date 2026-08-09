# ─────────────────────────────────────────────────────────────────────────────
# CloudWatch — Log Groups, Dashboard, and Alarms
# ─────────────────────────────────────────────────────────────────────────────

# ── Log groups (one per Lambda + API Gateway) ─────────────────────────────────

resource "aws_cloudwatch_log_group" "lambda_logs" {
  for_each          = toset(local.services)
  name              = "/aws/lambda/${var.project_name}-${each.key}"
  retention_in_days = 14
  tags              = { Project = var.project_name, Environment = var.environment }
}

resource "aws_cloudwatch_log_group" "api_gateway" {
  name              = "/aws/apigateway/${var.project_name}-api"
  retention_in_days = 14
  tags              = { Project = var.project_name, Environment = var.environment }
}

# ── CloudWatch Dashboard ───────────────────────────────────────────────────────

resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = "${var.project_name}-overview"

  dashboard_body = jsonencode({
    widgets = [
      # Lambda Invocations
      {
        type   = "metric"
        x      = 0; y = 0; width = 24; height = 6
        properties = {
          title  = "Lambda Invocations — All Services"
          period = 300
          stat   = "Sum"
          metrics = [for svc in local.services : [
            "AWS/Lambda", "Invocations",
            "FunctionName", "${var.project_name}-${svc}",
            { label = svc }
          ]]
        }
      },
      # Lambda Errors
      {
        type   = "metric"
        x      = 0; y = 6; width = 12; height = 6
        properties = {
          title  = "Lambda Errors"
          period = 300
          stat   = "Sum"
          metrics = [for svc in local.services : [
            "AWS/Lambda", "Errors",
            "FunctionName", "${var.project_name}-${svc}",
            { label = svc }
          ]]
        }
      },
      # Lambda Duration (P99)
      {
        type   = "metric"
        x      = 12; y = 6; width = 12; height = 6
        properties = {
          title  = "Lambda P99 Duration (ms)"
          period = 300
          stat   = "p99"
          metrics = [for svc in local.services : [
            "AWS/Lambda", "Duration",
            "FunctionName", "${var.project_name}-${svc}",
            { label = svc }
          ]]
        }
      },
      # API Gateway 4xx
      {
        type   = "metric"
        x      = 0; y = 12; width = 12; height = 6
        properties = {
          title   = "API Gateway 4xx Errors"
          period  = 300
          stat    = "Sum"
          metrics = [["AWS/ApiGateway", "4XXError", "ApiName", "${var.project_name}-api"]]
        }
      },
      # API Gateway 5xx
      {
        type   = "metric"
        x      = 12; y = 12; width = 12; height = 6
        properties = {
          title   = "API Gateway 5xx Errors"
          period  = 300
          stat    = "Sum"
          metrics = [["AWS/ApiGateway", "5XXError", "ApiName", "${var.project_name}-api"]]
        }
      },
      # SQS Queue Depths
      {
        type   = "metric"
        x      = 0; y = 18; width = 24; height = 6
        properties = {
          title  = "SQS Queue Depth"
          period = 300
          stat   = "Maximum"
          metrics = [
            ["AWS/SQS", "ApproximateNumberOfMessagesVisible", "QueueName", "${var.project_name}-payment-queue", { label = "payment" }],
            ["AWS/SQS", "ApproximateNumberOfMessagesVisible", "QueueName", "${var.project_name}-inventory-queue", { label = "inventory" }],
            ["AWS/SQS", "ApproximateNumberOfMessagesVisible", "QueueName", "${var.project_name}-notification-queue", { label = "notification" }],
          ]
        }
      },
    ]
  })
}

# ── Alarms ─────────────────────────────────────────────────────────────────────

# Alert if any Lambda has >5 errors in 5 minutes
resource "aws_cloudwatch_metric_alarm" "lambda_errors" {
  for_each            = toset(local.services)
  alarm_name          = "${var.project_name}-${each.key}-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "Errors"
  namespace           = "AWS/Lambda"
  period              = 300
  statistic           = "Sum"
  threshold           = 5
  alarm_description   = "Lambda error rate too high for ${each.key}"
  treat_missing_data  = "notBreaching"

  dimensions = {
    FunctionName = "${var.project_name}-${each.key}"
  }

  tags = { Project = var.project_name, Environment = var.environment }
}

# Alert if DLQ has messages (means something is failing silently)
resource "aws_cloudwatch_metric_alarm" "dlq_messages" {
  for_each = {
    payment      = aws_sqs_queue.payment_queue_dlq.name
    inventory    = aws_sqs_queue.inventory_queue_dlq.name
    notification = aws_sqs_queue.notification_queue_dlq.name
  }

  alarm_name          = "${var.project_name}-${each.key}-dlq-messages"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "ApproximateNumberOfMessagesVisible"
  namespace           = "AWS/SQS"
  period              = 60
  statistic           = "Sum"
  threshold           = 0
  alarm_description   = "Messages in ${each.key} DLQ — investigate immediately"
  treat_missing_data  = "notBreaching"

  dimensions = { QueueName = each.value }

  tags = { Project = var.project_name, Environment = var.environment }
}
