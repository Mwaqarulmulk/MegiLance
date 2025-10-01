# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "${var.project_prefix}-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = {
    Name        = "${var.project_prefix}-cluster"
    Environment = var.environment
  }
}

# CloudWatch Log Group for Backend
resource "aws_cloudwatch_log_group" "backend" {
  name              = "/ecs/${var.project_prefix}-backend"
  retention_in_days = 7

  tags = {
    Name        = "${var.project_prefix}-backend-logs"
    Environment = var.environment
  }
}

# Security Group for ECS Tasks
resource "aws_security_group" "ecs_tasks" {
  name        = "${var.project_prefix}-ecs-tasks-sg"
  description = "Security group for ECS tasks"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "Allow traffic from ALB"
    from_port       = 8000
    to_port         = 8000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.project_prefix}-ecs-tasks-sg"
    Environment = var.environment
  }
}

# Security Group for ALB
resource "aws_security_group" "alb" {
  name        = "${var.project_prefix}-alb-sg"
  description = "Security group for Application Load Balancer"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "Allow HTTP from internet"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Allow HTTPS from internet"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.project_prefix}-alb-sg"
    Environment = var.environment
  }
}

# Application Load Balancer
resource "aws_lb" "main" {
  name               = "${var.project_prefix}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = [for s in aws_subnet.public : s.id]

  enable_deletion_protection = false
  enable_http2              = true

  tags = {
    Name        = "${var.project_prefix}-alb"
    Environment = var.environment
  }
}

# Target Group for Backend
resource "aws_lb_target_group" "backend" {
  name        = "${var.project_prefix}-backend-tg"
  port        = 8000
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"

  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
    path                = "/api/health/live"
    protocol            = "HTTP"
    matcher             = "200"
  }

  deregistration_delay = 30

  tags = {
    Name        = "${var.project_prefix}-backend-tg"
    Environment = var.environment
  }
}

# ALB Listener (HTTP)
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend.arn
  }
}

# ECS Task Definition for Backend
resource "aws_ecs_task_definition" "backend" {
  family                   = "${var.project_prefix}-backend"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "512"
  memory                   = "1024"
  execution_role_arn       = aws_iam_role.exec_role.arn
  task_role_arn            = aws_iam_role.task_role.arn

  container_definitions = jsonencode([
    {
      name      = "backend"
      image     = "${aws_ecr_repository.backend[0].repository_url}:latest"
      essential = true

      portMappings = [
        {
          containerPort = 8000
          protocol      = "tcp"
          name          = "backend-8000-tcp"
          appProtocol   = "http"
        }
      ]

      environment = [
        {
          name  = "ENVIRONMENT"
          value = "production"
        },
        {
          name  = "AWS_REGION"
          value = var.aws_region
        },
        {
          name  = "LOG_LEVEL"
          value = "INFO"
        },
        {
          name  = "S3_BUCKET_UPLOADS"
          value = aws_s3_bucket.uploads.bucket
        },
        {
          name  = "S3_BUCKET_ASSETS"
          value = aws_s3_bucket.assets.bucket
        }
      ]

      secrets = [
        {
          name      = "DATABASE_URL"
          valueFrom = "${aws_secretsmanager_secret.db_credentials.arn}:url::"
        },
        {
          name      = "SECRET_KEY"
          valueFrom = "${aws_secretsmanager_secret.jwt.arn}:secret_key::"
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.backend.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "backend"
        }
      }

      healthCheck = {
        command     = ["CMD-SHELL", "curl -f http://localhost:8000/api/health/live || exit 1"]
        interval    = 30
        timeout     = 5
        retries     = 3
        startPeriod = 60
      }
    }
  ])

  tags = {
    Name        = "${var.project_prefix}-backend-task"
    Environment = var.environment
  }
}

# ECS Service for Backend
resource "aws_ecs_service" "backend" {
  name            = "${var.project_prefix}-backend-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.backend.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = [for s in aws_subnet.private : s.id]
    security_groups  = [aws_security_group.ecs_tasks.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.backend.arn
    container_name   = "backend"
    container_port   = 8000
  }

  depends_on = [
    aws_lb_listener.http,
    aws_iam_role.exec_role,
    aws_iam_role.task_role
  ]

  tags = {
    Name        = "${var.project_prefix}-backend-service"
    Environment = var.environment
  }
}

# Outputs for ECS resources
output "ecs_cluster_name" {
  value       = aws_ecs_cluster.main.name
  description = "Name of the ECS cluster"
}

output "ecs_cluster_arn" {
  value       = aws_ecs_cluster.main.arn
  description = "ARN of the ECS cluster"
}

output "alb_dns_name" {
  value       = aws_lb.main.dns_name
  description = "DNS name of the Application Load Balancer"
}

output "alb_zone_id" {
  value       = aws_lb.main.zone_id
  description = "Zone ID of the Application Load Balancer"
}

output "backend_service_name" {
  value       = aws_ecs_service.backend.name
  description = "Name of the backend ECS service"
}
