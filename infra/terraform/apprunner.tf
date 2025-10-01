locals {
  # aws_ecr_repository.frontend uses count in s3_ecr.tf, so we must reference a specific instance
  frontend_ecr_url = try(aws_ecr_repository.frontend[0].repository_url, null)
}

variable "create_apprunner_service" {
  description = "Whether to create App Runner service from Terraform"
  type        = bool
  default     = false
}

resource "aws_apprunner_service" "frontend" {
  count        = var.create_apprunner_service && var.create_ecr ? 1 : 0
  service_name = "megilance-frontend-service"

  source_configuration {
    authentication_configuration {
      access_role_arn = aws_iam_role.apprunner_ecr_access.arn
    }

    image_repository {
      image_identifier      = "${local.frontend_ecr_url}:latest"
      image_repository_type = "ECR"

      image_configuration {
        port = "3000"
        runtime_environment_variables = {
          NEXT_PUBLIC_API_BASE_URL = var.api_base_url
        }
      }
    }
    auto_deployments_enabled = true
  }

  health_check_configuration {
    healthy_threshold   = 1
    interval            = 10
    path                = "/"
    protocol            = "HTTP"
    timeout             = 5
    unhealthy_threshold = 5
  }
}

variable "api_base_url" {
  description = "Public base URL of the backend API for frontend"
  type        = string
  default     = ""
}

output "apprunner_service_arn" {
  value       = try(aws_apprunner_service.frontend[0].arn, null)
  description = "App Runner service ARN"
}

output "apprunner_service_url" {
  value       = try(aws_apprunner_service.frontend[0].service_url, null)
  description = "Public URL for the frontend App Runner service"
}
