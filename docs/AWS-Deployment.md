# MegiLance — AWS Deployment Guide

This guide turns the local Docker Compose setup into a production-ready AWS deployment, aligned with the architecture already captured in SystemArchitectureDiagrams.md and DeploymentGuide.md.

- Compute: ECS Fargate (containers) behind an Application Load Balancer (ALB)
- Database: Amazon RDS for PostgreSQL (Multi-AZ recommended)
- Storage: Amazon S3 for files
- Networking: Dedicated VPC with public and private subnets, NAT Gateway
- Security & Secrets: AWS Secrets Manager, IAM roles, Security Groups, AWS WAF (optional)
- DNS/CDN: Route 53 + CloudFront (recommended) or ALB direct

If you prefer a fully-managed alternative to ECS, consider App Runner for the frontend and/or backend containers. This guide focuses on ECS Fargate as the canonical option.

## 0) Prerequisites

- AWS account with admin or equivalent permissions to create VPC, ECS, RDS, ECR, IAM roles
- Domain in Route 53 (if planning custom domain)
- Local: Docker Desktop, Node 20, and access to this repo
- Secrets and configuration values ready:
  - DATABASE_URL (for SQLAlchemy): e.g. postgresql+psycopg2://USER:PASSWORD@HOST:5432/DB
  - JWT_SECRET
  - AWS_S3_BUCKET (for uploads)
  - NEXT_PUBLIC_BACKEND_URL (used by Next.js rewrites in production)

## 1) Container images (ECR)

1. Create two ECR repositories:
   - megilance-frontend
   - megilance-backend
2. Build and push images from the repo root:
   - Frontend context: `frontend/` (Dockerfile already exists)
   - Backend context: `backend/` (Dockerfile already exists)
3. Tag images as ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com/megilance-frontend:VERSION and .../megilance-backend:VERSION

Notes:
- For the frontend on AWS, switch to a production Next.js build. If you want SSR via Node on ECS, keep the image as-is but ensure `npm run build` runs in the Dockerfile and `npm start` serves the built app. Alternatively, export static and host on S3+CloudFront (requires adapting the project). This guide assumes SSR/Node on ECS.
- The Next.js rewrite is now parameterized with `NEXT_PUBLIC_BACKEND_URL`.

## 2) Networking (VPC)

Create (or reuse) a VPC with:
- 2+ public subnets (ALB)
- 2+ private subnets (ECS tasks and RDS)
- 1+ NAT Gateway for outbound access from private subnets
- Security groups:
  - ALB SG: allow 80/443 from the internet
  - Backend SG: allow 3000/8000 from ALB SG (depending on container port)
  - RDS SG: allow 5432 from Backend SG only

## 3) Database (RDS PostgreSQL)

- Engine: PostgreSQL (matching local dev version where feasible)
- Multi-AZ: recommended for production
- Storage: gp3, start small and enable autoscaling
- Connectivity: in private subnets, SG rules to accept from Backend SG only
- Secret: Store the DB credentials in Secrets Manager and build DATABASE_URL at runtime or store the full URL as a single secret

## 4) Secrets and config (Secrets Manager + SSM)

Create secrets:
- megilance/database-url (or megilance/db-username, megilance/db-password)
- megilance/jwt-secret
- megilance/aws-access-key (optional if task role is sufficient)
- megilance/aws-secret-key (optional if task role is sufficient)

Prefer using task IAM roles instead of long-lived keys. The backend should retrieve secrets via ECS task definitions (secrets section) or load from environment variables.

## 5) ECS Cluster, Services, and Task Definitions

- Cluster: megilance-cluster
- Capacity: FARGATE and optionally FARGATE_SPOT
- Launch type: FARGATE

### Backend task definition
- Image: <ECR>/megilance-backend:VERSION
- CPU/MEM: start small (e.g., 0.5 vCPU/1GB) and autoscale later
- Env vars:
  - DATABASE_URL: from Secrets Manager
  - JWT_SECRET: from Secrets Manager
  - AWS_S3_BUCKET: your bucket name
  - BACKEND_CORS_ORIGINS: ["*"] or your domain(s)
- Port mapping: containerPort 8000
- Log driver: awslogs to /ecs/megilance-backend
- Networking: awsvpc, private subnets, SG allowing from ALB SG only

### Frontend task definition (SSR via Node)
- Image: <ECR>/megilance-frontend:VERSION
- CPU/MEM: start small (e.g., 0.5 vCPU/1GB)
- Env vars:
  - NEXT_ENABLE_PWA=1 (optional)
  - NEXT_PUBLIC_BACKEND_URL=https://api.megilance.com (or ALB DNS for backend service)
- Port mapping: containerPort 3000
- Log driver: awslogs to /ecs/megilance-frontend
- Networking: awsvpc, private subnets, SG allowing from ALB SG only

### Services
- Backend Service: desired count 1–2, behind an internal or internet-facing ALB target group (typically internal if front proxy handles public traffic)
- Frontend Service: desired count 2+, behind an internet-facing ALB target group
- Health checks: /api/health/live (backend), / (frontend) or a custom health endpoint

### ALB listeners and rules
- 80 → redirect to 443
- 443 (TLS):
  - Host header api.megilance.com → Backend target group (port 8000)
  - Host header app.megilance.com or megilance.com → Frontend target group (port 3000)

Certificates: Create ACM certs in us-east-1 for your domains and attach to ALB listener.

## 6) DNS and CDN

- Route 53: create A/AAAA records for your domains → ALB
- Optional CloudFront:
  - For app.megilance.com (Next SSR), CloudFront can front the ALB but adds complexity; you can add WAF at ALB or CloudFront level.
  - For static-only build, prefer S3+CloudFront. That requires a different Docker build strategy and possibly Next export. Not covered here.

## 7) Observability and security hardening

- CloudWatch Logs: enabled in both task definitions
- Metrics and alarms: CPU/Mem for services, RDS CPU/Connections, ALB 5xx
- WAF: attach managed rulesets (OWASP) to ALB or CloudFront
- Backup: RDS automated backups and snapshots
- Least-privilege IAM for ECS task roles; S3 bucket policies with least access

## 8) CI/CD (high level)

- GitHub Actions (or CodeBuild/CodePipeline):
  1) On push to main, build frontend and backend images
  2) Push to ECR
  3) Update ECS services (rolling deploy)
- Required secrets in CI:
  - AWS_ACCOUNT_ID, AWS_REGION
  - ECR repo names
  - GitHub OIDC to AWS or AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY (prefer OIDC)

## 9) Environment variables summary

- Frontend (ECS):
  - NEXT_PUBLIC_BACKEND_URL=https://api.megilance.com
  - NEXT_ENABLE_PWA=1 (optional)
- Backend (ECS):
  - DATABASE_URL=postgresql+psycopg2://USER:PASSWORD@HOST:5432/DB (via Secrets)
  - JWT_SECRET=... (via Secrets)
  - BACKEND_CORS_ORIGINS=["https://app.megilance.com"]
  - AWS_S3_BUCKET=megilance-prod-files

## 10) Region and naming

- Region: us-east-1 appears in existing docs; use that unless you have a strong reason to choose another
- Naming: follow the patterns used in DeploymentGuide.md (e.g., /ecs/megilance-backend logs, ALB name `${Environment}-megilance-alb`)

## Appendix: App Runner alternative

- Pros: simpler ops, automatic HTTPS, scaling
- Cons: less control vs ECS, fewer knobs for VPC networking patterns
- You can deploy frontend and backend separately to App Runner and connect to RDS via VPC connector. Route 53 can map subdomains to each App Runner service.

---

Acceptance checklist:
- [ ] ECR repos created; images pushed
- [ ] VPC with public/private subnets and NAT
- [ ] RDS provisioned; secret(s) stored
- [ ] ECS cluster, task definitions, services deployed
- [ ] ALB listeners and target groups wired; ACM certs attached
- [ ] Route 53 records set
- [ ] Environment variables configured
- [ ] Logs and alarms in place
- [ ] Optional WAF enabled
