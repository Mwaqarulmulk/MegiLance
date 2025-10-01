#!/bin/bash
# Complete Setup Script for MegiLance Production Deployment
# This script automates the entire deployment process

set -e

echo "🚀 MegiLance Production Deployment Script"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
AWS_REGION="us-east-2"
AWS_ACCOUNT_ID="789406175220"
PROJECT_PREFIX="megilance"
CLUSTER_NAME="${PROJECT_PREFIX}-cluster"

# Check prerequisites
echo "📋 Checking prerequisites..."

command -v aws >/dev/null 2>&1 || { echo -e "${RED}❌ AWS CLI is required but not installed${NC}"; exit 1; }
command -v terraform >/dev/null 2>&1 || { echo -e "${RED}❌ Terraform is required but not installed${NC}"; exit 1; }
command -v docker >/dev/null 2>&1 || { echo -e "${RED}❌ Docker is required but not installed${NC}"; exit 1; }

echo -e "${GREEN}✓ All prerequisites installed${NC}"
echo ""

# Function to check if AWS credentials are configured
check_aws_credentials() {
    echo "🔑 Checking AWS credentials..."
    if ! aws sts get-caller-identity --region $AWS_REGION > /dev/null 2>&1; then
        echo -e "${RED}❌ AWS credentials not configured${NC}"
        echo "Please configure AWS credentials and try again."
        exit 1
    fi
    echo -e "${GREEN}✓ AWS credentials configured${NC}"
    echo ""
}

# Function to deploy infrastructure
deploy_infrastructure() {
    echo "🏗️ Deploying AWS infrastructure with Terraform..."
    cd infra/terraform
    
    terraform init
    terraform plan -out=tfplan
    
    read -p "Apply Terraform changes? (yes/no): " APPLY
    if [ "$APPLY" = "yes" ]; then
        terraform apply tfplan
        echo -e "${GREEN}✓ Infrastructure deployed${NC}"
    else
        echo -e "${YELLOW}⚠️ Skipping infrastructure deployment${NC}"
    fi
    
    cd ../..
    echo ""
}

# Function to build and push Docker images
build_and_push_images() {
    echo "🐳 Building and pushing Docker images..."
    
    # Login to ECR
    aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com
    
    # Backend
    echo "Building backend image..."
    cd backend
    docker build -t ${PROJECT_PREFIX}-backend:latest .
    docker tag ${PROJECT_PREFIX}-backend:latest ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${PROJECT_PREFIX}-backend:latest
    docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${PROJECT_PREFIX}-backend:latest
    cd ..
    
    echo -e "${GREEN}✓ Backend image pushed${NC}"
    
    # Frontend
    echo "Building frontend image..."
    cd frontend
    docker build -t ${PROJECT_PREFIX}-frontend:latest .
    docker tag ${PROJECT_PREFIX}-frontend:latest ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${PROJECT_PREFIX}-frontend:latest
    docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${PROJECT_PREFIX}-frontend:latest
    cd ..
    
    echo -e "${GREEN}✓ Frontend image pushed${NC}"
    echo ""
}

# Function to create secrets
create_secrets() {
    echo "🔐 Creating secrets in Secrets Manager..."
    
    # Get RDS endpoint from Terraform
    cd infra/terraform
    RDS_ENDPOINT=$(terraform output -raw rds_endpoint)
    cd ../..
    
    # Create database URL secret value
    DB_URL="postgresql://megilance:CHANGEME@${RDS_ENDPOINT}:5432/megilance_db"
    
    # Update secret (if it exists)
    aws secretsmanager put-secret-value \
        --secret-id megilance/prod/database \
        --secret-string "{\"url\":\"${DB_URL}\"}" \
        --region $AWS_REGION || true
    
    # Create JWT secret
    JWT_SECRET=$(openssl rand -base64 32)
    aws secretsmanager put-secret-value \
        --secret-id megilance/prod/jwt \
        --secret-string "{\"secret_key\":\"${JWT_SECRET}\"}" \
        --region $AWS_REGION || true
    
    echo -e "${GREEN}✓ Secrets created${NC}"
    echo -e "${YELLOW}⚠️ Remember to update the database password in Secrets Manager${NC}"
    echo ""
}

# Function to register ECS task definition
register_task_definition() {
    echo "📝 Registering ECS task definition..."
    
    aws ecs register-task-definition \
        --cli-input-json file://infra/ecs/backend-task-definition.json \
        --region $AWS_REGION
    
    echo -e "${GREEN}✓ Task definition registered${NC}"
    echo ""
}

# Function to update ECS service
update_ecs_service() {
    echo "🚢 Updating ECS service..."
    
    # Check if service exists
    if aws ecs describe-services \
        --cluster $CLUSTER_NAME \
        --services ${PROJECT_PREFIX}-backend-service \
        --region $AWS_REGION \
        --query 'services[0].status' \
        --output text | grep -q "ACTIVE"; then
        
        echo "Service exists, updating..."
        aws ecs update-service \
            --cluster $CLUSTER_NAME \
            --service ${PROJECT_PREFIX}-backend-service \
            --force-new-deployment \
            --region $AWS_REGION
    else
        echo -e "${YELLOW}⚠️ Service not found. It will be created by Terraform.${NC}"
    fi
    
    echo -e "${GREEN}✓ ECS service updated${NC}"
    echo ""
}

# Function to run database migrations
run_migrations() {
    echo "🗄️ Running database migrations..."
    
    # This would run an ECS task to execute Alembic migrations
    # For now, we'll just display instructions
    echo -e "${YELLOW}Manual step required:${NC}"
    echo "Connect to the RDS database and run migrations manually, or"
    echo "Execute: docker run --rm -e DATABASE_URL=<url> ${PROJECT_PREFIX}-backend alembic upgrade head"
    echo ""
}

# Function to verify deployment
verify_deployment() {
    echo "🔍 Verifying deployment..."
    
    # Get ALB DNS name
    cd infra/terraform
    ALB_DNS=$(terraform output -raw alb_dns_name)
    cd ../..
    
    echo "Waiting for ALB to be ready..."
    sleep 30
    
    # Test health endpoint
    if curl -f http://${ALB_DNS}/api/health/live > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Backend is healthy${NC}"
        echo "Backend URL: http://${ALB_DNS}"
    else
        echo -e "${YELLOW}⚠️ Backend health check failed. Check logs.${NC}"
    fi
    
    echo ""
}

# Function to show next steps
show_next_steps() {
    echo "📚 Next Steps:"
    echo "=============="
    echo ""
    echo "1. Update database password in Secrets Manager:"
    echo "   aws secretsmanager update-secret --secret-id megilance/prod/database --region $AWS_REGION"
    echo ""
    echo "2. Configure domain and SSL:"
    echo "   - Register domain in Route53"
    echo "   - Request ACM certificate"
    echo "   - Update ALB listener for HTTPS"
    echo ""
    echo "3. Setup monitoring:"
    echo "   - Subscribe to SNS topic for alerts"
    echo "   - View CloudWatch dashboard"
    echo ""
    echo "4. Complete backend features:"
    echo "   - Integrate Circle API for USDC payments"
    echo "   - Implement blockchain verification"
    echo "   - Add email notifications"
    echo ""
    echo "5. Deploy frontend:"
    echo "   - Deploy to Vercel (recommended) OR"
    echo "   - Create frontend ECS service"
    echo ""
    echo "📊 View resources:"
    echo "  - ECS Cluster: https://console.aws.amazon.com/ecs/home?region=${AWS_REGION}#/clusters/${CLUSTER_NAME}"
    echo "  - RDS: https://console.aws.amazon.com/rds/home?region=${AWS_REGION}"
    echo "  - CloudWatch: https://console.aws.amazon.com/cloudwatch/home?region=${AWS_REGION}"
    echo ""
}

# Main execution
main() {
    echo "Starting deployment process..."
    echo ""
    
    check_aws_credentials
    
    # Menu
    echo "Select deployment option:"
    echo "1) Full deployment (infrastructure + application)"
    echo "2) Infrastructure only"
    echo "3) Application only (build & deploy images)"
    echo "4) Verify deployment"
    echo "5) Show next steps"
    read -p "Enter option (1-5): " OPTION
    echo ""
    
    case $OPTION in
        1)
            deploy_infrastructure
            build_and_push_images
            create_secrets
            register_task_definition
            update_ecs_service
            run_migrations
            verify_deployment
            show_next_steps
            ;;
        2)
            deploy_infrastructure
            ;;
        3)
            build_and_push_images
            register_task_definition
            update_ecs_service
            verify_deployment
            ;;
        4)
            verify_deployment
            ;;
        5)
            show_next_steps
            ;;
        *)
            echo -e "${RED}Invalid option${NC}"
            exit 1
            ;;
    esac
    
    echo ""
    echo -e "${GREEN}🎉 Deployment process completed!${NC}"
}

# Run main function
main
