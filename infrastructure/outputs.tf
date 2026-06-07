output "alb_url" {
  description = "ALB URL — set as VITE_API_BASE_URL GitHub secret"
  value       = module.ecs.alb_url
}

output "cloudfront_url" {
  description = "CloudFront URL (frontend)"
  value       = module.cdn.cloudfront_url
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID — set as CLOUDFRONT_DISTRIBUTION_ID GitHub secret"
  value       = module.cdn.cloudfront_distribution_id
}

output "ecr_repository_url" {
  description = "ECR repository URL — used by CI to push images"
  value       = module.ecs.ecr_repository_url
}

output "rds_endpoint" {
  description = "RDS PostgreSQL endpoint"
  value       = module.database.db_endpoint
  sensitive   = true
}

output "documents_bucket" {
  description = "S3 bucket for employee documents"
  value       = module.storage.documents_bucket_name
}

output "frontend_bucket" {
  description = "S3 bucket for frontend static files"
  value       = module.storage.frontend_bucket_name
}
