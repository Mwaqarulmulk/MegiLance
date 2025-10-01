variable "aws_region" {
  description = "AWS region to deploy into"
  type        = string
  default     = "eu-central-1"
}

variable "project_prefix" {
  description = "Resource name prefix"
  type        = string
  default     = "megilance"
}

variable "cidr_vpc" {
  description = "VPC CIDR block"
  type        = string
  default     = "10.10.0.0/16"
}

variable "public_subnets" {
  description = "List of public subnet CIDRs"
  type        = list(string)
  default     = ["10.10.1.0/24", "10.10.2.0/24"]
}

variable "private_subnets" {
  description = "List of private subnet CIDRs"
  type        = list(string)
  default     = ["10.10.101.0/24", "10.10.102.0/24"]
}

variable "db_username" {
  description = "Primary DB username"
  type        = string
  default     = "megilance"
}

variable "db_password" {
  description = "Primary DB password"
  type        = string
  sensitive   = true
}

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t4g.micro"
}

variable "db_allocated_storage" {
  description = "RDS allocated storage (GB)"
  type        = number
  default     = 20
}

variable "create_ecr" {
  description = "Create ECR repositories"
  type        = bool
  default     = true
}

variable "bucket_prefix" {
  description = "S3 bucket name prefix (suffix will be added automatically)"
  type        = string
  default     = "megilance"
}
