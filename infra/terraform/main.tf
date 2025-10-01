terraform {
  backend "local" {}
}

# Data sources
data "aws_availability_zones" "available" {}

# ... existing modules are declared in other .tf files
