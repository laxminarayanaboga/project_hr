resource "aws_db_subnet_group" "main" {
  name       = "hrapp-${var.environment}"
  subnet_ids = var.private_subnet_ids
}

resource "aws_security_group" "rds" {
  name   = "hrapp-rds-${var.environment}"
  vpc_id = var.vpc_id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [var.ecs_security_group_id]
  }
}

resource "aws_db_instance" "main" {
  identifier              = "hrapp-${var.environment}"
  engine                  = "postgres"
  engine_version          = "17"
  instance_class          = "db.t3.micro"
  allocated_storage       = 20
  max_allocated_storage   = 100
  storage_encrypted       = true
  db_name                 = "hrapp"
  manage_master_user_password = true
  db_subnet_group_name    = aws_db_subnet_group.main.name
  vpc_security_group_ids  = [aws_security_group.rds.id]
  backup_retention_period = 7
  deletion_protection     = var.environment == "prod"
  skip_final_snapshot     = var.environment != "prod"
}

output "db_endpoint" { value = aws_db_instance.main.endpoint }
output "db_secret_arn" {
  value = aws_db_instance.main.master_user_secret[0].secret_arn
}

variable "environment"          { type = string }
variable "vpc_id"               { type = string }
variable "private_subnet_ids"   { type = list(string) }
variable "db_secret_arn"        { type = string }
variable "ecs_security_group_id" {
  type    = string
  default = ""
}
