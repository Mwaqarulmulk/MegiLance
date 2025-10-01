resource "random_id" "bucket_suffix" {
  byte_length = 4
}

resource "aws_s3_bucket" "assets" {
  bucket = "${var.bucket_prefix}-assets-${random_id.bucket_suffix.hex}"
  tags = { Name = "${var.project_prefix}-assets" }
}

resource "aws_s3_bucket_versioning" "assets" {
  bucket = aws_s3_bucket.assets.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "assets" {
  bucket = aws_s3_bucket.assets.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket" "uploads" {
  bucket = "${var.bucket_prefix}-uploads-${random_id.bucket_suffix.hex}"
  tags = { Name = "${var.project_prefix}-uploads" }
}

resource "aws_s3_bucket_versioning" "uploads" {
  bucket = aws_s3_bucket.uploads.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "uploads" {
  bucket = aws_s3_bucket.uploads.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_ecr_repository" "backend" {
  count = var.create_ecr ? 1 : 0
  name  = "${var.project_prefix}-backend"
  image_scanning_configuration { scan_on_push = true }
  tags = { Name = "${var.project_prefix}-backend-ecr" }
}

resource "aws_ecr_repository" "frontend" {
  count = var.create_ecr ? 1 : 0
  name  = "${var.project_prefix}-frontend"
  image_scanning_configuration { scan_on_push = true }
  tags = { Name = "${var.project_prefix}-frontend-ecr" }
}
