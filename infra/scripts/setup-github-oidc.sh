#!/bin/bash
# Script to set up GitHub OIDC provider and IAM role for MegiLance deployment
# Run this in AWS CloudShell after rotating your exposed access keys

set -e

ACCOUNT_ID="789406175220"
REPO_OWNER="ghulam-mujtaba5"
REPO_NAME="MegiLance"
ROLE_NAME="MegiLance-GitHubOIDC"
REGION="eu-central-1"

echo "Setting up GitHub OIDC provider and IAM role for ${REPO_OWNER}/${REPO_NAME}..."

# Create OIDC provider (ignore error if already exists)
echo "Creating OIDC provider..."
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com \
  --thumbprint-list a031c46782e6e6c662c2c87c76da9aa62ccabd8e 2>/dev/null || echo "OIDC provider already exists"

# Create trust policy
cat > /tmp/trust-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {
      "Federated": "arn:aws:iam::${ACCOUNT_ID}:oidc-provider/token.actions.githubusercontent.com"
    },
    "Action": "sts:AssumeRoleWithWebIdentity",
    "Condition": {
      "StringEquals": {
        "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
      },
      "StringLike": {
        "token.actions.githubusercontent.com:sub": "repo:${REPO_OWNER}/${REPO_NAME}:*"
      }
    }
  }]
}
EOF

# Create role
echo "Creating IAM role ${ROLE_NAME}..."
aws iam create-role \
  --role-name ${ROLE_NAME} \
  --assume-role-policy-document file:///tmp/trust-policy.json \
  --description "GitHub Actions OIDC role for MegiLance deployment"

# Create permissions policy
cat > /tmp/permissions-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ec2:*",
        "rds:*",
        "ecr:*",
        "ecs:*",
        "elasticloadbalancing:*",
        "s3:*",
        "secretsmanager:*",
        "logs:*",
        "iam:GetRole",
        "iam:PassRole",
        "iam:CreateServiceLinkedRole",
        "iam:AttachRolePolicy",
        "iam:PutRolePolicy"
      ],
      "Resource": "*"
    }
  ]
}
EOF

# Attach policy to role
echo "Attaching permissions policy..."
aws iam put-role-policy \
  --role-name ${ROLE_NAME} \
  --policy-name MegiLance-Deployment-Policy \
  --policy-document file:///tmp/permissions-policy.json

ROLE_ARN="arn:aws:iam::${ACCOUNT_ID}:role/${ROLE_NAME}"

echo ""
echo "✅ Setup complete!"
echo ""
echo "Role ARN: ${ROLE_ARN}"
echo ""
echo "Next steps:"
echo "1. Go to https://github.com/${REPO_OWNER}/${REPO_NAME}/settings/secrets/actions"
echo "2. Create a new repository secret:"
echo "   Name: AWS_OIDC_ROLE_ARN"
echo "   Value: ${ROLE_ARN}"
echo ""
echo "3. Create another secret for the database password:"
echo "   Name: TF_VAR_db_password"
echo "   Value: <YOUR_STRONG_DB_PASSWORD>"
echo ""
echo "4. Push the code and workflows will run automatically"
