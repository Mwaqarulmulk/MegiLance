# 🚀 MegiLance Quick Start - Autonomous Deployment

## ⚠️ CRITICAL FIRST STEP: Secure Your Account

**YOU MUST DO THIS IMMEDIATELY:**

Your AWS access keys were exposed in our conversation. Follow these steps NOW:

1. Go to: https://console.aws.amazon.com/iam/home#/users
2. Click on your user
3. Go to "Security credentials" tab
4. Find access key: `AKIA3PTCGJ72LNCHS7BM`
5. Click "Actions" → "Make inactive"
6. Click "Actions" → "Delete"

**✅ DONE? Good. Now let's deploy your platform.**

---

## 🎯 Autonomous Deployment (Copy & Run Commands)

### Step 1: Set Up GitHub OIDC (5 minutes)

Open AWS CloudShell: https://console.aws.amazon.com/cloudshell

```bash
# Clone your repo
git clone https://github.com/ghulam-mujtaba5/MegiLance.git
cd MegiLance

# Run the setup script
chmod +x infra/scripts/setup-github-oidc.sh
./infra/scripts/setup-github-oidc.sh
```

**Copy the Role ARN** that the script outputs. It will look like:
```
arn:aws:iam::789406175220:role/MegiLance-GitHubOIDC
```

### Step 2: Configure GitHub Secrets (2 minutes)

Go to: https://github.com/ghulam-mujtaba5/MegiLance/settings/secrets/actions

Click "New repository secret" and add:

**Secret 1:**
- Name: `AWS_OIDC_ROLE_ARN`
- Value: `arn:aws:iam::789406175220:role/MegiLance-GitHubOIDC`

**Secret 2:**
- Name: `TF_VAR_db_password`
- Value: Create a strong password (example: `M3g!L@nc3-DB-2025-Pr0d!`)

### Step 3: Deploy Infrastructure (20 minutes)

Go to: https://github.com/ghulam-mujtaba5/MegiLance/actions

1. Click "Complete AWS Infrastructure Setup"
2. Click "Run workflow" dropdown
3. Select "main" branch
4. Set "Apply Terraform changes" to **yes**
5. Click green "Run workflow" button

**Wait for completion** (status will show ✅ when done)

### Step 4: Deploy Application (10 minutes)

**Back in AWS CloudShell:**

```bash
cd ~/MegiLance/infra/scripts

# Make deployment script executable
chmod +x deploy-complete.sh

# Run complete deployment
./deploy-complete.sh
```

The script will output your application URL at the end.

### Step 5: Access Your Platform

The script outputs:
```
Application URL: http://megilance-alb-XXXXXXXXXX.eu-central-1.elb.amazonaws.com
API Documentation: http://megilance-alb-XXXXXXXXXX.eu-central-1.elb.amazonaws.com/api/docs
```

**Test it:**
```bash
# Replace with your actual ALB URL
ALB_URL="your-alb-url-here"

# Health check
curl http://$ALB_URL/api/health

# API docs (open in browser)
echo "http://$ALB_URL/api/docs"
```

---

## ✅ That's It!

Your complete MegiLance platform is now running on AWS with:
- ✅ Secure VPC with public/private subnets
- ✅ RDS PostgreSQL database
- ✅ ECS Fargate containers
- ✅ Application Load Balancer
- ✅ S3 buckets for file storage
- ✅ Container registry (ECR)
- ✅ Secrets Manager for credentials
- ✅ CloudWatch logs and monitoring

---

## 🔄 Making Updates

**Backend code changes:**

```bash
# From your local machine
git add backend/
git commit -m "Update backend"
git push origin main
```

GitHub Actions will automatically:
1. Build new Docker image
2. Push to ECR
3. Update ECS service
4. Deploy new version

**Infrastructure changes:**

```bash
# Edit files in infra/terraform/
git add infra/
git commit -m "Update infrastructure"
git push origin main

# Then run the infrastructure workflow again
```

---

## 📊 Monitoring Your Application

**View logs:**
```bash
# In CloudShell
aws logs tail /ecs/megilance-backend --follow
```

**Check service status:**
```bash
aws ecs describe-services \
  --cluster megilance-cluster \
  --services megilance-backend-service
```

**Database info:**
```bash
aws rds describe-db-instances \
  --db-instance-identifier megilance-db \
  --query 'DBInstances[0].[Endpoint.Address,DBInstanceStatus]'
```

---

## 💰 Monthly Cost: ~$83

- RDS (db.t4g.micro): $15
- ECS Fargate: $15
- NAT Gateway: $32
- Load Balancer: $16
- S3 + Data Transfer: $5

---

## 🆘 Common Issues

### "No tasks running"
```bash
# Check logs
aws logs tail /ecs/megilance-backend --follow

# Common fixes:
# 1. Database connection - check RDS security group
# 2. Secrets access - verify IAM role permissions
# 3. Image issues - check ECR repository
```

### "Health checks failing"
```bash
# Test health endpoint directly
ALB_DNS="your-alb-dns"
curl -v http://$ALB_DNS/api/health

# If 502/503, tasks aren't starting
# If 404, wrong health check path
```

### "Can't connect to database"
```bash
# Verify security group allows ECS → RDS
aws ec2 describe-security-groups \
  --filters "Name=group-name,Values=megilance-rds-sg"

# Should show ingress from ECS security group on port 5432
```

---

## 🔒 Security Checklist

- ✅ AWS access keys rotated
- ✅ Database in private subnet
- ✅ Secrets in Secrets Manager
- ✅ IAM roles (no hardcoded credentials)
- ✅ GitHub OIDC (no long-lived keys in CI)
- ⬜ Enable MFA on AWS account
- ⬜ Set up CloudWatch alarms
- ⬜ Configure AWS GuardDuty
- ⬜ Add WAF to ALB
- ⬜ Set up custom domain + SSL

---

## 📞 Need Help?

**Check logs first:**
- ECS: `/ecs/megilance-backend`
- GitHub Actions: Actions tab in your repo
- Terraform: In the workflow run output

**Verify resources:**
```bash
# List all resources
aws resourcegroupstaggingapi get-resources \
  --tag-filters Key=Name,Values=*megilance*
```

---

## 🎉 Next Steps

1. **Set up custom domain**
   - Register domain in Route 53
   - Create SSL certificate in ACM
   - Update ALB listener for HTTPS

2. **Connect frontend**
   - Update `NEXT_PUBLIC_API_BASE_URL` in frontend
   - Deploy frontend to Vercel/S3+CloudFront

3. **Production hardening**
   - Enable CloudWatch alarms
   - Set up AWS Backup
   - Configure auto-scaling
   - Add CI/CD testing stages

4. **Go live!**
   - Run final smoke tests
   - Update DNS records
   - Monitor for first 24 hours
   - Celebrate 🎊

---

**Everything is automated. Just run the commands above and you're live!**
