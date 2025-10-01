resource "aws_iam_role" "apprunner_ecr_access" {
  name = "megilance-apprunner-ecr-access"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "build.apprunner.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })
}

data "aws_iam_policy_document" "apprunner_ecr_access" {
  statement {
    effect = "Allow"
    actions = [
      "ecr:GetAuthorizationToken",
      "ecr:BatchCheckLayerAvailability",
      "ecr:GetDownloadUrlForLayer",
      "ecr:BatchGetImage",
      "ecr:DescribeImages",
      "ecr:DescribeRepositories"
    ]
    resources = ["*"]
  }
}

resource "aws_iam_role_policy" "apprunner_ecr_access" {
  name   = "megilance-apprunner-ecr-access"
  role   = aws_iam_role.apprunner_ecr_access.id
  policy = data.aws_iam_policy_document.apprunner_ecr_access.json
}

output "apprunner_access_role_arn" {
  description = "IAM role ARN for App Runner to access ECR"
  value       = aws_iam_role.apprunner_ecr_access.arn
}
