resource "aws_cloudfront_origin_access_control" "frontend" {
  name                              = "hrapp-frontend-${var.environment}"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_s3_bucket_policy" "frontend" {
  bucket = var.frontend_bucket_name
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "cloudfront.amazonaws.com" }
      Action    = "s3:GetObject"
      Resource  = "arn:aws:s3:::${var.frontend_bucket_name}/*"
      Condition = {
        StringEquals = {
          "AWS:SourceArn" = aws_cloudfront_distribution.frontend.arn
        }
      }
    }]
  })
}

resource "aws_cloudfront_distribution" "frontend" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  price_class         = "PriceClass_100"

  # S3 origin — serves the React SPA
  origin {
    domain_name              = var.frontend_bucket_domain
    origin_id                = "S3-frontend"
    origin_access_control_id = aws_cloudfront_origin_access_control.frontend.id
  }

  # ALB origin — proxies API and actuator calls from the browser
  # CloudFront terminates HTTPS; internal hop to ALB is HTTP (no cert needed)
  origin {
    domain_name = var.alb_dns_name
    origin_id   = "ALB-backend"
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  # Default: serve React SPA from S3
  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "S3-frontend"
    viewer_protocol_policy = "redirect-to-https"
    compress               = true

    forwarded_values {
      query_string = false
      cookies { forward = "none" }
    }
  }

  # /api/* → ALB — all HTTP methods, no caching, forward all headers + query strings
  ordered_cache_behavior {
    path_pattern           = "/api/*"
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "ALB-backend"
    viewer_protocol_policy = "https-only"
    compress               = false
    cache_policy_id          = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad" # CachingDisabled
    origin_request_policy_id = "216adef6-5c7f-47e4-b989-5492eafa07d3" # AllViewer
  }

  # /actuator/* → ALB — health probes and metrics
  ordered_cache_behavior {
    path_pattern           = "/actuator/*"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "ALB-backend"
    viewer_protocol_policy = "https-only"
    compress               = false
    cache_policy_id          = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad" # CachingDisabled
    origin_request_policy_id = "216adef6-5c7f-47e4-b989-5492eafa07d3" # AllViewer
  }

  # S3+OAC returns 403 (not 404) for missing SPA routes — serve index.html for both
  custom_error_response {
    error_code         = 403
    response_code      = 200
    response_page_path = "/index.html"
  }

  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
  }

  restrictions {
    geo_restriction { restriction_type = "none" }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}

output "cloudfront_url"             { value = "https://${aws_cloudfront_distribution.frontend.domain_name}" }
output "cloudfront_distribution_id" { value = aws_cloudfront_distribution.frontend.id }

variable "environment"            { type = string }
variable "frontend_bucket_name"   { type = string }
variable "frontend_bucket_domain" { type = string }
variable "alb_dns_name"           { type = string }
