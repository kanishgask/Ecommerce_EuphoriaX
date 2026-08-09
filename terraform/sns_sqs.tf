# ─────────────────────────────────────────────────────────────────────────────
# SNS Topics — event bus between microservices
# ─────────────────────────────────────────────────────────────────────────────

resource "aws_sns_topic" "order_events" {
  name = "${var.project_name}-order-events"
  tags = { Project = var.project_name, Environment = var.environment }
}

resource "aws_sns_topic" "payment_events" {
  name = "${var.project_name}-payment-events"
  tags = { Project = var.project_name, Environment = var.environment }
}

resource "aws_sns_topic" "inventory_events" {
  name = "${var.project_name}-inventory-events"
  tags = { Project = var.project_name, Environment = var.environment }
}

# ─────────────────────────────────────────────────────────────────────────────
# SQS Queues — reliable consumers for each event stream
# ─────────────────────────────────────────────────────────────────────────────

# Payment processing queue (order-service → payment-service)
resource "aws_sqs_queue" "payment_queue_dlq" {
  name                      = "${var.project_name}-payment-queue-dlq"
  message_retention_seconds = 1209600 # 14 days
  tags                      = { Project = var.project_name, Environment = var.environment }
}

resource "aws_sqs_queue" "payment_queue" {
  name                       = "${var.project_name}-payment-queue"
  visibility_timeout_seconds = 60
  message_retention_seconds  = 86400
  receive_wait_time_seconds  = 20 # long polling

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.payment_queue_dlq.arn
    maxReceiveCount     = 3
  })

  tags = { Project = var.project_name, Environment = var.environment }
}

# Inventory update queue (order-service → inventory-service)
resource "aws_sqs_queue" "inventory_queue_dlq" {
  name                      = "${var.project_name}-inventory-queue-dlq"
  message_retention_seconds = 1209600
  tags                      = { Project = var.project_name, Environment = var.environment }
}

resource "aws_sqs_queue" "inventory_queue" {
  name                       = "${var.project_name}-inventory-queue"
  visibility_timeout_seconds = 60
  message_retention_seconds  = 86400
  receive_wait_time_seconds  = 20

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.inventory_queue_dlq.arn
    maxReceiveCount     = 3
  })

  tags = { Project = var.project_name, Environment = var.environment }
}

# Notification queue (payment-service → notification-service)
resource "aws_sqs_queue" "notification_queue_dlq" {
  name                      = "${var.project_name}-notification-queue-dlq"
  message_retention_seconds = 1209600
  tags                      = { Project = var.project_name, Environment = var.environment }
}

resource "aws_sqs_queue" "notification_queue" {
  name                       = "${var.project_name}-notification-queue"
  visibility_timeout_seconds = 60
  message_retention_seconds  = 86400
  receive_wait_time_seconds  = 20

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.notification_queue_dlq.arn
    maxReceiveCount     = 3
  })

  tags = { Project = var.project_name, Environment = var.environment }
}

# ─────────────────────────────────────────────────────────────────────────────
# SNS → SQS Subscriptions
# ─────────────────────────────────────────────────────────────────────────────

# order_events → payment_queue
resource "aws_sns_topic_subscription" "order_to_payment" {
  topic_arn = aws_sns_topic.order_events.arn
  protocol  = "sqs"
  endpoint  = aws_sqs_queue.payment_queue.arn
}

# order_events → inventory_queue
resource "aws_sns_topic_subscription" "order_to_inventory" {
  topic_arn = aws_sns_topic.order_events.arn
  protocol  = "sqs"
  endpoint  = aws_sqs_queue.inventory_queue.arn
}

# payment_events → notification_queue
resource "aws_sns_topic_subscription" "payment_to_notification" {
  topic_arn = aws_sns_topic.payment_events.arn
  protocol  = "sqs"
  endpoint  = aws_sqs_queue.notification_queue.arn
}

# ── SQS Queue Policies — allow SNS to send messages ───────────────────────────

resource "aws_sqs_queue_policy" "payment_queue_policy" {
  queue_url = aws_sqs_queue.payment_queue.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "sns.amazonaws.com" }
      Action    = "SQS:SendMessage"
      Resource  = aws_sqs_queue.payment_queue.arn
      Condition = { ArnEquals = { "aws:SourceArn" = aws_sns_topic.order_events.arn } }
    }]
  })
}

resource "aws_sqs_queue_policy" "inventory_queue_policy" {
  queue_url = aws_sqs_queue.inventory_queue.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "sns.amazonaws.com" }
      Action    = "SQS:SendMessage"
      Resource  = aws_sqs_queue.inventory_queue.arn
      Condition = { ArnEquals = { "aws:SourceArn" = aws_sns_topic.order_events.arn } }
    }]
  })
}

resource "aws_sqs_queue_policy" "notification_queue_policy" {
  queue_url = aws_sqs_queue.notification_queue.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "sns.amazonaws.com" }
      Action    = "SQS:SendMessage"
      Resource  = aws_sqs_queue.notification_queue.arn
      Condition = { ArnEquals = { "aws:SourceArn" = aws_sns_topic.payment_events.arn } }
    }]
  })
}

# ── Lambda SQS Event Source Mappings ─────────────────────────────────────────

resource "aws_lambda_event_source_mapping" "payment_trigger" {
  event_source_arn = aws_sqs_queue.payment_queue.arn
  function_name    = aws_lambda_function.services["payment-service"].arn
  batch_size       = 1
  enabled          = true
  depends_on       = [aws_lambda_function.services]
}

resource "aws_lambda_event_source_mapping" "inventory_trigger" {
  event_source_arn = aws_sqs_queue.inventory_queue.arn
  function_name    = aws_lambda_function.services["inventory-service"].arn
  batch_size       = 1
  enabled          = true
  depends_on       = [aws_lambda_function.services]
}

resource "aws_lambda_event_source_mapping" "notification_trigger" {
  event_source_arn = aws_sqs_queue.notification_queue.arn
  function_name    = aws_lambda_function.services["notification-service"].arn
  batch_size       = 1
  enabled          = true
  depends_on       = [aws_lambda_function.services]
}
