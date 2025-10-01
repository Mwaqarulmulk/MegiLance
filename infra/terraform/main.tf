terraform {
  backend "local" {}
}

provider "aws" {
  region = var.aws_region
}

# Data sources
data "aws_availability_zones" "available" {}

# ... existing modules are declared in other .tf files
