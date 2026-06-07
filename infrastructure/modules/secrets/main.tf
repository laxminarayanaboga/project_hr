resource "random_password" "jwt_secret" {
  length  = 64
  special = false
}

resource "aws_secretsmanager_secret" "jwt" {
  name                    = "hrapp/${var.environment}/jwt-secret"
  recovery_window_in_days = 7
}

resource "aws_secretsmanager_secret_version" "jwt" {
  secret_id     = aws_secretsmanager_secret.jwt.id
  secret_string = jsonencode({ JWT_SECRET = random_password.jwt_secret.result })

  lifecycle {
    ignore_changes = [secret_string]
  }
}

output "jwt_secret_arn" { value = aws_secretsmanager_secret.jwt.arn }

variable "environment" { type = string }
