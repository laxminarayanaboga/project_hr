variable "aws_region" {
  description = "AWS region to deploy into"
  type        = string
  default     = "eu-west-2"
}

variable "environment" {
  description = "Deployment environment (staging or prod)"
  type        = string
  validation {
    condition     = contains(["staging", "prod"], var.environment)
    error_message = "environment must be staging or prod"
  }
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "ses_from_email" {
  description = "SES sender email (must be verified in AWS SES)"
  type        = string
}

variable "image_tag" {
  description = "Docker image tag to deploy (overridden by CI on each deploy)"
  type        = string
  default     = "latest"
}
