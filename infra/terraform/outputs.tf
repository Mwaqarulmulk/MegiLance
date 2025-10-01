output "vpc_id" {
  value = aws_vpc.main.id
}

output "public_subnets" {
  value = [for s in aws_subnet.public : s.id]
}

output "private_subnets" {
  value = [for s in aws_subnet.private : s.id]
}

output "rds_endpoint" {
  value = aws_db_instance.postgres.address
}

output "assets_bucket" {
  value = aws_s3_bucket.assets.bucket
}

output "uploads_bucket" {
  value = aws_s3_bucket.uploads.bucket
}

output "ecr_backend" {
  value = aws_ecr_repository.backend[0].repository_url
  depends_on = [aws_ecr_repository.backend]
}

output "ecr_frontend" {
  value = aws_ecr_repository.frontend[0].repository_url
  depends_on = [aws_ecr_repository.frontend]
}

output "db_secret_arn" {
  value = aws_secretsmanager_secret.db_credentials.arn
}

output "jwt_secret_arn" {
  value = aws_secretsmanager_secret.jwt.arn
}
