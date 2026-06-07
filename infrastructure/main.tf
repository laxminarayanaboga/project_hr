terraform {
  required_version = ">= 1.9.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }
  backend "s3" {
    bucket         = "hrapp-terraform-state-303529433826"
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
  vpc_cidr           = module.networking.vpc_cidr
  private_subnet_ids = module.networking.private_subnet_ids
}

module "storage" {
  source      = "./modules/storage"
  environment = var.environment
}

module "email" {
  source      = "./modules/email"
  environment = var.environment
  from_email  = var.ses_from_email
  aws_region  = var.aws_region
}

module "cdn" {
  source                = "./modules/cdn"
  environment           = var.environment
  frontend_bucket_name  = module.storage.frontend_bucket_name
  frontend_bucket_domain = module.storage.frontend_bucket_domain
}

module "ecs" {
  source               = "./modules/ecs"
  environment          = var.environment
  aws_region           = var.aws_region
  vpc_id               = module.networking.vpc_id
  public_subnet_ids    = module.networking.public_subnet_ids
  private_subnet_ids   = module.networking.private_subnet_ids
  db_host              = module.database.db_endpoint
  db_secret_arn        = module.database.db_secret_arn
  jwt_secret_arn       = module.secrets.jwt_secret_arn
  smtp_secret_arn      = module.email.smtp_secret_arn
  ses_from_email       = var.ses_from_email
  cors_allowed_origins = module.cdn.cloudfront_url
  image_tag            = var.image_tag
}

module "monitoring" {
  source           = "./modules/monitoring"
  environment      = var.environment
  aws_region       = var.aws_region
  ecs_cluster_name = module.ecs.ecs_cluster_name
  ecs_service_name = module.ecs.ecs_service_name
  alb_arn_suffix   = module.ecs.alb_arn_suffix
}
