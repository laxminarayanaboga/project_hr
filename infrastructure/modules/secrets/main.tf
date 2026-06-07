resource "aws_secretsmanager_secret" "jwt" {
  name                    = "hrapp/${var.environment}/jwt-secret"
  recovery_window_in_days = 7
}

resource "aws_secretsmanager_secret_version" "jwt" {
  secret_id     = aws_secretsmanager_secret.jwt.id
  secret_string = jsonencode({ JWT_SECRET = var.jwt_secret_value })

  lifecycle {
    ignore_changes = [secret_string]
  }
}

output "jwt_secret_arn" { value = aws_secretsmanager_secret.jwt.arn }

variable "environment"      { type = string }
variable "jwt_secret_value" {
  type      = string
  default   = "REPLACE_ME_IN_AWS_CONSOLE"
  sensitive = true
}
