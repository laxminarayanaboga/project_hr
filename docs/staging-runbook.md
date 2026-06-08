# Staging Runbook — Spin Up / Tear Down

> Use this when you need to bring staging up for a demo or tear it down to stop billing.
> AWS account: `303529433826` | Region: `eu-west-2`

---

## Tear down (stop billing)

```bash
cd infrastructure
terraform destroy -auto-approve
```

Takes ~20 min. CloudFront and the ALB are the slowest to deprovision.
**53 resources** are destroyed. Terraform state is kept in S3 (`hrapp-terraform-state-303529433826`) so the next apply knows what to create.

---

## Spin up (before a demo)

Run these four steps in order. Allow ~35 min end-to-end.

### Step 1 — Infrastructure (~20 min)

```bash
cd infrastructure
terraform apply -auto-approve
```

When complete, grab the new CloudFront URL — it changes every time a new distribution is created:

```bash
terraform output cloudfront_url
```

### Step 2 — Backend Docker image (~8 min)

```bash
cd backend

# Log in to ECR
aws ecr get-login-password --region eu-west-2 \
  | docker login --username AWS --password-stdin \
    303529433826.dkr.ecr.eu-west-2.amazonaws.com

# Build for amd64 (ECS Fargate — required even on M-series Mac)
docker build --platform linux/amd64 -t hrapp-backend .

# Tag and push
docker tag hrapp-backend:latest \
  303529433826.dkr.ecr.eu-west-2.amazonaws.com/hrapp-backend:latest

docker push \
  303529433826.dkr.ecr.eu-west-2.amazonaws.com/hrapp-backend:latest
```

ECS picks up the new image automatically and starts a new task.

### Step 3 — Frontend (~3 min)

```bash
cd frontend
npm run build
aws s3 sync dist/ s3://hrapp-frontend-staging/ --delete
```

### Step 4 — Wait for ECS to be healthy (~3 min)

```bash
until curl -s http://hrapp-staging-1475137882.eu-west-2.elb.amazonaws.com/actuator/health \
  | grep -q '"status":"UP"'; do
  echo "waiting..."; sleep 10
done
echo "Backend is UP"
```

> **Note:** The ALB DNS name is stable (same name re-used). The CloudFront URL changes — always check `terraform output cloudfront_url` after apply.

---

## Demo credentials

| Field | Value |
|---|---|
| URL | `terraform output cloudfront_url` |
| Email | `admin@pinnacle-digital.co.uk` |
| Password | `Demo1234!` |

Demo seed data (3 companies, ~25 employees, leave requests, attendance) is applied automatically by Flyway on first ECS startup — no manual step needed.

---

## Smoke test (optional — confirms everything is wired up)

```bash
cd e2e
API_URL=http://hrapp-staging-1475137882.eu-west-2.elb.amazonaws.com \
  npm run test:smoke
```

All 4 tests should pass: health check, bad login → 401, missing fields → 400, no token → 401.
