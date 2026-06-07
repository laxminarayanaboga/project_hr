resource "aws_ses_email_identity" "from" {
  email = var.from_email
}

# IAM user whose access key yields SES SMTP credentials
resource "aws_iam_user" "ses_smtp" {
  name = "hrapp-ses-smtp-${var.environment}"
}

resource "aws_iam_user_policy" "ses_smtp" {
  user = aws_iam_user.ses_smtp.name
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["ses:SendEmail", "ses:SendRawEmail"]
      Resource = "*"
    }]
  })
}

resource "aws_iam_access_key" "ses_smtp" {
  user = aws_iam_user.ses_smtp.name
}

# Store SMTP credentials in Secrets Manager so ECS can inject them at startup
resource "aws_secretsmanager_secret" "smtp" {
  name                    = "hrapp/${var.environment}/smtp-credentials"
  recovery_window_in_days = 7
}

resource "aws_secretsmanager_secret_version" "smtp" {
  secret_id = aws_secretsmanager_secret.smtp.id
  secret_string = jsonencode({
    username = aws_iam_access_key.ses_smtp.id
    password = aws_iam_access_key.ses_smtp.ses_smtp_password_v4
  })
}

output "ses_identity_arn"  { value = aws_ses_email_identity.from.arn }
output "smtp_secret_arn"   { value = aws_secretsmanager_secret.smtp.arn }

variable "environment" { type = string }
variable "from_email"  { type = string }
variable "aws_region"  { type = string }
