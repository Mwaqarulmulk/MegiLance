resource "aws_secretsmanager_secret" "db_credentials" {
  name = "${var.project_prefix}/prod/database"
  description = "RDS credentials for MegiLance"
}

resource "aws_secretsmanager_secret_version" "db_credentials_value" {
  secret_id     = aws_secretsmanager_secret.db_credentials.id
  secret_string = jsonencode({
    username = var.db_username,
    password = var.db_password,
    host     = aws_db_instance.postgres.address,
    port     = 5432,
    dbname   = var.project_prefix,
    database_url = "postgresql+psycopg2://${var.db_username}:${var.db_password}@${aws_db_instance.postgres.address}:5432/${var.project_prefix}"
  })
  depends_on = [aws_db_instance.postgres]
}

resource "aws_secretsmanager_secret" "jwt" {
  name = "${var.project_prefix}/prod/jwt"
  description = "JWT secrets"
}

resource "aws_secretsmanager_secret_version" "jwt_value" {
  secret_id     = aws_secretsmanager_secret.jwt.id
  secret_string = jsonencode({
    access_secret = random_password.jwt_access.result,
    refresh_secret = random_password.jwt_refresh.result
  })
}

resource "random_password" "jwt_access" {
  length  = 32
  special = true
}

resource "random_password" "jwt_refresh" {
  length  = 64
  special = true
}
