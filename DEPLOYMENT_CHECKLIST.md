# MegiLance Deployment Checklist

## ✅ Pre-Deployment (CRITICAL)

- [ ] **Rotate AWS access keys** (AKIA3PTCGJ72LNCHS7BM was exposed)
  - Go to IAM Console → Users → Security credentials
  - Make key inactive → Delete
  - Never commit keys to code or share in chat

- [ ] **Generate strong database password**
  - Minimum 16 characters
  - Mix of uppercase, lowercase, numbers, symbols
  - Example generator: `openssl rand -base64 24`

- [ ] **Verify GitHub repository access**
  - Repository: ghulam-mujtaba5/MegiLance
  - You have admin access to create secrets
  - GitHub Actions enabled

## 📝 Step 1: GitHub OIDC Setup

- [ ] Open AWS CloudShell
- [ ] Clone repository: `git clone https://github.com/ghulam-mujtaba5/MegiLance.git`
- [ ] Navigate: `cd MegiLance`
- [ ] Make script executable: `chmod +x infra/scripts/setup-github-oidc.sh`
- [ ] Run script: `./infra/scripts/setup-github-oidc.sh`
- [ ] **Copy Role ARN from output**

## 🔐 Step 2: GitHub Secrets Configuration

Go to: https://github.com/ghulam-mujtaba5/MegiLance/settings/secrets/actions

- [ ] Create secret `AWS_OIDC_ROLE_ARN`
  - Value: `arn:aws:iam::789406175220:role/MegiLance-GitHubOIDC`

- [ ] Create secret `TF_VAR_db_password`
  - Value: Your strong database password
  - **SAVE THIS PASSWORD** - you'll need it for database access

## 🏗️ Step 3: Infrastructure Deployment

Go to: https://github.com/ghulam-mujtaba5/MegiLance/actions

- [ ] Click "Complete AWS Infrastructure Setup"
- [ ] Click "Run workflow"
- [ ] Set "Apply Terraform changes" to **yes**
- [ ] Click "Run workflow" button
- [ ] Wait for completion (~20 minutes)
- [ ] Verify all steps passed ✅

### Created Resources (verify in AWS Console):
- [ ] VPC (megilance-vpc)
- [ ] 4 Subnets (2 public, 2 private)
- [ ] Internet Gateway
- [ ] NAT Gateway
- [ ] Route Tables
- [ ] RDS PostgreSQL instance
- [ ] S3 buckets (assets, uploads)
- [ ] ECR repositories
- [ ] Secrets Manager entries
- [ ] IAM roles (task, execution)

## 🚀 Step 4: Application Deployment

Back in AWS CloudShell:

- [ ] Navigate: `cd ~/MegiLance/infra/scripts`
- [ ] Make executable: `chmod +x deploy-complete.sh`
- [ ] Run deployment: `./deploy-complete.sh`
- [ ] Wait for completion (~10 minutes)
- [ ] **Copy ALB DNS name** from output

### Created Resources:
- [ ] ECS Cluster
- [ ] Security Groups
- [ ] Application Load Balancer
- [ ] Target Group
- [ ] ECS Service
- [ ] CloudWatch Log Group

## ✅ Step 5: Verification

- [ ] Health check: `curl http://<ALB-DNS>/api/health`
  - Expected: `{"status": "healthy"}`

- [ ] API docs: Open `http://<ALB-DNS>/api/docs` in browser
  - Expected: Swagger UI with all endpoints

- [ ] Check logs: `aws logs tail /ecs/megilance-backend --follow`
  - Expected: Application startup logs, no errors

- [ ] Database connectivity:
  ```bash
  aws ecs describe-services \
    --cluster megilance-cluster \
    --services megilance-backend-service \
    --query 'services[0].deployments'
  ```
  - Expected: Running count = Desired count

## 📊 Step 6: Monitoring Setup

- [ ] CloudWatch dashboard created
- [ ] Log retention configured (7 days)
- [ ] Verify logs are flowing to CloudWatch
- [ ] Set up email notifications (optional)

## 🔄 Step 7: CI/CD Verification

- [ ] Make a small change to backend code
- [ ] Push to main branch
- [ ] Verify "Deploy Backend to ECS" workflow runs
- [ ] Check deployment completes successfully
- [ ] Verify new version deployed to ECS

## 🌐 Step 8: Frontend Connection

- [ ] Update frontend env: `NEXT_PUBLIC_API_BASE_URL=http://<ALB-DNS>`
- [ ] Deploy frontend (Vercel/Netlify/S3+CloudFront)
- [ ] Test authentication flow
- [ ] Test file upload to S3
- [ ] Test all major features

## 🔒 Step 9: Production Hardening

### Immediate:
- [ ] Enable MFA on AWS root account
- [ ] Enable MFA on IAM user accounts
- [ ] Review security group rules
- [ ] Enable CloudTrail logging
- [ ] Set up billing alerts

### Within 1 week:
- [ ] Add custom domain (Route 53)
- [ ] Add SSL certificate (ACM)
- [ ] Configure HTTPS on ALB
- [ ] Add WAF rules
- [ ] Enable GuardDuty
- [ ] Set up automated backups
- [ ] Configure RDS Multi-AZ

### Within 1 month:
- [ ] Implement auto-scaling policies
- [ ] Set up staging environment
- [ ] Configure automated testing
- [ ] Document runbooks
- [ ] Disaster recovery plan
- [ ] Security audit
- [ ] Performance testing

## 💰 Cost Management

- [ ] Set up AWS Budget ($100/month threshold)
- [ ] Enable Cost Explorer
- [ ] Tag all resources properly
- [ ] Review and optimize instance sizes
- [ ] Consider Reserved Instances for stable workloads

## 📈 Post-Deployment Monitoring (First 48 Hours)

### Hour 1:
- [ ] Monitor CloudWatch logs continuously
- [ ] Test all critical endpoints
- [ ] Verify database connections stable
- [ ] Check memory/CPU usage

### Day 1:
- [ ] Review error logs
- [ ] Check ALB metrics
- [ ] Monitor database performance
- [ ] Test failure scenarios

### Day 2:
- [ ] Review cost accumulation
- [ ] Optimize based on metrics
- [ ] Document any issues found
- [ ] Update monitoring thresholds

## 🎯 Success Criteria

✅ All workflows completed successfully
✅ Application accessible via ALB
✅ Health checks passing
✅ Database connections stable
✅ Logs flowing to CloudWatch
✅ No security group misconfigurations
✅ Secrets properly configured
✅ CI/CD pipeline functional
✅ Frontend connected and working
✅ File uploads working (S3)
✅ Authentication working (JWT)
✅ All major features operational

## 📞 Support Resources

- **CloudWatch Logs**: https://console.aws.amazon.com/cloudwatch/home#logsV2:log-groups
- **ECS Console**: https://console.aws.amazon.com/ecs/home
- **RDS Console**: https://console.aws.amazon.com/rds/home
- **GitHub Actions**: https://github.com/ghulam-mujtaba5/MegiLance/actions

## 🆘 Rollback Plan

If something goes wrong:

```bash
# Stop ECS service
aws ecs update-service \
  --cluster megilance-cluster \
  --service megilance-backend-service \
  --desired-count 0

# Restore database from snapshot (if needed)
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier megilance-db-restored \
  --db-snapshot-identifier <snapshot-id>

# Destroy infrastructure (nuclear option)
cd infra/terraform
terraform destroy
```

## ✅ Deployment Complete!

Congratulations! Your MegiLance platform is now live on AWS.

**Next:** See [docs/PostDeployment.md] for ongoing operations and maintenance.

---

**Deployment Date:** __________________

**Deployed By:** __________________

**ALB URL:** __________________

**Notes:** __________________
