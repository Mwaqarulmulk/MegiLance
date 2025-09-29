# MegiLance Deployment Guide

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
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/megilance_dev
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis

  ai-backend:
    build:
      context: ./ai
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - ENVIRONMENT=development
      - MONGODB_URL=mongodb://mongodb:27017/megilance_ai_dev
      - AWS_S3_BUCKET=megilance-dev-files
    depends_on:
      - mongodb

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=megilance_dev
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  mongodb:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
  mongodb_data:
```

### Production Environment
```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  frontend:
    image: megilance/frontend:latest
    restart: always
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=https://api.megilance.com
      - NEXT_PUBLIC_AI_API_URL=https://ai.megilance.com

  spring-backend:
    image: megilance/spring-backend:latest
    restart: always
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - JWT_SECRET=${JWT_SECRET}
    deploy:
      replicas: 3
      resources:
        limits:
          memory: 1G
        reservations:
          memory: 512M

  ai-backend:
    image: megilance/ai-backend:latest
    restart: always
    environment:
      - ENVIRONMENT=production
      - MONGODB_URL=${MONGODB_URL}
      - AWS_S3_BUCKET=${S3_BUCKET}
    deploy:
      replicas: 2
      resources:
        limits:
          memory: 2G
        reservations:
          memory: 1G

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl/certs
    depends_on:
      - spring-backend
      - ai-backend
```

---

## 2. AWS Deployment Configuration

### ECS Task Definitions

#### Spring Boot Service
```json
{
  "family": "megilance-spring-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "executionRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "spring-backend",
      "image": "ACCOUNT.dkr.ecr.REGION.amazonaws.com/megilance-spring:latest",
      "portMappings": [
        {
          "containerPort": 8080,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "SPRING_PROFILES_ACTIVE",
          "value": "aws"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:REGION:ACCOUNT:secret:megilance/database-url"
        },
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:secretsmanager:REGION:ACCOUNT:secret:megilance/jwt-secret"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/megilance-spring-backend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": [
          "CMD-SHELL",
          "curl -f http://localhost:8080/actuator/health || exit 1"
        ],
        "interval": 30,
        "timeout": 5,
        "retries": 3
      }
    }
  ]
}
```

#### AI Service
```json
{
  "family": "megilance-ai-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "2048",
  "memory": "4096",
  "executionRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "ai-backend",
      "image": "ACCOUNT.dkr.ecr.REGION.amazonaws.com/megilance-ai:latest",
      "portMappings": [
        {
          "containerPort": 8000,
          "protocol": "tcp"
        }
      ],
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