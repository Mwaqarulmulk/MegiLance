#!/bin/bash
# Import existing AWS resources into Terraform state

set +e  # Don't exit on errors

echo "Importing existing ECR repositories..."
terraform import 'aws_ecr_repository.backend[0]' megilance-backend 2>/dev/null
terraform import 'aws_ecr_repository.frontend[0]' megilance-frontend 2>/dev/null

echo "Importing existing Secrets Manager secrets..."
terraform import aws_secretsmanager_secret.db_credentials megilance/prod/database 2>/dev/null
terraform import aws_secretsmanager_secret.jwt megilance/prod/jwt 2>/dev/null

echo "Importing existing IAM roles..."
terraform import aws_iam_role.apprunner_ecr_access megilance-apprunner-ecr-access 2>/dev/null
terraform import aws_iam_role.task_role megilance-task-role 2>/dev/null
terraform import aws_iam_role.exec_role megilance-exec-role 2>/dev/null

echo "Importing existing RDS DB Subnet Group..."
terraform import aws_db_subnet_group.main megilance-db-subnets 2>/dev/null

echo "Import complete! Run 'terraform plan' to verify."
