# ⚡ Quick Start: Vercel-Style Auto-Deployment

## 🎉 Your Auto-Deployment is Ready!

Just like Vercel, every time you push code to GitHub, it automatically deploys to AWS!

---

## ✅ What's Already Configured

1. **GitHub Actions Workflows:**
   - `auto-deploy.yml` - Main auto-deployment workflow
   - `preview-deployment.yml` - PR preview environments (coming soon)
   - `deploy-app.yml` - Alternative full deployment

2. **Smart Features:**
   - ✅ Only deploys what changed (backend/frontend/infra)
   - ✅ Automatic testing before deployment
   - ✅ Health checks after deployment
   - ✅ Auto-rollback on failure
   - ✅ Deployment notifications via SNS

3. **Required Secrets (Already Set):**
   - ✅ `AWS_OIDC_ROLE_ARN`
   - ✅ `TF_VAR_db_password`

---

## 🚀 How to Use

### Basic Usage (It Just Works!)

```bash
# 1. Make your changes
echo "console.log('new feature')" >> frontend/app/page.tsx

# 2. Commit and push
git add .
git commit -m "feat: add new feature"
git push origin main

# 3. That's it! 🎉
# GitHub Actions automatically:
# - Runs tests
# - Builds Docker images
# - Deploys to AWS
# - Verifies health
# - Notifies you
```

### Monitor Deployment

**View in GitHub:**
```
https://github.com/ghulam-mujtaba5/MegiLance/actions
```

**Check Status:**
```bash
# Watch in real-time
gh run watch

# Or view logs
aws logs tail /ecs/megilance-backend --follow
```

---

## 📦 Optional: Add Vercel for Frontend

For even faster frontend deployments, integrate with Vercel:

### Step 1: Link Vercel Project

```bash
cd frontend
npm install -g vercel
vercel login
vercel link
```

### Step 2: Get Vercel Credentials

```bash
# Get your Vercel token
# Go to: https://vercel.com/account/tokens
# Create a new token

# Get project details
cat .vercel/project.json
# Copy: orgId and projectId
```

### Step 3: Add GitHub Secrets

Go to: https://github.com/ghulam-mujtaba5/MegiLance/settings/secrets/actions

Add these secrets:
- `VERCEL_TOKEN` = your_vercel_token
- `VERCEL_ORG_ID` = team_xxx or user_xxx
- `VERCEL_PROJECT_ID` = prj_xxx

### Step 4: Done!

Next push will auto-deploy frontend to Vercel! ⚡

---

## 🔧 Advanced Options

### Manual Trigger

Trigger deployment manually:
1. Go to Actions tab
2. Click "🚀 Vercel-Style Auto Deploy"
3. Click "Run workflow"

### Force Full Deployment

```bash
# Via GitHub Actions
# Select "force_deploy" option when running manually

# Or push with specific path
git commit --allow-empty -m "chore: force deploy [deploy-all]"
git push
```

### Deploy Specific Component

```bash
# Only backend changes → Only backend deploys
git add backend/
git commit -m "fix: backend bug"
git push

# Only frontend changes → Only frontend deploys
git add frontend/
git commit -m "feat: frontend update"
git push
```

---

## 📊 Deployment Times

| Component | Time | Can Run in Parallel |
|-----------|------|---------------------|
| Change Detection | ~30s | - |
| Backend Tests | ~3-5 min | ✅ Yes |
| Frontend Tests | ~2-3 min | ✅ Yes |
| Docker Build | ~5-10 min | ✅ Yes |
| ECS Deployment | ~3-5 min | ❌ Sequential |
| Health Checks | ~1-2 min | - |
| **Total** | **~15-25 min** | |

**Compare to Vercel:** ~2-5 minutes  
**Trade-off:** More control, your own infrastructure, full AWS power

---

## 🎯 What Gets Deployed

### Changed `backend/**`
- Runs pytest tests
- Builds backend Docker image
- Pushes to ECR
- Updates ECS service
- Runs health checks

### Changed `frontend/**`
- Runs npm tests & lint
- Builds Next.js production
- Deploys to Vercel (if configured)
- Or pushes to ECR for ECS

### Changed `infra/terraform/**`
- Runs terraform init
- Applies infrastructure changes
- Updates AWS resources

### Changed Multiple
All affected components deploy in parallel!

---

## 🔍 Monitoring & Notifications

### GitHub Actions Summary

After each deployment, you'll see a summary with:
- ✅ What was deployed
- 📦 Image tags used
- 🔗 Deployment URLs
- ⏱️ Deployment time
- ✅ Health check results

### Email Notifications

You'll receive emails via SNS for:
- ✅ Successful deployments
- ❌ Failed deployments
- 🔄 Automatic rollbacks

**Subscribe:**
```bash
aws sns subscribe \
  --topic-arn arn:aws:sns:us-east-2:789406175220:megilance-alerts \
  --protocol email \
  --notification-endpoint your-email@example.com
```

### Real-Time Logs

```bash
# Backend logs
aws logs tail /ecs/megilance-backend --follow

# ECS service status
aws ecs describe-services \
  --cluster megilance-cluster \
  --services megilance-backend-service
```

---

## 🔄 Rollback

### Automatic Rollback

If deployment fails, it automatically:
1. Detects the failure
2. Gets previous task definition
3. Reverts ECS service
4. Sends notification

### Manual Rollback

```bash
# Via GitHub
# Re-run the last successful workflow

# Via AWS CLI
aws ecs update-service \
  --cluster megilance-cluster \
  --service megilance-backend-service \
  --task-definition megilance-backend:PREVIOUS_REV \
  --force-new-deployment
```

---

## 🐛 Troubleshooting

### Deployment Stuck at "Waiting for stability"

```bash
# Check ECS events
aws ecs describe-services \
  --cluster megilance-cluster \
  --services megilance-backend-service \
  --query 'services[0].events[0:5]'

# Check task status
aws ecs describe-tasks \
  --cluster megilance-cluster \
  --tasks $(aws ecs list-tasks --cluster megilance-cluster --query 'taskArns[0]' --output text)
```

### Health Check Failing

```bash
# Get ALB DNS
ALB_DNS=$(aws elbv2 describe-load-balancers \
  --names megilance-alb \
  --query 'LoadBalancers[0].DNSName' \
  --output text)

# Test manually
curl -v http://$ALB_DNS/api/health/live

# Check backend logs
aws logs tail /ecs/megilance-backend --follow
```

### "No changes detected" but I changed files

Make sure you're pushing to `main` branch:
```bash
git status  # Check current branch
git push origin main  # Push to main
```

---

## 📚 Documentation

- **Full Guide:** `docs/AUTO_DEPLOYMENT_GUIDE.md`
- **Implementation Guide:** `IMPLEMENTATION_GUIDE.md`
- **Production Readiness:** `PRODUCTION_READINESS_REPORT.md`
- **Deployment Summary:** `DEPLOYMENT_SUMMARY.md`

---

## 🎓 Best Practices

### 1. Commit Often
```bash
# Small, focused commits
git commit -m "feat: add login button"
git commit -m "fix: resolve validation bug"

# Not this:
git commit -m "various changes"  # Too vague
```

### 2. Use Conventional Commits
```bash
feat:     # New feature
fix:      # Bug fix
docs:     # Documentation
style:    # Formatting
refactor: # Code restructure
test:     # Add tests
chore:    # Maintenance
```

### 3. Test Locally First
```bash
# Backend
cd backend && pytest

# Frontend
cd frontend && npm test && npm run build
```

### 4. Monitor First Deployments
- Watch GitHub Actions logs
- Check CloudWatch dashboard
- Verify health endpoints
- Test key functionality

### 5. Keep Secrets Safe
- Never commit `.env` files
- Use GitHub Secrets
- Rotate credentials regularly

---

## 🎉 Summary

**You now have automatic deployment!**

**What to do:**
1. ✅ Auto-deployment is configured
2. ✅ Just push code to `main` branch
3. ✅ GitHub Actions handles everything
4. ✅ Get notified of results

**Optional enhancements:**
- Add Vercel for faster frontend deploys
- Setup staging environment
- Add more comprehensive tests
- Configure PR previews

**Next push deploys automatically!** 🚀

---

## 🆘 Need Help?

1. Check GitHub Actions logs: https://github.com/ghulam-mujtaba5/MegiLance/actions
2. Review `docs/AUTO_DEPLOYMENT_GUIDE.md`
3. Check CloudWatch logs: `/ecs/megilance-backend`
4. Ask in team chat or create an issue

---

## 🏆 Achievement Unlocked!

**Vercel-Style Auto-Deployment on AWS ✨**

Your project now automatically deploys on every push, just like modern cloud platforms, but with full control of your AWS infrastructure!

Push code → Sit back → It's live! 🎉

---

*Created: October 2, 2025*  
*Auto-deployment status: ✅ ACTIVE*
