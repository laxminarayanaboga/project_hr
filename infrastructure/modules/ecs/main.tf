resource "aws_ecr_repository" "backend" {
  name                 = "hrapp-backend"
  image_tag_mutability = "MUTABLE"
  force_delete         = true

  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecs_cluster" "main" {
  name = "hrapp-${var.environment}"
}

# ── Security groups ──────────────────────────────────────────────────────────

resource "aws_security_group" "alb" {
  name   = "hrapp-alb-${var.environment}"
  vpc_id = var.vpc_id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "ecs" {
  name   = "hrapp-ecs-${var.environment}"
  vpc_id = var.vpc_id

  ingress {
    from_port       = 8080
    to_port         = 8080
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# ── Load balancer ────────────────────────────────────────────────────────────

resource "aws_lb" "main" {
  name               = "hrapp-${var.environment}"
  load_balancer_type = "application"
  subnets            = var.public_subnet_ids
  security_groups    = [aws_security_group.alb.id]
}

resource "aws_lb_target_group" "backend" {
  name        = "hrapp-backend-${var.environment}"
  port        = 8080
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"

  health_check {
    path                = "/actuator/health"
    healthy_threshold   = 2
    unhealthy_threshold = 6
    interval            = 30
  }
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend.arn
  }
}

# ── IAM roles ────────────────────────────────────────────────────────────────

# Execution role — used by ECS agent to pull images + fetch secrets at startup
resource "aws_iam_role" "ecs_execution" {
  name = "hrapp-ecs-execution-${var.environment}"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_execution_base" {
  role       = aws_iam_role.ecs_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role_policy" "ecs_execution_secrets" {
  role = aws_iam_role.ecs_execution.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = ["secretsmanager:GetSecretValue"]
      Resource = [
        var.db_secret_arn,
        var.jwt_secret_arn,
        var.smtp_secret_arn,
      ]
    }]
  })
}

# Task role — used by the running container for S3 / SES SDK calls
resource "aws_iam_role" "ecs_task" {
  name = "hrapp-ecs-task-${var.environment}"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy" "ecs_task" {
  role = aws_iam_role.ecs_task.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"]
        Resource = "arn:aws:s3:::hrapp-documents-${var.environment}/*"
      },
      {
        Effect   = "Allow"
        Action   = ["ses:SendEmail", "ses:SendRawEmail"]
        Resource = "*"
      }
    ]
  })
}

# ── CloudWatch logs ──────────────────────────────────────────────────────────

resource "aws_cloudwatch_log_group" "backend" {
  name              = "/ecs/hrapp-backend-${var.environment}"
  retention_in_days = 30
}

# ── ECS task + service ───────────────────────────────────────────────────────

resource "aws_ecs_task_definition" "backend" {
  family                   = "hrapp-backend-${var.environment}"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = 512
  memory                   = 1024
  execution_role_arn       = aws_iam_role.ecs_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([{
    name  = "backend"
    image = "${aws_ecr_repository.backend.repository_url}:${var.image_tag}"
    portMappings = [{ containerPort = 8080 }]

    environment = [
      { name = "SPRING_PROFILES_ACTIVE", value = "prod" },
      { name = "AWS_REGION",             value = var.aws_region },
      { name = "S3_DOCUMENTS_BUCKET",    value = "hrapp-documents-${var.environment}" },
      { name = "SES_FROM_ADDRESS",       value = var.ses_from_email },
      { name = "DB_URL",                 value = "jdbc:postgresql://${var.db_host}:5432/hrapp" },
      { name = "DB_USERNAME",            value = "postgres" },
      { name = "CORS_ALLOWED_ORIGINS",              value = var.cors_allowed_origins },
      { name = "LOGGING_LEVEL_ORG_FLYWAYDB",       value = "INFO" },
      { name = "SPRING_FLYWAY_ENABLED",            value = "true" },
      { name = "SPRING_FLYWAY_LOCATIONS",          value = "classpath:db/migration" },
    ]

    secrets = [
      { name = "DB_PASSWORD",    valueFrom = "${var.db_secret_arn}:password::" },
      { name = "JWT_SECRET",     valueFrom = "${var.jwt_secret_arn}:JWT_SECRET::" },
      { name = "SMTP_USERNAME",  valueFrom = "${var.smtp_secret_arn}:username::" },
      { name = "SMTP_PASSWORD",  valueFrom = "${var.smtp_secret_arn}:password::" },
    ]

    logConfiguration = {
      logDriver = "awslogs"
      options = {
        awslogs-group         = aws_cloudwatch_log_group.backend.name
        awslogs-region        = var.aws_region
        awslogs-stream-prefix = "ecs"
      }
    }
  }])
}

resource "aws_ecs_service" "backend" {
  name                               = "hrapp-backend-${var.environment}"
  cluster                            = aws_ecs_cluster.main.id
  task_definition                    = aws_ecs_task_definition.backend.arn
  desired_count                      = 1
  launch_type                        = "FARGATE"
  health_check_grace_period_seconds  = 150

  network_configuration {
    subnets          = var.private_subnet_ids
    security_groups  = [aws_security_group.ecs.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.backend.arn
    container_name   = "backend"
    container_port   = 8080
  }

  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }
}

output "alb_dns_name"          { value = aws_lb.main.dns_name }
output "alb_arn_suffix"        { value = aws_lb.main.arn_suffix }
output "alb_url"               { value = "http://${aws_lb.main.dns_name}" }
output "ecr_repository_url"    { value = aws_ecr_repository.backend.repository_url }
output "ecs_cluster_name"      { value = aws_ecs_cluster.main.name }
output "ecs_service_name"      { value = aws_ecs_service.backend.name }

variable "environment"         { type = string }
variable "aws_region"          { type = string }
variable "vpc_id"              { type = string }
variable "public_subnet_ids"   { type = list(string) }
variable "private_subnet_ids"  { type = list(string) }
variable "db_host"             { type = string }
variable "db_secret_arn"       { type = string }
variable "jwt_secret_arn"      { type = string }
variable "smtp_secret_arn"     { type = string }
variable "ses_from_email"      { type = string }
variable "cors_allowed_origins" { type = string }
variable "image_tag" {
  type    = string
  default = "latest"
}
