output "alb_url" {
  description = "Application Load Balancer URL (backend API)"
  value       = module.ecs.alb_url
}

output "cloudfront_url" {
  description = "CloudFront distribution URL (frontend)"
  value       = module.cdn.cloudfront_url
}

output "rds_endpoint" {
  description = "RDS PostgreSQL endpoint"
  value       = module.database.db_endpoint
  sensitive   = true
}

output "documents_bucket" {
  description = "S3 bucket name for employee documents"
  value       = module.storage.documents_bucket_name
}

output "frontend_bucket" {
  description = "S3 bucket name for frontend static files"
  value       = module.storage.frontend_bucket_name
}
