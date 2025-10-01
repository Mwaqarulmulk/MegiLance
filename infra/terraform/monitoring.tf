# CloudWatch Dashboard for MegiLance
resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = "${var.project_prefix}-dashboard"

  dashboard_body = jsonencode({
    widgets = [
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/ECS", "CPUUtilization", "ServiceName", aws_ecs_service.backend.name, "ClusterName", aws_ecs_cluster.main.name],
            [".", "MemoryUtilization", ".", ".", ".", "."]
          ]
          period = 300
          stat   = "Average"
          region = var.aws_region
          title  = "ECS Service Metrics"
        }
      },
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/ApplicationELB", "TargetResponseTime", "LoadBalancer", aws_lb.main.arn_suffix],
            [".", "RequestCount", ".", "."],
            [".", "HTTPCode_Target_4XX_Count", ".", "."],
            [".", "HTTPCode_Target_5XX_Count", ".", "."]
          ]
          period = 300
          stat   = "Sum"
          region = var.aws_region
          title  = "ALB Metrics"
        }
      },
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/RDS", "CPUUtilization", "DBInstanceIdentifier", aws_db_instance.postgres.id],
            [".", "DatabaseConnections", ".", "."],
            [".", "FreeableMemory", ".", "."],
            [".", "FreeStorageSpace", ".", "."]
          ]
          period = 300
          stat   = "Average"
          region = var.aws_region
          title  = "RDS Metrics"
        }
      },
      {
        type = "log"
        properties = {
          query   = "SOURCE '${aws_cloudwatch_log_group.backend.name}' | fields @timestamp, @message | filter @message like /ERROR/ | sort @timestamp desc | limit 20"
          region  = var.aws_region
          title   = "Recent Errors"
        }
      }
    ]
  })
}

# CloudWatch Alarms

# High Error Rate Alarm
resource "aws_cloudwatch_metric_alarm" "high_error_rate" {
  alarm_name          = "${var.project_prefix}-high-error-rate"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "HTTPCode_Target_5XX_Count"
  namespace           = "AWS/ApplicationELB"
  period              = 300
  statistic           = "Sum"
  threshold           = 10
  alarm_description   = "Alert when 5XX error count is high"
  treat_missing_data  = "notBreaching"

  dimensions = {
    LoadBalancer = aws_lb.main.arn_suffix
  }

  alarm_actions = [aws_sns_topic.alerts.arn]
}

# High Response Time Alarm
resource "aws_cloudwatch_metric_alarm" "high_response_time" {
  alarm_name          = "${var.project_prefix}-high-response-time"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "TargetResponseTime"
  namespace           = "AWS/ApplicationELB"
  period              = 300
  statistic           = "Average"
  threshold           = 2
  alarm_description   = "Alert when response time exceeds 2 seconds"
  treat_missing_data  = "notBreaching"

  dimensions = {
    LoadBalancer = aws_lb.main.arn_suffix
  }

  alarm_actions = [aws_sns_topic.alerts.arn]
}

# RDS High CPU Alarm
resource "aws_cloudwatch_metric_alarm" "rds_high_cpu" {
  alarm_name          = "${var.project_prefix}-rds-high-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/RDS"
  period              = 300
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "Alert when RDS CPU is high"
  treat_missing_data  = "notBreaching"

  dimensions = {
    DBInstanceIdentifier = aws_db_instance.postgres.id
  }

  alarm_actions = [aws_sns_topic.alerts.arn]
}

# RDS Low Storage Alarm
resource "aws_cloudwatch_metric_alarm" "rds_low_storage" {
  alarm_name          = "${var.project_prefix}-rds-low-storage"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 1
  metric_name         = "FreeStorageSpace"
  namespace           = "AWS/RDS"
  period              = 300
  statistic           = "Average"
  threshold           = 2000000000  # 2GB in bytes
  alarm_description   = "Alert when RDS free storage is low"
  treat_missing_data  = "notBreaching"

  dimensions = {
    DBInstanceIdentifier = aws_db_instance.postgres.id
  }

  alarm_actions = [aws_sns_topic.alerts.arn]
}

# ECS Service Unhealthy Alarm
resource "aws_cloudwatch_metric_alarm" "ecs_unhealthy_tasks" {
  alarm_name          = "${var.project_prefix}-ecs-unhealthy-tasks"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 2
  metric_name         = "HealthyHostCount"
  namespace           = "AWS/ApplicationELB"
  period              = 60
  statistic           = "Average"
  threshold           = 1
  alarm_description   = "Alert when no healthy ECS tasks are running"
  treat_missing_data  = "breaching"

  dimensions = {
    LoadBalancer = aws_lb.main.arn_suffix
    TargetGroup  = aws_lb_target_group.backend.arn_suffix
  }

  alarm_actions = [aws_sns_topic.alerts.arn]
}

# SNS Topic for Alerts
resource "aws_sns_topic" "alerts" {
  name = "${var.project_prefix}-alerts"

  tags = {
    Name        = "${var.project_prefix}-alerts"
    Environment = var.environment
  }
}

# SNS Topic Subscription (Email)
resource "aws_sns_topic_subscription" "alerts_email" {
  count     = var.alert_email != "" ? 1 : 0
  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "email"
  endpoint  = var.alert_email
}

# Outputs
output "cloudwatch_dashboard_url" {
  value       = "https://console.aws.amazon.com/cloudwatch/home?region=${var.aws_region}#dashboards:name=${aws_cloudwatch_dashboard.main.dashboard_name}"
  description = "URL to the CloudWatch dashboard"
}

output "sns_topic_arn" {
  value       = aws_sns_topic.alerts.arn
  description = "ARN of the SNS topic for alerts"
}
