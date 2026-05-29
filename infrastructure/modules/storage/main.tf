resource "aws_s3_bucket" "documents" {
  bucket = "hrapp-documents-${var.environment}"
}

resource "aws_s3_bucket_public_access_block" "documents" {
  bucket                  = aws_s3_bucket.documents.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "documents" {
  bucket = aws_s3_bucket.documents.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket" "frontend" {
  bucket = "hrapp-frontend-${var.environment}"
}

resource "aws_s3_bucket_website_configuration" "frontend" {
  bucket = aws_s3_bucket.frontend.id
  index_document { suffix = "index.html" }
  error_document { key = "index.html" }
}

output "documents_bucket_name" { value = aws_s3_bucket.documents.bucket }
output "frontend_bucket_name"  { value = aws_s3_bucket.frontend.bucket }
output "frontend_bucket_domain" { value = aws_s3_bucket.frontend.bucket_regional_domain_name }

variable "environment" { type = string }
