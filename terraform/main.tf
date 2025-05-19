terraform {
  required_version = ">= 1.0.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.0"
    }
  }

  backend "s3" {
    bucket = "cache-service-terraform-state"
    key    = "terraform.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region = var.aws_region
}

module "vpc" {
  source = "./modules/vpc"

  environment = var.environment
  vpc_cidr   = var.vpc_cidr
}

module "eks" {
  source = "./modules/eks"

  environment     = var.environment
  cluster_name    = var.cluster_name
  vpc_id         = module.vpc.vpc_id
  subnet_ids     = module.vpc.private_subnet_ids
  instance_types = var.eks_instance_types
}

module "elasticache" {
  source = "./modules/elasticache"

  environment         = var.environment
  vpc_id             = module.vpc.vpc_id
  subnet_ids         = module.vpc.private_subnet_ids
  redis_node_type    = var.redis_node_type
  redis_num_replicas = var.redis_num_replicas
}

module "ecr" {
  source = "./modules/ecr"

  environment = var.environment
  repo_name   = "cache-service"
} 