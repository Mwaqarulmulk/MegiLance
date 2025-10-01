# MegiLance AWS Deployment Guide

## 🚀 Complete Automated Setup

This guide will help you deploy the entire MegiLance platform to AWS automatically using GitHub Actions and Terraform.

## Prerequisites

1. AWS Account (Account ID: 789406175220)
2. GitHub repository: ghulam-mujtaba5/MegiLance
3. AWS CloudShell access

## Step 1: Secure Your AWS Access (CRITICAL)

⚠️ **IMPORTANT**: You shared AWS access keys in chat. These must be rotated immediately.

### Deactivate Exposed Keys

1. Go to AWS Console → IAM → Users → Your user → Security credentials
2. Find access key `AKIA3PTCGJ72LNCHS7BM`
3. Click "Make inactive" then "Delete"
4. **Never share access keys again**

## Step 2: Set Up GitHub OIDC (One-Time Setup)

Run this script in AWS CloudShell:

```bash
# Clone or upload your repo to CloudShell
git clone https://github.com/ghulam-mujtaba5/MegiLance.git
cd MegiLance

# Run the OIDC setup script
chmod +x infra/scripts/setup-github-oidc.sh
./infra/scripts/setup-github-oidc.sh
```

This script will:
- Create an OIDC provider for GitHub Actions
- Create an IAM role that GitHub can assume
- Output the Role ARN you need

## Step 3: Configure GitHub Secrets

Go to: https://github.com/ghulam-mujtaba5/MegiLance/settings/secrets/actions

Create these secrets:

1. **AWS_OIDC_ROLE_ARN**
   - Value: `arn:aws:iam::789406175220:role/MegiLance-GitHubOIDC`
   - (Use the ARN from Step 2 output)

2. **TF_VAR_db_password**
   - Value: A strong password for PostgreSQL (min 16 characters, mix of letters/numbers/symbols)
   - Example: `M3g!L@nc3-Pr0d-DB-2025!`

## Step 4: Deploy Infrastructure

### Option A: Automatic (via GitHub Actions)

1. Go to: https://github.com/ghulam-mujtaba5/MegiLance/actions
2. Click "Complete AWS Infrastructure Setup"
3. Click "Run workflow"
4. Select "yes" for "Apply Terraform changes"
5. Click "Run workflow"

This will:
- Create VPC, subnets, NAT gateway, Internet Gateway
- Create RDS PostgreSQL database
- Create S3 buckets for assets and uploads
- Create ECR repositories
- Store secrets in AWS Secrets Manager
- Create IAM roles for ECS

### Option B: Manual (via CloudShell)

```bash
cd ~/MegiLance/infra/terraform

# Create variables file
cat > terraform.tfvars <<EOF
aws_region = "eu-central-1"
project_prefix = "megilance"
db_password = "YOUR_STRONG_PASSWORD_HERE"
EOF

# Initialize and apply
terraform init
terraform validate
terraform plan -out=tfplan
terraform apply tfplan

# Save outputs
terraform output > outputs.txt
cat outputs.txt
```

## Step 5: Deploy Backend Application

Once infrastructure is created:

1. Push any code changes to the `main` branch
2. GitHub Actions will automatically:
   - Build the Docker image
   - Push to ECR
   - Update ECS service

Or manually trigger:
- Go to Actions → "Deploy Backend to ECS" → "Run workflow"

## Step 6: Access Your Application

After deployment completes:

```bash
# Get the load balancer URL
aws elbv2 describe-load-balancers \
  --query 'LoadBalancers[?LoadBalancerName==`megilance-alb`].DNSName' \
  --output text
```

Access your API at: `http://<ALB-DNS-NAME>/api/docs`

## Architecture Overview

```
Internet
   ↓
Application Load Balancer (Public Subnets)
   ↓
ECS Fargate Tasks (Private Subnets)
   ↓
RDS PostgreSQL (Private Subnets)
   ↓
S3 Buckets (Assets & Uploads)
```

## Troubleshooting

### Check ECS Service Status
```bash
aws ecs describe-services \
  --cluster megilance-cluster \
  --services megilance-backend-service
```

### View Container Logs
```bash
aws logs tail /ecs/megilance-backend --follow
```

### Check RDS Connectivity
```bash
aws rds describe-db-instances \
  --db-instance-identifier megilance-db
```

### Verify Secrets
```bash
aws secretsmanager get-secret-value \
  --secret-id megilance/prod/database
```

## Cost Estimate

Monthly AWS costs (approximate):
- RDS (db.t4g.micro): ~$15
- ECS Fargate (0.5 vCPU, 1GB): ~$15
- NAT Gateway: ~$32
- ALB: ~$16
- S3 + data transfer: ~$5
- **Total: ~$83/month**

## Security Best Practices

✅ All secrets stored in AWS Secrets Manager
✅ RDS in private subnets (not publicly accessible)
✅ ECS tasks use IAM roles (no hardcoded credentials)
✅ S3 buckets encrypted at rest
✅ GitHub Actions use OIDC (no long-lived keys)

## Next Steps

1. Set up custom domain with Route 53
2. Add SSL certificate with ACM
3. Configure CloudWatch alarms
4. Set up automated backups
5. Add staging environment

## Support

If you encounter issues:
1. Check GitHub Actions logs
2. Check CloudWatch logs: `/ecs/megilance-backend`
3. Review Terraform plan before applying

## Cleanup

To destroy all resources:

```bash
cd infra/terraform
terraform destroy
```

⚠️ This will delete everything including the database!
