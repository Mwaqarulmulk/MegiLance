# Import existing AWS resources into Terraform state

$ErrorActionPreference = "Continue"

Write-Host "Importing existing ECR repositories..." -ForegroundColor Cyan
terraform import 'aws_ecr_repository.backend[0]' megilance-backend 2>$null
terraform import 'aws_ecr_repository.frontend[0]' megilance-frontend 2>$null

Write-Host "Importing existing Secrets Manager secrets..." -ForegroundColor Cyan
terraform import aws_secretsmanager_secret.db_credentials megilance/prod/database 2>$null
terraform import aws_secretsmanager_secret.jwt megilance/prod/jwt 2>$null

Write-Host "Importing existing IAM roles..." -ForegroundColor Cyan
terraform import aws_iam_role.apprunner_ecr_access megilance-apprunner-ecr-access 2>$null
terraform import aws_iam_role.task_role megilance-task-role 2>$null
terraform import aws_iam_role.exec_role megilance-exec-role 2>$null

Write-Host "Importing existing RDS DB Subnet Group..." -ForegroundColor Cyan
terraform import aws_db_subnet_group.main megilance-db-subnets 2>$null

Write-Host "Import complete! Run 'terraform plan' to verify." -ForegroundColor Green
