# MegiLance Infrastructure

Complete AWS infrastructure as code for the MegiLance freelancing platform.

## 🏗️ Infrastructure Components

### Network
- VPC with public and private subnets across 2 availability zones
- Internet Gateway for public subnet access
- NAT Gateway for private subnet internet access
- Route tables and security groups

### Compute
- ECS Fargate cluster for containerized applications
- Application Load Balancer for traffic distribution
- Auto-scaling based on CPU/memory metrics

### Database
- RDS PostgreSQL (Multi-AZ for production)
- Automated backups and point-in-time recovery
- Private subnet deployment

### Storage
- S3 buckets for assets and user uploads
- Versioning and encryption enabled
- Lifecycle policies for cost optimization

### Container Registry
- ECR repositories for backend and frontend images
- Automated image scanning for vulnerabilities

### Secrets Management
- AWS Secrets Manager for sensitive data
- Automatic rotation for database credentials
- IAM-based access control

### IAM
- Task execution role for ECS
- Task role with S3 and Secrets Manager permissions
- GitHub OIDC provider for CI/CD

## 📁 Directory Structure

```
infra/
├── terraform/          # Infrastructure as Code
│   ├── main.tf        # Main configuration
│   ├── variables.tf   # Input variables
│   ├── outputs.tf     # Output values
│   ├── network.tf     # VPC, subnets, routing
│   ├── rds.tf         # PostgreSQL database
│   ├── s3_ecr.tf      # Storage and container registry
│   ├── secrets.tf     # Secrets Manager
│   ├── iam.tf         # IAM roles and policies
│   └── providers.tf   # Provider configuration
├── ecs/               # ECS task definitions
│   └── task-definition.json
└── scripts/           # Deployment scripts
    ├── setup-github-oidc.sh
    └── deploy-complete.sh
```

## 🚀 Deployment Options

### Option 1: Automated via GitHub Actions (Recommended)

1. **Set up GitHub OIDC** (one-time):
   ```bash
   # In AWS CloudShell
   git clone https://github.com/ghulam-mujtaba5/MegiLance.git
   cd MegiLance
   chmod +x infra/scripts/setup-github-oidc.sh
   ./infra/scripts/setup-github-oidc.sh
   ```

2. **Configure GitHub Secrets**:
   - Go to repository Settings → Secrets and variables → Actions
   - Add `AWS_OIDC_ROLE_ARN`: `arn:aws:iam::789406175220:role/MegiLance-GitHubOIDC`
   - Add `TF_VAR_db_password`: Your strong database password

3. **Deploy**:
   - Go to Actions → "Complete AWS Infrastructure Setup"
   - Run workflow with `apply: yes`

### Option 2: Manual via CloudShell

```bash
cd ~/MegiLance/infra/terraform

# Create configuration
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values

# Deploy
terraform init
terraform validate
terraform plan -out=tfplan
terraform apply tfplan

# Deploy ECS and application
cd ~/MegiLance/infra/scripts
chmod +x deploy-complete.sh
./deploy-complete.sh
```

## 🔐 Security Best Practices

✅ **Implemented**:
- All secrets in AWS Secrets Manager
- Database in private subnets
- IAM roles instead of access keys
- S3 encryption at rest
- GitHub OIDC (no long-lived credentials)
- Security groups with least privilege
- Non-root container user

⚠️ **Before Production**:
- [ ] Enable AWS CloudTrail
- [ ] Set up AWS Config rules
- [ ] Configure CloudWatch alarms
- [ ] Enable VPC Flow Logs
- [ ] Set up AWS GuardDuty
- [ ] Add WAF rules to ALB
- [ ] Enable MFA for all users
- [ ] Regular security audits

## 📊 Monitoring

### CloudWatch Logs
- ECS task logs: `/ecs/megilance-backend`
- Application logs with structured JSON
- Retention: 7 days (configurable)

### CloudWatch Metrics
- ECS service metrics (CPU, memory, network)
- ALB metrics (request count, latency, error rate)
- RDS metrics (connections, queries, IOPS)
- Custom application metrics

### Alarms (TODO)
```bash
# CPU utilization > 80%
# Memory utilization > 80%
# ALB 5XX errors > 10
# RDS connection count > 80% of max
```

## 💰 Cost Optimization

### Current Architecture (~$83/month)
- RDS db.t4g.micro: ~$15
- ECS Fargate (0.5 vCPU, 1GB): ~$15
- NAT Gateway: ~$32
- ALB: ~$16
- S3 + transfer: ~$5

### Optimization Tips
1. Use Savings Plans for compute
2. Enable S3 Intelligent-Tiering
3. Use Aurora Serverless for variable workloads
4. Consider single-NAT or NAT instances for dev
5. Use Reserved Instances for predictable loads

## 🔄 Disaster Recovery

### Backup Strategy
- **RDS**: Automated daily snapshots (7-day retention)
- **S3**: Versioning enabled, cross-region replication (optional)
- **ECS**: Task definitions versioned
- **Secrets**: Automatic backup to DynamoDB

### Recovery Procedures
1. Database restore from snapshot
2. S3 object versioning recovery
3. ECS service re-deployment from images
4. Terraform state recovery from S3 backend

## 📈 Scaling Strategy

### Horizontal Scaling
```bash
# Scale ECS tasks
aws ecs update-service \
  --cluster megilance-cluster \
  --service megilance-backend-service \
  --desired-count 3
```

### Vertical Scaling
- Modify ECS task definition CPU/memory
- Upgrade RDS instance class
- Use larger NAT Gateway bandwidth

### Auto-scaling (TODO)
- Target tracking based on CPU/memory
- Scheduled scaling for known traffic patterns
- Step scaling for rapid traffic changes

## 🧪 Testing

### Infrastructure Testing
```bash
# Validate Terraform
terraform validate

# Security check
checkov -d infra/terraform

# Cost estimate
infracost breakdown --path infra/terraform
```

### Application Testing
```bash
# Health check
curl http://<ALB-DNS>/api/health

# API documentation
curl http://<ALB-DNS>/api/docs

# Database connectivity
aws ecs execute-command \
  --cluster megilance-cluster \
  --task <TASK-ID> \
  --command "pg_isready -h <RDS-ENDPOINT>"
```

## 🆘 Troubleshooting

### ECS Tasks Not Starting
```bash
# Check service events
aws ecs describe-services \
  --cluster megilance-cluster \
  --services megilance-backend-service

# Check task logs
aws logs tail /ecs/megilance-backend --follow

# Verify secrets access
aws ecs execute-command --cluster megilance-cluster --task <TASK-ID> --command "env"
```

### Database Connection Issues
```bash
# Verify security group rules
aws ec2 describe-security-groups --group-ids <RDS-SG-ID>

# Test from ECS task
aws ecs execute-command \
  --cluster megilance-cluster \
  --task <TASK-ID> \
  --command "pg_isready -h <RDS-ENDPOINT> -p 5432"
```

### ALB Health Check Failures
```bash
# Check target health
aws elbv2 describe-target-health \
  --target-group-arn <TG-ARN>

# Verify health check path
curl http://<ALB-DNS>/api/health
```

## 📚 Resources

- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [ECS Best Practices](https://docs.aws.amazon.com/AmazonECS/latest/bestpracticesguide/)
- [RDS Security](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/UsingWithRDS.html)
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)

## 🤝 Contributing

1. Test changes in dev environment first
2. Run `terraform plan` and review changes
3. Update documentation
4. Submit PR with infrastructure changes

## 📝 License

Part of the MegiLance project - see main repository for license details.
