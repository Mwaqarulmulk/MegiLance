# MegiLance Quick Start - Complete Auto-Deploy Guide

> **⚡ Zero-Configuration AWS Deployment**  
> Get your entire MegiLance platform running on AWS in under 30 minutes with full automation.

---

## 🎯 What This Deploys

This automated workflow deploys a **complete, production-ready freelancing platform**:

### Infrastructure (Terraform)
- ✅ VPC with public/private subnets across 2 availability zones
- ✅ NAT Gateway for outbound connectivity
- ✅ RDS PostgreSQL database (encrypted, multi-AZ capable)
- ✅ ECR repositories for Docker images
- ✅ S3 buckets for assets and uploads
- ✅ AWS Secrets Manager for credentials
- ✅ IAM roles and security groups

### Application Services
- ✅ **Backend API** (FastAPI with Python)
  - JWT authentication
  - Users, projects, proposals, contracts, payments
  - AI-powered matching and price estimation
  - Fraud detection
  - File uploads to S3
- ✅ **Frontend** (Next.js with TypeScript)
  - Modern UI with theme support
  - Client, Freelancer, Admin portals
  - Real-time features ready
- ✅ **Database** with Alembic migrations
- ✅ **ECS Fargate** for container orchestration
- ✅ **CloudWatch** logging and monitoring

---

## 🚀 Prerequisites (One-Time Setup)

### 1. AWS Account Setup

1. **Create AWS Account** (if you don't have one)
   - Go to https://aws.amazon.com/
   - Sign up for free tier (includes 12 months free for many services)

2. **Configure OIDC for GitHub Actions** (Secure, no access keys needed!)
   
   ```bash
   # In AWS CloudShell or local AWS CLI:
   
   # Create OIDC provider
   aws iam create-open-id-connect-provider \
     --url https://token.actions.githubusercontent.com \
     --client-id-list sts.amazonaws.com \
     --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1
   
   # Create IAM role trust policy (replace YOUR_GITHUB_USERNAME/REPO)
   cat > trust-policy.json <<EOF
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Principal": {
           "Federated": "arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):oidc-provider/token.actions.githubusercontent.com"
         },
         "Action": "sts:AssumeRoleWithWebIdentity",
         "Condition": {
           "StringEquals": {
             "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
           },
           "StringLike": {
             "token.actions.githubusercontent.com:sub": "repo:YOUR_GITHUB_USERNAME/MegiLance:*"
           }
         }
       }
     ]
   }
   EOF
   
   # Create the role
   aws iam create-role \
     --role-name GitHubActionsRole \
     --assume-role-policy-document file://trust-policy.json
   
   # Attach admin policy (or create custom policy with minimum permissions)
   aws iam attach-role-policy \
     --role-name GitHubActionsRole \
     --policy-arn arn:aws:iam::aws:policy/AdministratorAccess
   
   # Get the role ARN (save this!)
   aws iam get-role --role-name GitHubActionsRole --query Role.Arn --output text
   ```

### 2. GitHub Secrets Configuration

Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions**

Add these secrets:

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `AWS_OIDC_ROLE_ARN` | `arn:aws:iam::ACCOUNT_ID:role/GitHubActionsRole` | From step above |
| `TF_VAR_db_password` | `YourSecurePassword123!` | Database password (min 8 chars) |

---

## ⚡ Deployment Steps

### Option 1: Auto-Deploy Everything (Recommended)

1. **Go to Actions Tab** in your GitHub repo
2. **Click "Complete AWS Infrastructure Setup"** workflow
3. **Click "Run workflow"**
4. **Set `apply` to `yes`**
5. **Click green "Run workflow" button**

That's it! The workflow will:
- ✅ Provision all AWS infrastructure (5-8 minutes)
- ✅ Create ECS cluster and services
- ✅ Run database migrations
- ✅ Deploy backend and frontend containers
- ✅ Set up monitoring and logging

### Option 2: Step-by-Step Deployment

#### Step 1: Plan Infrastructure (Dry Run)

```bash
# Run workflow with apply=no to see what will be created
# Go to Actions → Complete AWS Infrastructure Setup → Run workflow
# Set apply: no
```

Review the Terraform plan artifact uploaded by the workflow.

#### Step 2: Apply Infrastructure

```bash
# Run workflow again with apply=yes
# Go to Actions → Complete AWS Infrastructure Setup → Run workflow  
# Set apply: yes
```

#### Step 3: Build & Deploy Docker Images

After infrastructure is ready:

```bash
# In your terminal
cd MegiLance

# Build backend image
docker build -t megilance-backend:latest ./backend
docker tag megilance-backend:latest $(aws ecr describe-repositories --repository-names megilance-backend --query 'repositories[0].repositoryUri' --output text):latest

# Push to ECR
aws ecr get-login-password --region us-east-2 | docker login --username AWS --password-stdin $(aws sts get-caller-identity --query Account --output text).dkr.ecr.us-east-2.amazonaws.com
docker push $(aws ecr describe-repositories --repository-names megilance-backend --query 'repositories[0].repositoryUri' --output text):latest

# Build and push frontend (same process)
docker build -t megilance-frontend:latest ./frontend
docker tag megilance-frontend:latest $(aws ecr describe-repositories --repository-names megilance-frontend --query 'repositories[0].repositoryUri' --output text):latest
docker push $(aws ecr describe-repositories --repository-names megilance-frontend --query 'repositories[0].repositoryUri' --output text):latest
```

---

## 🔍 Verify Deployment

### 1. Check Infrastructure

```bash
# Get Terraform outputs
cd infra/terraform
terraform output

# Should show:
# - rds_endpoint
# - ecr_backend
# - ecr_frontend
# - vpc_id
# - assets_bucket
# - uploads_bucket
```

### 2. Check ECS Services

```bash
# List ECS clusters
aws ecs list-clusters

# Describe cluster
aws ecs describe-clusters --clusters megilance-cluster

# List services
aws ecs list-services --cluster megilance-cluster

# Check service health
aws ecs describe-services --cluster megilance-cluster --services megilance-backend-service
```

### 3. Test Backend API

```bash
# Get backend URL (from ECS task public IP or ALB)
# Test health endpoint
curl http://YOUR_BACKEND_URL/api/health/live
curl http://YOUR_BACKEND_URL/api/health/ready

# Test API docs
open http://YOUR_BACKEND_URL/api/docs
```

### 4. Test Frontend

```bash
# Get frontend URL (from App Runner or ECS)
open http://YOUR_FRONTEND_URL
```

---

## 📊 Monitoring & Logs

### CloudWatch Logs

```bash
# View backend logs
aws logs tail /ecs/megilance-backend --follow

# View frontend logs  
aws logs tail /ecs/megilance-frontend --follow
```

### CloudWatch Metrics

- Go to AWS Console → CloudWatch → Dashboards
- View: CPU, Memory, Network, Request counts
- Set up alarms for critical thresholds

---

## 💰 Cost Estimate

Monthly AWS costs (us-east-2, typical usage):

| Service | Configuration | Est. Monthly Cost |
|---------|--------------|-------------------|
| RDS PostgreSQL | db.t3.micro | $15 |
| ECS Fargate | 2 tasks (0.5 vCPU, 1GB RAM) | $20 |
| NAT Gateway | Data transfer | $45 |
| S3 Storage | 10 GB | $0.25 |
| ECR Storage | 5 GB | $0.50 |
| Secrets Manager | 2 secrets | $0.80 |
| **Total** | | **~$82/month** |

**Free Tier Benefits** (first 12 months):
- RDS: 750 hours/month free
- S3: 5 GB free storage
- Data transfer: 100 GB free/month

---

## 🛡️ Security Checklist

- ✅ Database encryption at rest (enabled)
- ✅ Secrets stored in AWS Secrets Manager
- ✅ IAM roles with minimum permissions (configure)
- ✅ Security groups restrict access (configured)
- ⚠️ Enable SSL/TLS for production (to-do)
- ⚠️ Set up WAF for DDoS protection (to-do)
- ⚠️ Configure backup retention (to-do)

---

## 🔧 Troubleshooting

### Workflow Fails with "ResourceAlreadyExists"

**Solution**: Resources from previous run. Run cleanup:

```bash
# In AWS CloudShell:
cd ~/cleanup
./cleanup-resources.sh
```

Then re-run the workflow.

### "Insufficient capacity" error

**Solution**: Try different region or wait 5 minutes and retry.

### Database connection fails

**Solution**: Check security group rules:

```bash
aws ec2 describe-security-groups --group-ids $(terraform output -raw db_security_group_id)
```

Ensure backend security group can access database on port 5432.

---

## 🚀 Next Steps After Deployment

1. **Configure Custom Domain**
   - Register domain (Route 53 or external)
   - Create SSL certificate (ACM)
   - Update ALB listener for HTTPS
   
2. **Set Up CI/CD for Application**
   - Configure auto-deploy on git push
   - Add staging environment
   
3. **Enable Monitoring Alerts**
   - CPU > 80%
   - Memory > 80%
   - Error rate > 1%
   
4. **Configure Backups**
   - Enable RDS automated backups (7-35 days)
   - Set up S3 versioning
   - Create disaster recovery plan
   
5. **Load Testing**
   - Use Apache Bench or k6
   - Test API endpoints
   - Configure auto-scaling based on results

---

## 📚 Additional Resources

- [Full Documentation](docs/README.md)
- [System Architecture](docs/SystemArchitectureDiagrams.md)
- [Database Design](docs/DatabaseDesignSpecs.md)
- [AWS Deployment Details](docs/AWS-Deployment.md)
- [API Documentation](backend/README.md)
- [Frontend Guide](frontend/README.md)

---

## 🆘 Getting Help

- **GitHub Issues**: [Create an issue](https://github.com/ghulam-mujtaba5/MegiLance/issues)
- **Email**: support@megilance.com
- **Discord**: [Join our community](#)

---

**Last Updated**: October 2, 2025  
**Version**: 1.0.0
