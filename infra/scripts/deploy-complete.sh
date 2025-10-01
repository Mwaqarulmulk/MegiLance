#!/bin/bash
# Complete deployment script for MegiLance
# Run this in AWS CloudShell after Terraform infrastructure is created

set -e

REGION="eu-central-1"
ACCOUNT_ID="789406175220"
CLUSTER_NAME="megilance-cluster"
SERVICE_NAME="megilance-backend-service"
TASK_FAMILY="megilance-backend"
VPC_ID=$(aws ec2 describe-vpcs --filters "Name=tag:Name,Values=megilance-vpc" --query 'Vpcs[0].VpcId' --output text)

echo "🚀 Starting MegiLance deployment..."
echo "VPC ID: $VPC_ID"

# Get subnet IDs
PRIVATE_SUBNETS=$(aws ec2 describe-subnets \
  --filters "Name=vpc-id,Values=$VPC_ID" "Name=tag:Name,Values=*Private*" \
  --query 'Subnets[*].SubnetId' \
  --output text | tr '\t' ',')

PUBLIC_SUBNETS=$(aws ec2 describe-subnets \
  --filters "Name=vpc-id,Values=$VPC_ID" "Name=tag:Name,Values=*Public*" \
  --query 'Subnets[*].SubnetId' \
  --output text | tr '\t' ',')

echo "Private Subnets: $PRIVATE_SUBNETS"
echo "Public Subnets: $PUBLIC_SUBNETS"

# Create ECS Security Group
echo "Creating ECS security group..."
ECS_SG_ID=$(aws ec2 create-security-group \
  --group-name megilance-ecs-sg \
  --description "Security group for MegiLance ECS tasks" \
  --vpc-id $VPC_ID \
  --query 'GroupId' \
  --output text 2>/dev/null || \
  aws ec2 describe-security-groups \
  --filters "Name=group-name,Values=megilance-ecs-sg" "Name=vpc-id,Values=$VPC_ID" \
  --query 'SecurityGroups[0].GroupId' \
  --output text)

echo "ECS Security Group: $ECS_SG_ID"

# Create ALB Security Group
echo "Creating ALB security group..."
ALB_SG_ID=$(aws ec2 create-security-group \
  --group-name megilance-alb-sg \
  --description "Security group for MegiLance ALB" \
  --vpc-id $VPC_ID \
  --query 'GroupId' \
  --output text 2>/dev/null || \
  aws ec2 describe-security-groups \
  --filters "Name=group-name,Values=megilance-alb-sg" "Name=vpc-id,Values=$VPC_ID" \
  --query 'SecurityGroups[0].GroupId' \
  --output text)

echo "ALB Security Group: $ALB_SG_ID"

# Configure security group rules
echo "Configuring security groups..."
aws ec2 authorize-security-group-ingress \
  --group-id $ALB_SG_ID \
  --protocol tcp --port 80 --cidr 0.0.0.0/0 2>/dev/null || echo "ALB HTTP rule exists"

aws ec2 authorize-security-group-ingress \
  --group-id $ALB_SG_ID \
  --protocol tcp --port 443 --cidr 0.0.0.0/0 2>/dev/null || echo "ALB HTTPS rule exists"

aws ec2 authorize-security-group-ingress \
  --group-id $ECS_SG_ID \
  --protocol tcp --port 8000 --source-group $ALB_SG_ID 2>/dev/null || echo "ECS ingress rule exists"

# Allow ECS to reach RDS
RDS_SG_ID=$(aws ec2 describe-security-groups \
  --filters "Name=group-name,Values=megilance-rds-sg" "Name=vpc-id,Values=$VPC_ID" \
  --query 'SecurityGroups[0].GroupId' \
  --output text)

aws ec2 authorize-security-group-ingress \
  --group-id $RDS_SG_ID \
  --protocol tcp --port 5432 --source-group $ECS_SG_ID 2>/dev/null || echo "RDS ingress rule exists"

# Create ECS Cluster
echo "Creating ECS cluster..."
aws ecs create-cluster --cluster-name $CLUSTER_NAME 2>/dev/null || echo "Cluster already exists"

# Create CloudWatch Log Group
echo "Creating CloudWatch log group..."
aws logs create-log-group --log-group-name /ecs/megilance-backend 2>/dev/null || echo "Log group exists"

# Create Application Load Balancer
echo "Creating Application Load Balancer..."
ALB_ARN=$(aws elbv2 create-load-balancer \
  --name megilance-alb \
  --subnets $(echo $PUBLIC_SUBNETS | tr ',' ' ') \
  --security-groups $ALB_SG_ID \
  --query 'LoadBalancers[0].LoadBalancerArn' \
  --output text 2>/dev/null || \
  aws elbv2 describe-load-balancers \
  --names megilance-alb \
  --query 'LoadBalancers[0].LoadBalancerArn' \
  --output text)

echo "ALB ARN: $ALB_ARN"

# Create Target Group
echo "Creating target group..."
TG_ARN=$(aws elbv2 create-target-group \
  --name megilance-backend-tg \
  --protocol HTTP \
  --port 8000 \
  --vpc-id $VPC_ID \
  --target-type ip \
  --health-check-path /api/health \
  --health-check-interval-seconds 30 \
  --healthy-threshold-count 2 \
  --unhealthy-threshold-count 3 \
  --query 'TargetGroups[0].TargetGroupArn' \
  --output text 2>/dev/null || \
  aws elbv2 describe-target-groups \
  --names megilance-backend-tg \
  --query 'TargetGroups[0].TargetGroupArn' \
  --output text)

echo "Target Group ARN: $TG_ARN"

# Create Listener
echo "Creating ALB listener..."
aws elbv2 create-listener \
  --load-balancer-arn $ALB_ARN \
  --protocol HTTP \
  --port 80 \
  --default-actions Type=forward,TargetGroupArn=$TG_ARN 2>/dev/null || echo "Listener exists"

# Register Task Definition
echo "Registering ECS task definition..."
cd ~/MegiLance/infra/ecs
TASK_DEF_ARN=$(aws ecs register-task-definition \
  --cli-input-json file://task-definition.json \
  --query 'taskDefinition.taskDefinitionArn' \
  --output text)

echo "Task Definition: $TASK_DEF_ARN"

# Create ECS Service
echo "Creating ECS service..."
aws ecs create-service \
  --cluster $CLUSTER_NAME \
  --service-name $SERVICE_NAME \
  --task-definition $TASK_FAMILY \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[$PRIVATE_SUBNETS],securityGroups=[$ECS_SG_ID],assignPublicIp=DISABLED}" \
  --load-balancers "targetGroupArn=$TG_ARN,containerName=backend,containerPort=8000" 2>/dev/null || \
  aws ecs update-service \
  --cluster $CLUSTER_NAME \
  --service $SERVICE_NAME \
  --force-new-deployment

# Get ALB DNS name
ALB_DNS=$(aws elbv2 describe-load-balancers \
  --load-balancer-arns $ALB_ARN \
  --query 'LoadBalancers[0].DNSName' \
  --output text)

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Application URL: http://$ALB_DNS"
echo "API Documentation: http://$ALB_DNS/api/docs"
echo ""
echo "To check service status:"
echo "  aws ecs describe-services --cluster $CLUSTER_NAME --services $SERVICE_NAME"
echo ""
echo "To view logs:"
echo "  aws logs tail /ecs/megilance-backend --follow"
