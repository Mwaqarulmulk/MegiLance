resource "aws_db_subnet_group" "main" {
  name       = "${var.project_prefix}-db-subnets"
  subnet_ids = [for s in aws_subnet.private : s.id]
  tags = { Name = "${var.project_prefix}-db-subnet-group" }
}

resource "aws_db_instance" "postgres" {
  identifier = "${var.project_prefix}-db"
  engine = "postgres"
  instance_class = var.db_instance_class
  allocated_storage = var.db_allocated_storage
  db_name = var.project_prefix
  username = var.db_username
  password = var.db_password
  db_subnet_group_name = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  skip_final_snapshot = true
  publicly_accessible = false
  tags = { Name = "${var.project_prefix}-db" }
}

resource "aws_security_group" "rds" {
  name        = "${var.project_prefix}-rds-sg"
  description = "RDS security group"
  vpc_id      = aws_vpc.main.id
  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = [aws_vpc.main.cidr_block]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  tags = { Name = "${var.project_prefix}-rds-sg" }
}
