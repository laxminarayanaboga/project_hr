resource "aws_ses_email_identity" "from" {
  email = var.from_email
}

output "ses_identity_arn" { value = aws_ses_email_identity.from.arn }

variable "environment" { type = string }
variable "from_email"  { type = string }
