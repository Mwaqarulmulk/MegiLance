# MegiLance Implementation Guide
**Complete Step-by-Step Deployment Guide**

---

## Quick Start (5 Minutes)

### Prerequisites
- AWS Account with admin access
- GitHub repository with OIDC configured
- AWS CLI, Terraform, Docker installed locally

### Option 1: Automated Deployment (Recommended)

```bash
# Clone the repository
git clone https://github.com/ghulam-mujtaba5/MegiLance.git
cd MegiLance

# Make the deployment script executable
chmod +x infra/scripts/deploy.sh

# Run the deployment
./infra/scripts/deploy.sh
```

### Option 2: GitHub Actions Deployment

1. Set up GitHub secrets:
   - `AWS_OIDC_ROLE_ARN`
   - `TF_VAR_db_password`
   - `VERCEL_TOKEN` (optional, for frontend)

2. Run infrastructure workflow:
   ```
   Go to Actions → "Complete AWS Infrastructure Setup" → Run workflow
   Input: apply = yes
   ```

3. Run application deployment:
   ```
   Go to Actions → "Complete Application Deployment" → Run workflow
   ```

---

## Detailed Step-by-Step Guide

### Phase 1: Infrastructure Setup (30 minutes)

#### 1.1 Configure AWS Credentials

```bash
# Configure AWS CLI
aws configure
# Enter: Access Key, Secret Key, Region (us-east-2), Output format (json)

# Verify credentials
aws sts get-caller-identity
```

#### 1.2 Deploy Infrastructure with Terraform

```bash
cd infra/terraform

# Initialize Terraform
terraform init

# Review the plan
terraform plan -var="db_password=YourSecurePassword123!"

# Apply (creates VPC, RDS, ECR, Secrets, IAM, ECS, ALB)
terraform apply -var="db_password=YourSecurePassword123!"
```

**Resources Created:**
- ✅ VPC with public/private subnets
- ✅ RDS PostgreSQL instance
- ✅ ECR repositories (backend/frontend)
- ✅ S3 buckets (assets/uploads)
- ✅ Secrets Manager (DB credentials, JWT)
- ✅ IAM roles (ECS task/execution)
- ✅ ECS cluster
- ✅ Application Load Balancer
- ✅ CloudWatch monitoring

#### 1.3 Get Infrastructure Outputs

```bash
# Get important endpoints
terraform output rds_endpoint
terraform output alb_dns_name
terraform output ecr_backend
terraform output ecr_frontend

# Save these for later use
```

### Phase 2: Application Deployment (20 minutes)

#### 2.1 Build and Push Docker Images

```bash
cd ../..  # Back to project root

# Login to ECR
aws ecr get-login-password --region us-east-2 | \
  docker login --username AWS --password-stdin \
  789406175220.dkr.ecr.us-east-2.amazonaws.com

# Build and push backend
cd backend
docker build -t megilance-backend:latest .
docker tag megilance-backend:latest \
  789406175220.dkr.ecr.us-east-2.amazonaws.com/megilance-backend:latest
docker push 789406175220.dkr.ecr.us-east-2.amazonaws.com/megilance-backend:latest
cd ..

# Build and push frontend
cd frontend
docker build -t megilance-frontend:latest .
docker tag megilance-frontend:latest \
  789406175220.dkr.ecr.us-east-2.amazonaws.com/megilance-frontend:latest
docker push 789406175220.dkr.ecr.us-east-2.amazonaws.com/megilance-frontend:latest
cd ..
```

#### 2.2 Register ECS Task Definition

```bash
# Register backend task definition
aws ecs register-task-definition \
  --cli-input-json file://infra/ecs/backend-task-definition.json \
  --region us-east-2
```

#### 2.3 Deploy to ECS

The ECS service is already created by Terraform. Force a new deployment:

```bash
aws ecs update-service \
  --cluster megilance-cluster \
  --service megilance-backend-service \
  --force-new-deployment \
  --region us-east-2

# Wait for service to stabilize
aws ecs wait services-stable \
  --cluster megilance-cluster \
  --services megilance-backend-service \
  --region us-east-2
```

#### 2.4 Run Database Migrations

```bash
# Option 1: Via ECS Task
aws ecs run-task \
  --cluster megilance-cluster \
  --task-definition megilance-backend \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx],assignPublicIp=DISABLED}" \
  --overrides '{"containerOverrides":[{"name":"backend","command":["alembic","upgrade","head"]}]}' \
  --region us-east-2

# Option 2: Via Docker locally (requires VPN to VPC)
docker run --rm \
  -e DATABASE_URL="postgresql://megilance:password@rds-endpoint:5432/megilance_db" \
  megilance-backend:latest \
  alembic upgrade head
```

### Phase 3: Verification (10 minutes)

#### 3.1 Test Backend Health

```bash
# Get ALB DNS name
ALB_DNS=$(aws elbv2 describe-load-balancers \
  --names megilance-alb \
  --query 'LoadBalancers[0].DNSName' \
  --output text \
  --region us-east-2)

# Test health endpoints
curl http://$ALB_DNS/api/health/live
curl http://$ALB_DNS/api/health/ready

# Expected response: {"status": "ok"}
```

#### 3.2 Check ECS Service Status

```bash
aws ecs describe-services \
  --cluster megilance-cluster \
  --services megilance-backend-service \
  --region us-east-2 \
  --query 'services[0].{Status:status,Running:runningCount,Desired:desiredCount}'
```

#### 3.3 View CloudWatch Logs

```bash
# Stream backend logs
aws logs tail /ecs/megilance-backend --follow --region us-east-2

# Or via AWS Console:
# https://console.aws.amazon.com/cloudwatch/home?region=us-east-2#logsV2:log-groups/log-group/$252Fecs$252Fmegilance-backend
```

### Phase 4: Frontend Deployment (15 minutes)

#### Option A: Deploy to Vercel (Recommended)

```bash
cd frontend

# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Set environment variables
vercel env add NEXT_PUBLIC_API_BASE_URL production
# Enter: http://ALB_DNS_FROM_ABOVE

# Deploy
vercel --prod
```

#### Option B: Deploy to ECS

```bash
# Already pushed to ECR in Phase 2
# Create frontend ECS service (add to Terraform or manually via console)
```

### Phase 5: DNS & SSL Setup (30 minutes)

#### 5.1 Register Domain (if needed)

```bash
# In Route53 console or via CLI:
aws route53 create-hosted-zone \
  --name megilance.com \
  --caller-reference $(date +%s) \
  --region us-east-2
```

#### 5.2 Request ACM Certificate

```bash
# Request certificate
aws acm request-certificate \
  --domain-name megilance.com \
  --subject-alternative-names www.megilance.com api.megilance.com \
  --validation-method DNS \
  --region us-east-2

# Get certificate ARN
CERT_ARN=$(aws acm list-certificates \
  --region us-east-2 \
  --query 'CertificateSummaryList[?DomainName==`megilance.com`].CertificateArn' \
  --output text)

# Validate via DNS (add CNAME records shown in console)
```

#### 5.3 Add HTTPS Listener to ALB

```bash
# Get ALB ARN
ALB_ARN=$(aws elbv2 describe-load-balancers \
  --names megilance-alb \
  --query 'LoadBalancers[0].LoadBalancerArn' \
  --output text \
  --region us-east-2)

# Create HTTPS listener
aws elbv2 create-listener \
  --load-balancer-arn $ALB_ARN \
  --protocol HTTPS \
  --port 443 \
  --certificates CertificateArn=$CERT_ARN \
  --default-actions Type=forward,TargetGroupArn=<target-group-arn> \
  --region us-east-2
```

#### 5.4 Create Route53 Records

```bash
# Get hosted zone ID
ZONE_ID=$(aws route53 list-hosted-zones \
  --query 'HostedZones[?Name==`megilance.com.`].Id' \
  --output text | cut -d'/' -f3)

# Get ALB DNS and Zone ID
ALB_ZONE=$(aws elbv2 describe-load-balancers \
  --names megilance-alb \
  --query 'LoadBalancers[0].CanonicalHostedZoneId' \
  --output text \
  --region us-east-2)

# Create A record for api.megilance.com
aws route53 change-resource-record-sets \
  --hosted-zone-id $ZONE_ID \
  --change-batch '{
    "Changes": [{
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "api.megilance.com",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "'$ALB_ZONE'",
          "DNSName": "'$ALB_DNS'",
          "EvaluateTargetHealth": true
        }
      }
    }]
  }'
```

### Phase 6: Monitoring Setup (15 minutes)

#### 6.1 Subscribe to SNS Alerts

```bash
# Get SNS topic ARN
SNS_ARN=$(aws sns list-topics \
  --query 'Topics[?contains(TopicArn, `megilance-alerts`)].TopicArn' \
  --output text \
  --region us-east-2)

# Subscribe your email
aws sns subscribe \
  --topic-arn $SNS_ARN \
  --protocol email \
  --notification-endpoint your-email@example.com \
  --region us-east-2

# Confirm subscription in your email
```

#### 6.2 View CloudWatch Dashboard

```bash
# Get dashboard URL from Terraform output
cd infra/terraform
terraform output cloudwatch_dashboard_url

# Or construct manually:
echo "https://console.aws.amazon.com/cloudwatch/home?region=us-east-2#dashboards:name=megilance-dashboard"
```

#### 6.3 Test Alarms

```bash
# Trigger a test alarm (temporarily set threshold very low)
aws cloudwatch put-metric-alarm \
  --alarm-name megilance-test-alarm \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 1 \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --period 60 \
  --statistic Average \
  --threshold 0.1 \
  --alarm-actions $SNS_ARN \
  --region us-east-2
```

### Phase 7: Complete Missing Features (Varies)

#### 7.1 Integrate Circle API for USDC Payments

```python
# In backend/app/api/v1/payments.py

from circle import CircleClient

client = CircleClient(api_key=settings.circle_api_key)

def process_usdc_payment(amount: float, recipient_wallet: str):
    # Create transfer
    transfer = client.transfers.create(
        source_wallet_id=settings.platform_wallet_id,
        destination_wallet_address=recipient_wallet,
        amount=str(amount),
        currency="USD"
    )
    return transfer
```

#### 7.2 Add Environment Variables

```bash
# Add to Secrets Manager
aws secretsmanager create-secret \
  --name megilance/prod/circle-api-key \
  --secret-string '{"api_key":"your-circle-api-key"}' \
  --region us-east-2

# Update ECS task definition to include the secret
```

#### 7.3 Implement Email Notifications

```python
# In backend/app/core/email.py

import boto3

ses_client = boto3.client('ses', region_name=settings.aws_region)

def send_email(to: str, subject: str, body: str):
    ses_client.send_email(
        Source=settings.ses_from_email,
        Destination={'ToAddresses': [to]},
        Message={
            'Subject': {'Data': subject},
            'Body': {'Html': {'Data': body}}
        }
    )
```

---

## Troubleshooting

### Issue: ECS Service Won't Start

**Symptoms:** Tasks keep stopping, service shows 0 running tasks

**Solutions:**
1. Check CloudWatch logs: `aws logs tail /ecs/megilance-backend --follow`
2. Verify secrets exist and are accessible
3. Check security group allows traffic from ALB
4. Ensure RDS is accessible from ECS tasks

```bash
# Check task stopped reason
aws ecs describe-tasks \
  --cluster megilance-cluster \
  --tasks <task-id> \
  --query 'tasks[0].stopCode'
```

### Issue: Database Connection Failed

**Symptoms:** Backend logs show "connection refused" or "timeout"

**Solutions:**
1. Verify RDS security group allows traffic from ECS security group
2. Check DATABASE_URL secret is correct
3. Ensure RDS is in same VPC as ECS tasks

```bash
# Test connection from ECS task
aws ecs run-task \
  --cluster megilance-cluster \
  --task-definition megilance-backend \
  --launch-type FARGATE \
  --overrides '{"containerOverrides":[{"name":"backend","command":["pg_isready","-h","<rds-endpoint>","-p","5432"]}]}'
```

### Issue: High Response Time

**Symptoms:** API requests are slow (>2s)

**Solutions:**
1. Scale up ECS service: `aws ecs update-service --desired-count 3`
2. Upgrade RDS instance class
3. Add Redis caching
4. Optimize database queries

```bash
# Scale ECS service
aws ecs update-service \
  --cluster megilance-cluster \
  --service megilance-backend-service \
  --desired-count 3 \
  --region us-east-2
```

### Issue: Deployment Failed

**Symptoms:** GitHub Actions workflow failed

**Solutions:**
1. Check workflow logs for specific error
2. Verify AWS credentials are valid
3. Ensure all secrets are set
4. Check if resources already exist (may need to import)

```bash
# Re-run with debugging
export ACTIONS_STEP_DEBUG=true
```

---

## Maintenance

### Daily Tasks
- [ ] Check CloudWatch dashboard
- [ ] Review CloudWatch logs for errors
- [ ] Monitor costs in AWS Cost Explorer

### Weekly Tasks
- [ ] Review SNS alert history
- [ ] Check RDS performance metrics
- [ ] Update dependencies (backend & frontend)
- [ ] Backup verification

### Monthly Tasks
- [ ] Rotate secrets (DB password, JWT secret)
- [ ] Review and optimize costs
- [ ] Security audit (check for vulnerabilities)
- [ ] Load testing
- [ ] Update documentation

---

## Rollback Procedures

### Rollback ECS Deployment

```bash
# Get previous task definition revision
PREVIOUS_REV=$(aws ecs describe-services \
  --cluster megilance-cluster \
  --services megilance-backend-service \
  --region us-east-2 \
  --query 'services[0].deployments[1].taskDefinition' \
  --output text)

# Update service to previous revision
aws ecs update-service \
  --cluster megilance-cluster \
  --service megilance-backend-service \
  --task-definition $PREVIOUS_REV \
  --force-new-deployment \
  --region us-east-2
```

### Rollback Database Migration

```bash
# Downgrade one revision
docker run --rm \
  -e DATABASE_URL="..." \
  megilance-backend:latest \
  alembic downgrade -1

# Or to specific revision
alembic downgrade <revision>
```

### Rollback Infrastructure

```bash
cd infra/terraform

# Review changes
terraform plan -destroy

# Destroy all resources (CAREFUL!)
terraform destroy
```

---

## Cost Optimization

### Current Monthly Cost: ~$102

**Optimization Strategies:**

1. **Use Fargate Spot** (save ~70%)
   ```hcl
   # In ecs.tf
   capacity_provider_strategy {
     capacity_provider = "FARGATE_SPOT"
     weight           = 100
   }
   ```

2. **Scale Down RDS in Non-Peak Hours**
   ```bash
   # Stop RDS during off-hours
   aws rds stop-db-instance --db-instance-identifier megilance-db
   ```

3. **Use S3 Intelligent Tiering**
   ```hcl
   # In s3_ecr.tf
   lifecycle_rule {
     transition {
       storage_class = "INTELLIGENT_TIERING"
     }
   }
   ```

4. **Set CloudWatch Log Retention**
   ```bash
   aws logs put-retention-policy \
     --log-group-name /ecs/megilance-backend \
     --retention-in-days 7
   ```

---

## Next Steps

### Immediate (Today)
1. ✅ Complete infrastructure deployment
2. ✅ Deploy backend to ECS
3. ⏳ Verify all health checks pass
4. ⏳ Subscribe to CloudWatch alerts

### This Week
1. ⏳ Setup domain and SSL
2. ⏳ Deploy frontend to Vercel
3. ⏳ Complete Circle API integration
4. ⏳ Run end-to-end tests

### This Month
1. ⏳ Implement remaining features (chat, notifications)
2. ⏳ Security audit
3. ⏳ Load testing
4. ⏳ Launch to production users

---

## Support & Resources

**Documentation:**
- [AWS ECS Best Practices](https://docs.aws.amazon.com/AmazonECS/latest/bestpracticesguide/)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)

**Team Contacts:**
- Ghulam Mujtaba: AI, Backend, Testing
- Muhammad Waqar: Frontend, Blockchain

**AWS Account:**
- Account ID: 789406175220
- Region: us-east-2
- Console: https://console.aws.amazon.com/

---

*Last Updated: October 2, 2025*
