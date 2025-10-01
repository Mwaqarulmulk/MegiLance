This Terraform module provisions core AWS infrastructure for MegiLance:

- VPC with public/private subnets (2 AZs)
- Internet Gateway, NAT Gateway, Route Tables
- RDS PostgreSQL (private)
- S3 buckets for assets and uploads
- Secrets Manager entries for DB credentials and JWT secrets
- ECR repositories for backend/frontend
- ECS Cluster skeleton (task definitions and service left for manual customization)

Usage
-----
1. Install Terraform 1.5+ and AWS CLI.
2. Configure AWS credentials locally or use GitHub Actions OIDC.
3. Initialize and apply:

```bash
cd infra/terraform
terraform init
terraform plan -out tfplan
terraform apply tfplan
```

Security
--------
- Avoid committing secrets. Use input variables or AWS Secrets Manager.
- Prefer GitHub OIDC for CI deployments rather than long-lived keys.

Outputs
-------
- VPC ID, Subnet IDs, RDS endpoint, S3 bucket names, Secrets ARNs, ECR repo URIs

Notes
-----
This is a starting scaffold—review and customize instance classes, backup windows, and tags before applying to production.
