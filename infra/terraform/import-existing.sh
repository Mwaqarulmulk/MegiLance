#!/bin/bash
# Import existing AWS resources into Terraform state

set -e

echo "Importing existing ECR repositories..."
terraform import 'aws_ecr_repository.backend[0]' megilance-backend
terraform import 'aws_ecr_repository.frontend[0]' megilance-frontend

echo "Importing existing Secrets Manager secrets..."
terraform import aws_secretsmanager_secret.db_credentials megilance/prod/database
terraform import aws_secretsmanager_secret.jwt megilance/prod/jwt

echo "Import complete! Run 'terraform plan' to verify."
