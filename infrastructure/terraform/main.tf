# Terraform – Tradegrid Africa Infrastructure
# This is a starter template. Expand with real cloud resources as needed.

terraform {
  required_version = ">= 1.7.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Uncomment once you have an S3 bucket for remote state
  # backend "s3" {
  #   bucket = "tradegrid-tf-state"
  #   key    = "infra/terraform.tfstate"
  #   region = "us-east-1"
  # }
}

provider "aws" {
  region = var.aws_region
}
