terraform {
  required_version = ">= 1.15.3"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
  backend "s3" {
    bucket         = "hrapp-terraform-state"
    key            = "hrapp/terraform.tfstate"
    region         = "eu-west-2"
    dynamodb_table = "hrapp-terraform-locks"
    encrypt        = true
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "hrapp"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

module "networking" {
  source      = "./modules/networking"
  environment = var.environment
  vpc_cidr    = var.vpc_cidr
}

module "secrets" {
  source      = "./modules/secrets"
  environment = var.environment
}

module "database" {
  source             = "./modules/database"
  environment        = var.environment
  vpc_id             = module.networking.vpc_id
  private_subnet_ids = module.networking.private_subnet_ids
  db_secret_arn      = module.secrets.db_secret_arn
}

module "storage" {
  source      = "./modules/storage"
  environment = var.environment
}

module "email" {
  source         = "./modules/email"
  environment    = var.environment
  from_email     = var.ses_from_email
}

module "cdn" {
  source               = "./modules/cdn"
  environment          = var.environment
  frontend_bucket_name = module.storage.frontend_bucket_name
  domain_name          = var.domain_name
}

module "ecs" {
  source              = "./modules/ecs"
  environment         = var.environment
  vpc_id              = module.networking.vpc_id
  public_subnet_ids   = module.networking.public_subnet_ids
  private_subnet_ids  = module.networking.private_subnet_ids
  db_url              = "jdbc:postgresql://${module.database.db_endpoint}/hrapp"
  db_secret_arn       = module.secrets.db_secret_arn
  jwt_secret_arn      = module.secrets.jwt_secret_arn
  documents_bucket    = module.storage.documents_bucket_name
  ecr_repository_url  = var.ecr_repository_url
  image_tag           = var.image_tag
}
