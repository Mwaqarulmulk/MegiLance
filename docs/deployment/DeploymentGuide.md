# MegiLance Deployment Guide

Canonical deployment reference. See `README.md` in this folder for the full docs index.

This document provides comprehensive deployment strategies and configurations for the MegiLance platform across different environments and cloud providers.

---

## 1. Environment Configuration

### Development Environment
```yaml
# docker-compose.dev.yml
version: '3.8'
services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - NEXT_PUBLIC_API_URL=http://localhost:8080
      - NEXT_PUBLIC_AI_API_URL=http://localhost:8000
    volumes:
      - ./frontend:/app
      - /app/node_modules

  spring-backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=dev
      ﻿# Deployment Guide (Backend & Frontend)

      Authoritative procedure for deploying the FastAPI backend to Oracle Always Free VM and the Next.js frontend to DigitalOcean. Aligns with repeatable, infrastructure-as-code-lite approach (scripts + manual guardrails) without external CI runners.

      ## 1. Overview
      | Component | Host | Deployment Method |
      |-----------|------|-------------------|
      | Backend (FastAPI) | Oracle VM (Ubuntu) | Git + Docker Compose + Webhook |
      | Database | Autonomous DB 23ai | Wallet secure connection |
      | Frontend (Next.js) | DigitalOcean App Platform | Git-based auto build |
      | Reverse Proxy | Nginx (container) | Same VM compose stack |

      ## 2. Prerequisites
      | Item | Description |
      |------|------------|
      | Oracle VM | Shape VM.Standard.E2.1.Micro, ports 22/80/443 open |
      | Autonomous DB Wallet | Unzipped locally, ready to scp |
      | SSH Key | Pair added during VM creation (private key local) |
      | Docker & Compose | Installed by provisioning script |
      | Git Access | VM can `git pull` public/private repo (deploy key if private) |

      ## 3. One-Time VM Setup
      1. SSH (once reachable): `ssh -i oracle-vm-ssh.key ubuntu@<PUBLIC_IP>`
      2. System prep (if not auto-run):
      ```
      sudo apt update && sudo apt install -y docker.io docker-compose-plugin unzip python3-pip
      sudo usermod -aG docker ubuntu
      newgrp docker
      ```
      3. Clone repo: `git clone https://github.com/<org>/<repo>.git app && cd app`
      4. Create wallet directory: `mkdir wallet && chmod 500 wallet`
      5. Secure copy wallet & env:
      ```
      scp -i oracle-vm-ssh.key -r oracle-wallet-23ai/* ubuntu@<IP>:/home/ubuntu/app/wallet/
      scp -i oracle-vm-ssh.key backend/.env.production ubuntu@<IP>:/home/ubuntu/app/backend/.env.production
      ```

      ## 4. Minimal Compose Deployment
      ```
      cd app
        }
      ],
      ```
      Health check: `curl http://<IP>/api/health/live`

      ## 5. Logs & Troubleshooting
      | Command | Purpose |
      |---------|---------|
      | `docker ps` | Verify containers running |
      | `docker compose logs -f backend` | Backend logs tail |
      | `docker compose restart backend` | Rolling restart |
      | `docker inspect <cid>` | Env & network inspection |

      ## 6. Webhook Continuous Deployment
      | Step | Action |
      |------|--------|
      | Install hook listener | (Future) small Python/Node service on port 9000 |
      | GitHub webhook | Point to `http://<VM_IP>:9000/webhook` (push events) |
      | Script triggered | Executes `git pull && docker compose ... up -d --build` |
      | Health verification | Script curls `/api/health/ready` and logs result |

      Fallback: Manual redeploy: `ssh` in → `git pull` → compose rebuild.

      ## 7. Frontend Deployment (DigitalOcean)
      1. Create DO App → connect GitHub repo (frontend directory build path)
      2. Set build command: `npm install && npm run build`
      3. Set run command (SSR if needed) or choose static output
      4. Add environment variable: `NEXT_PUBLIC_API_BASE=https://<BACKEND_DOMAIN>/backend`
      5. Provision DO-managed certificate (tick HTTPS)

      ## 8. Domain & DNS
      | Component | Record | Target |
      |----------|--------|--------|
      | Backend apex (e.g. api.example.com) | A | Oracle VM public IP |
      | Frontend (app.example.com) | CNAME | DO app default hostname |

      Add Nginx server_name entries once domain resolves.

      ## 9. SSL/TLS (Backend)
      Initial: optional HTTP only (internal testing)
      Later:
      ```
      sudo apt install -y certbot
      # Map port 80 → temporary standalone cert issuance (or use nginx plugin)
      certbot certonly --standalone -d api.example.com --email admin@example.com --agree-tos --non-interactive
      # Mount /etc/letsencrypt/live/api.example.com/* into nginx container (update compose)
      ```
      Automate renewal via cron (certbot deploy hooks reload nginx container).

      ## 10. Zero-Downtime Strategy (Future)
      | Requirement | Approach |
      |------------|----------|
      | Rolling update | Blue/green via secondary docker-compose file |
      | Health gate | Keep old container until new passes `/api/health/ready` |

      ## 11. Backup & Recovery (DB Focus)
      | Action | Command (Illustrative) |
      |--------|------------------------|
      | Export schema | Data Pump via OCI console or `expdp` (future) |
      | Logical snapshot | Read replica (future tier) |
      | Wallet backup | Encrypted copy stored off-VM |

      ## 12. Performance Tuning Entry Points
      | Layer | Knob |
      |-------|------|
      | Uvicorn | Workers count (1 initially) |
      | DB | Session pool size (limit for 1 GB) |
      | OS | Swap (avoid heavy usage) |

      ## 13. Deployment Verification Checklist
      | Check | Method |
      |-------|-------|
      | Health live | `curl /api/health/live` == 200 |
      | Health ready | `curl /api/health/ready` == 200 |
      | Log errors absent | Review last 100 lines |
      | DB connectivity | Create/read test record |
      | CORS headers | Inspect response to frontend origin |

      ## 14. Rollback Procedure
      1. Identify last known good git commit hash (via `git log`)
      2. `git checkout <hash>`
      3. `docker compose ... up -d --build`
      4. If failure persists, restore previous image (`docker image ls` → run tag)

      ## 15. Security Hardening Roadmap
      | Phase | Control |
      |-------|---------|
      | Short | Fail2ban SSH, ufw restrict to needed ports |
      | Mid | HTTPS enforced, security headers via nginx |
      | Long | WAF / CDN fronting (Cloudflare) |

      ## 16. Operational Metrics (Future)
      | Metric | Collection |
      |--------|-----------|
      | Request latency | Middleware + logs |
      | Error rate | Log parser / future APM |
      | DB pool saturation | Custom instrumentation |

      ## 17. Common Issues
      | Symptom | Cause | Fix |
      |---------|-------|-----|
      | 502 from nginx | Backend not healthy | Check backend logs, restart |
      | Wallet errors | Wrong permissions | `chmod 500 wallet` |
      | High memory | Too many workers | Reduce worker count |

      ---
      Living document; update on each material change to deployment process.
      "environment": [
        {
          "name": "ENVIRONMENT",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "MONGODB_URL",
          "valueFrom": "arn:aws:secretsmanager:REGION:ACCOUNT:secret:megilance/mongodb-url"
        },
        {
          "name": "AWS_ACCESS_KEY_ID",
          "valueFrom": "arn:aws:secretsmanager:REGION:ACCOUNT:secret:megilance/aws-access-key"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/megilance-ai-backend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

### CloudFormation Template
```yaml
AWSTemplateFormatVersion: '2010-09-09'
Description: 'MegiLance Infrastructure'

Parameters:
  Environment:
    Type: String
    Default: prod
    AllowedValues: [dev, staging, prod]
  
Resources:
  # VPC Configuration
  VPC:
    Type: AWS::EC2::VPC
    Properties:
      CidrBlock: 10.0.0.0/16
      EnableDnsHostnames: true
      EnableDnsSupport: true
      Tags:
        - Key: Name
          Value: !Sub '${Environment}-megilance-vpc'

  # Public Subnets
  PublicSubnet1:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref VPC
      AvailabilityZone: !Select [0, !GetAZs '']
      CidrBlock: 10.0.1.0/24
      MapPublicIpOnLaunch: true

  PublicSubnet2:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref VPC
      AvailabilityZone: !Select [1, !GetAZs '']
      CidrBlock: 10.0.2.0/24
      MapPublicIpOnLaunch: true

  # Private Subnets
  PrivateSubnet1:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref VPC
      AvailabilityZone: !Select [0, !GetAZs '']
      CidrBlock: 10.0.10.0/24

  PrivateSubnet2:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref VPC
      AvailabilityZone: !Select [1, !GetAZs '']
      CidrBlock: 10.0.11.0/24

  # Internet Gateway
  InternetGateway:
    Type: AWS::EC2::InternetGateway

  VPCGatewayAttachment:
    Type: AWS::EC2::VPCGatewayAttachment
    Properties:
      VpcId: !Ref VPC
      InternetGatewayId: !Ref InternetGateway

  # RDS Database
  DatabaseSubnetGroup:
    Type: AWS::RDS::DBSubnetGroup
    Properties:
      DBSubnetGroupDescription: Subnet group for RDS database
      SubnetIds:
        - !Ref PrivateSubnet1
        - !Ref PrivateSubnet2

  Database:
    Type: AWS::RDS::DBInstance
    Properties:
      DBInstanceIdentifier: !Sub '${Environment}-megilance-db'
      DBInstanceClass: db.t3.micro
      Engine: postgres
      EngineVersion: '15.4'
      MasterUsername: postgres
      MasterUserPassword: !Ref DBPassword
      AllocatedStorage: 20
      DBSubnetGroupName: !Ref DatabaseSubnetGroup
      VPCSecurityGroups:
        - !Ref DatabaseSecurityGroup
      BackupRetentionPeriod: 7
      MultiAZ: !If [IsProd, true, false]

  # ECS Cluster
  ECSCluster:
    Type: AWS::ECS::Cluster
    Properties:
      ClusterName: !Sub '${Environment}-megilance-cluster'
      CapacityProviders:
        - FARGATE
        - FARGATE_SPOT

  # Application Load Balancer
  ApplicationLoadBalancer:
    Type: AWS::ElasticLoadBalancingV2::LoadBalancer
    Properties:
      Name: !Sub '${Environment}-megilance-alb'
      Scheme: internet-facing
      Type: application
      Subnets:
        - !Ref PublicSubnet1
        - !Ref PublicSubnet2
      SecurityGroups:
        - !Ref ALBSecurityGroup

  # S3 Bucket for file storage
  S3Bucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: !Sub '${Environment}-megilance-files-${AWS::AccountId}'
      PublicAccessBlockConfiguration:
        BlockPublicAcls: true
        BlockPublicPolicy: true
        IgnorePublicAcls: true
        RestrictPublicBuckets: true
      VersioningConfiguration:
        Status: Enabled
      BucketEncryption:
        ServerSideEncryptionConfiguration:
          - ServerSideEncryptionByDefault:
              SSEAlgorithm: AES256

Conditions:
  IsProd: !Equals [!Ref Environment, prod]

Outputs:
  VPCId:
    Description: VPC ID
    Value: !Ref VPC
    Export:
      Name: !Sub '${Environment}-VPC-ID'
  
  DatabaseEndpoint:
    Description: RDS Database Endpoint
    Value: !GetAtt Database.Endpoint.Address
    Export:
      Name: !Sub '${Environment}-DB-Endpoint'
```

---

## 3. Kubernetes Deployment

### Namespace Configuration
```yaml
# namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: megilance
  labels:
    name: megilance
```

### ConfigMap
```yaml
# configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: megilance-config
  namespace: megilance
data:
  spring.profiles.active: "k8s"
  logging.level: "INFO"
  server.port: "8080"
  ai.service.port: "8000"
  frontend.url: "https://megilance.com"
```

### Secrets
```yaml
# secrets.yaml
apiVersion: v1
kind: Secret
metadata:
  name: megilance-secrets
  namespace: megilance
type: Opaque
data:
  database-url: <base64-encoded-database-url>
  jwt-secret: <base64-encoded-jwt-secret>
  mongodb-url: <base64-encoded-mongodb-url>
  aws-access-key: <base64-encoded-aws-access-key>
  aws-secret-key: <base64-encoded-aws-secret-key>
```

### Spring Boot Service Deployment
```yaml
# spring-backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: spring-backend
  namespace: megilance
spec:
  replicas: 3
  selector:
    matchLabels:
      app: spring-backend
  template:
    metadata:
      labels:
        app: spring-backend
    spec:
      containers:
      - name: spring-backend
        image: megilance/spring-backend:latest
        ports:
        - containerPort: 8080
        env:
        - name: SPRING_PROFILES_ACTIVE
          valueFrom:
            configMapKeyRef:
              name: megilance-config
              key: spring.profiles.active
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: megilance-secrets
              key: database-url
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: megilance-secrets
              key: jwt-secret
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /actuator/health
            port: 8080
          initialDelaySeconds: 60
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /actuator/health/readiness
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10

---
apiVersion: v1
kind: Service
metadata:
  name: spring-backend-service
  namespace: megilance
spec:
  selector:
    app: spring-backend
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8080
  type: ClusterIP
```

### AI Service Deployment
```yaml
# ai-backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ai-backend
  namespace: megilance
spec:
  replicas: 2
  selector:
    matchLabels:
      app: ai-backend
  template:
    metadata:
      labels:
        app: ai-backend
    spec:
      containers:
      - name: ai-backend
        image: megilance/ai-backend:latest
        ports:
        - containerPort: 8000
        env:
        - name: ENVIRONMENT
          value: "production"
        - name: MONGODB_URL
          valueFrom:
            secretKeyRef:
              name: megilance-secrets
              key: mongodb-url
        - name: AWS_ACCESS_KEY_ID
          valueFrom:
            secretKeyRef:
              name: megilance-secrets
              key: aws-access-key
        - name: AWS_SECRET_ACCESS_KEY
          valueFrom:
            secretKeyRef:
              name: megilance-secrets
              key: aws-secret-key
        resources:
          requests:
            memory: "1Gi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 60
          periodSeconds: 30

---
apiVersion: v1
kind: Service
metadata:
  name: ai-backend-service
  namespace: megilance
spec:
  selector:
    app: ai-backend
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8000
  type: ClusterIP
```

### Ingress Configuration
```yaml
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: megilance-ingress
  namespace: megilance
  annotations:
    kubernetes.io/ingress.class: "nginx"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/rate-limit: "100"
spec:
  tls:
  - hosts:
    - api.megilance.com
    - ai.megilance.com
    secretName: megilance-tls
  rules:
  - host: api.megilance.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: spring-backend-service
            port:
              number: 80
  - host: ai.megilance.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: ai-backend-service
            port:
              number: 80
```

---

## 4. Oracle Cloud Deployment

### Instance Configuration
```bash
#!/bin/bash
# oracle-cloud-setup.sh

# Update system
sudo yum update -y

# Install Docker
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Setup application directory
sudo mkdir -p /opt/megilance
sudo chown $USER:$USER /opt/megilance

# Configure firewall
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=443/tcp
sudo firewall-cmd --permanent --add-port=8080/tcp
sudo firewall-cmd --permanent --add-port=8000/tcp
sudo firewall-cmd --reload

# Setup SSL certificates (Let's Encrypt)
sudo yum install -y certbot
sudo certbot certonly --standalone -d api.megilance.com -d ai.megilance.com
```

### Oracle Cloud Docker Compose
```yaml
# oracle-docker-compose.yml
version: '3.8'
services:
  spring-backend:
    image: megilance/spring-backend:latest
    restart: always
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=oracle
      - DATABASE_URL=jdbc:oracle:thin:@//localhost:1521/FREEPDB1
      - REDIS_URL=redis://redis:6379
    depends_on:
      - oracle-db
      - redis

  ai-backend:
    image: megilance/ai-backend:latest
    restart: always
    ports:
      - "8000:8000"
    environment:
      - ENVIRONMENT=production
      - MONGODB_URL=mongodb://mongodb:27017/megilance
    depends_on:
      - mongodb

  oracle-db:
    image: container-registry.oracle.com/database/free:latest
    restart: always
    ports:
      - "1521:1521"
    environment:
      - ORACLE_PWD=YourStrongPassword123
      - ORACLE_CHARACTERSET=AL32UTF8
    volumes:
      - oracle_data:/opt/oracle/oradata

  mongodb:
    image: mongo:6
    restart: always
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=password123

  redis:
    image: redis:7-alpine
    restart: always
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data

  nginx:
    image: nginx:alpine
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - /etc/letsencrypt:/etc/letsencrypt
    depends_on:
      - spring-backend
      - ai-backend

volumes:
  oracle_data:
  mongodb_data:
  redis_data:
```

---

## 5. Monitoring and Logging Configuration

### Prometheus Configuration
```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alert_rules.yml"

scrape_configs:
  - job_name: 'megilance-spring'
    static_configs:
      - targets: ['spring-backend:8080']
    metrics_path: '/actuator/prometheus'
    scrape_interval: 10s

  - job_name: 'megilance-ai'
    static_configs:
      - targets: ['ai-backend:8000']
    metrics_path: '/metrics'
    scrape_interval: 10s

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']

  - job_name: 'mongodb'
    static_configs:
      - targets: ['mongodb-exporter:9216']

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093
```

### Grafana Dashboard Configuration
```json
{
  "dashboard": {
    "title": "MegiLance System Overview",
    "panels": [
      {
        "title": "Application Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))",
            "legendFormat": "95th percentile"
          }
        ]
      },
      {
        "title": "Database Connections",
        "type": "graph",
        "targets": [
          {
            "expr": "pg_stat_database_numbackends",
            "legendFormat": "Active Connections"
          }
        ]
      },
      {
        "title": "Error Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "sum(rate(http_requests_total{status=~\"5..\"}[5m])) / sum(rate(http_requests_total[5m])) * 100",
            "legendFormat": "Error Rate %"
          }
        ]
      }
    ]
  }
}
```

---

This deployment guide provides comprehensive configurations for deploying MegiLance across different environments and cloud providers, ensuring scalability, reliability, and proper monitoring.