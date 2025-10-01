# Import existing AWS resources into Terraform state

$ErrorActionPreference = "Stop"

Write-Host "Importing existing ECR repositories..." -ForegroundColor Cyan
terraform import 'aws_ecr_repository.backend[0]' megilance-backend
terraform import 'aws_ecr_repository.frontend[0]' megilance-frontend

Write-Host "Importing existing Secrets Manager secrets..." -ForegroundColor Cyan
terraform import aws_secretsmanager_secret.db_credentials megilance/prod/database
terraform import aws_secretsmanager_secret.jwt megilance/prod/jwt

Write-Host "Import complete! Run 'terraform plan' to verify." -ForegroundColor Green
