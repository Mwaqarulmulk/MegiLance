#!/bin/bash
# Script to set up GitHub OIDC provider and IAM role for MegiLance deployment
# Run this in AWS CloudShell (or any machine with AWS CLI v2 configured).

set -euo pipefail

ROLE_NAME_DEFAULT="GithubActionsOIDCRole"
REGION_DEFAULT="us-east-2"
REPO_OWNER_DEFAULT="ghulam-mujtaba5"
REPO_NAME_DEFAULT="MegiLance"

usage() {
  cat <<USAGE
Usage: $0 [-r region] [-o repo_owner] [-R repo_name] [-n role_name]

Options:
  -r    AWS region for Terraform deployments (default: ${REGION_DEFAULT})
  -o    GitHub repository owner (default: ${REPO_OWNER_DEFAULT})
  -R    GitHub repository name (default: ${REPO_NAME_DEFAULT})
  -n    IAM role name to create/update (default: ${ROLE_NAME_DEFAULT})
  -h    Show this help message
USAGE
}

REGION="${REGION_DEFAULT}"
REPO_OWNER="${REPO_OWNER_DEFAULT}"
REPO_NAME="${REPO_NAME_DEFAULT}"
ROLE_NAME="${ROLE_NAME_DEFAULT}"

while getopts ":r:o:R:n:h" opt; do
  case "${opt}" in
    r) REGION="${OPTARG}" ;;
    o) REPO_OWNER="${OPTARG}" ;;
    R) REPO_NAME="${OPTARG}" ;;
    n) ROLE_NAME="${OPTARG}" ;;
    h) usage; exit 0 ;;
    :) echo "Option -${OPTARG} requires an argument." >&2; usage; exit 1 ;;
    \?) echo "Invalid option -${OPTARG}" >&2; usage; exit 1 ;;
  esac
done

echo "Determining AWS account ID..."
ACCOUNT_ID=$(aws sts get-caller-identity --query 'Account' --output text)

echo "Setting up GitHub OIDC provider and IAM role for ${REPO_OWNER}/${REPO_NAME} in account ${ACCOUNT_ID}..."

OIDC_PROVIDER_ARN="arn:aws:iam::${ACCOUNT_ID}:oidc-provider/token.actions.githubusercontent.com"

if aws iam get-open-id-connect-provider --open-id-connect-provider-arn "${OIDC_PROVIDER_ARN}" >/dev/null 2>&1; then
  echo "OIDC provider already exists. Skipping creation."
else
  echo "Creating OIDC provider..."
  aws iam create-open-id-connect-provider \
    --url https://token.actions.githubusercontent.com \
    --client-id-list sts.amazonaws.com \
    --thumbprint-list a031c46782e6e6c662c2c87c76da9aa62ccabd8e
fi

cat > /tmp/trust-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {
      "Federated": "${OIDC_PROVIDER_ARN}"
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

if aws iam get-role --role-name "${ROLE_NAME}" >/dev/null 2>&1; then
  echo "Role ${ROLE_NAME} already exists. Updating trust policy..."
  aws iam update-assume-role-policy \
    --role-name "${ROLE_NAME}" \
    --policy-document file:///tmp/trust-policy.json
else
  echo "Creating IAM role ${ROLE_NAME}..."
  aws iam create-role \
    --role-name "${ROLE_NAME}" \
    --assume-role-policy-document file:///tmp/trust-policy.json \
    --description "GitHub Actions OIDC role for ${REPO_OWNER}/${REPO_NAME} deployments"
fi

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
        "appconfig:*",
        "apprunner:*",
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

echo "Attaching inline permissions policy..."
aws iam put-role-policy \
  --role-name "${ROLE_NAME}" \
  --policy-name "${ROLE_NAME}-Deployment-Policy" \
  --policy-document file:///tmp/permissions-policy.json

ROLE_ARN="arn:aws:iam::${ACCOUNT_ID}:role/${ROLE_NAME}"

echo
echo "✅ Setup complete!"
echo
echo "Role ARN: ${ROLE_ARN}"
echo
echo "Next steps:"
echo "1. Go to https://github.com/${REPO_OWNER}/${REPO_NAME}/settings/secrets/actions"
echo "2. Create or update the repository secret:"
echo "   Name: AWS_OIDC_ROLE_ARN"
echo "   Value: ${ROLE_ARN}"
echo
echo "3. Create or update the database password secret:"
echo "   Name: TF_VAR_db_password"
echo "   Value: <YOUR_STRONG_DB_PASSWORD>"
echo
echo "4. Re-run the GitHub Actions workflows to provision infrastructure."
