# EuphoriaX Store — Infrastructure as Code (Terraform) 🚀

This directory contains the complete **Terraform Infrastructure as Code (IaC)** configuration for deploying the EuphoriaX full-stack e-commerce platform on AWS.

## Architecture & Provisioned Resources 🏗️

The Terraform configuration is modularized into clean, domain-specific HCL files:

1. **`dynamodb.tf`**: Provisions **7 Serverless NoSQL Tables** (`users`, `products`, `cart`, `orders`, `inventory`, `notifications`, `payments`) with `PAY_PER_REQUEST` billing mode, Global Secondary Indexes (GSIs), and Point-in-Time Recovery (PITR).
2. **`cognito.tf`**: Provisions an **Amazon Cognito User Pool**, App Client (JWT tokens), password complexity rules, email verification templates, and role-based user groups (**ADMIN** and **USER**).
3. **`frontend_cdn.tf`**: Provisions an **Amazon S3 Bucket** for static SPA hosting, an **Origin Access Control (OAC)** for private origin access, and an **Amazon CloudFront CDN Distribution** with HTTPS redirection, gzip/brotli compression, and React Router SPA fallback routing (403/404 -> `/index.html`).
4. **`backend_serverless.tf`**: Provisions **AWS IAM Execution Roles and Policies** granting microservices permission to read/write DynamoDB, verify Cognito JWTs, publish to SNS, and stream logs to CloudWatch. Also creates an **Amazon API Gateway (HTTP API v2)** with full CORS preconfigured for your CloudFront CDN origin.
5. **`variables.tf` & `outputs.tf`**: Configurable input parameters and automated output reporting of deployed endpoint URLs and table names.

---

## Step-by-Step Deployment Guide 🛠️

### Prerequisites
- Install [Terraform CLI](https://developer.hashicorp.com/terraform/install) (v1.5+).
- Configure AWS IAM credentials on your machine using `aws configure` (or set environment variables `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`).

### 1. Initialize Terraform Workspace
Open your terminal inside the `terraform/` folder and run:
```bash
cd terraform
terraform init
```
*This downloads the required AWS provider (`hashicorp/aws ~> 5.50.0`) and sets up your state file.*

### 2. Preview Infrastructure Changes
Run a speculative dry-run to verify what resources will be created:
```bash
terraform plan -out=tfplan
```
*Review the execution plan to confirm that all 7 DynamoDB tables, Cognito User Pool, S3 bucket, CloudFront distribution, and API Gateway will be provisioned.*

### 3. Apply and Deploy to AWS
Execute the plan to create your live cloud infrastructure:
```bash
terraform apply tfplan
```
*(Or run `terraform apply -auto-approve`)*

### 4. Retrieve Outputs for CI/CD & Environment Setup
Once completed, Terraform will display your production endpoints:
```bash
terraform output
```
Copy these values directly into your GitHub Actions Secrets (`AWS_S3_BUCKET_NAME`, `CLOUDFRONT_DIST_ID`) and backend `.env` files!

---

## Destroying Infrastructure (Clean Up) 🧹
To tear down all deployed AWS resources and avoid incurring unwanted charges:
```bash
terraform destroy -auto-approve
```
