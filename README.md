<div align="center">
  <img src="https://via.placeholder.com/150x150.png?text=EuphoriaX+Logo" alt="EuphoriaX Logo" width="150" height="150" />

  # 🛒 EuphoriaX: Enterprise E-Commerce Platform
  **A Fully Functional, Production-Ready Serverless Microservices Architecture**

  [![AWS](https://img.shields.io/badge/AWS-%23FF9900.svg?logo=amazon-aws&logoColor=white)](https://aws.amazon.com/)
  [![Terraform](https://img.shields.io/badge/Terraform-%237B42BC.svg?logo=terraform&logoColor=white)](https://www.terraform.io/)
  [![React](https://img.shields.io/badge/React-%2320232a.svg?logo=react&logoColor=%2361DAFB)](https://reactjs.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-43853D?logo=node.js&logoColor=white)](https://nodejs.org/)
  [![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?logo=github-actions&logoColor=white)](https://github.com/features/actions)
  [![SonarQube](https://img.shields.io/badge/SonarQube-4E9BCD?logo=sonarqube&logoColor=white)](https://www.sonarqube.org/)
  [![Snyk](https://img.shields.io/badge/Snyk-4C4A73?logo=snyk&logoColor=white)](https://snyk.io/)
</div>

<br/>

> **🚀 PROOF OF CONCEPT & PRODUCTION READINESS**
> 
> This is **NOT** a template or a theoretical design. EuphoriaX is a **fully working, deployed model**. The Infrastructure as Code (Terraform) automatically provisions and links **all 8 distinct microservices** and dynamically generates **all 7 required backend NoSQL tables** with zero manual intervention.

---

## 🏗️ 1. Complete Cloud Architecture

This platform utilizes an event-driven, fully serverless microservices architecture. It completely decouples backend domains into 8 independent services, each deployed concurrently as an **AWS Lambda** function and exposed via a unified **Amazon API Gateway**.

```mermaid
graph TD
    Client[Web Client / React UI] --> APIG[Amazon API Gateway]
    
    subgraph Deployed Microservices [AWS Lambda - All 8 Services Active]
        Auth[Auth Service]
        User[User Service]
        Product[Product Service]
        Cart[Cart Service]
        Order[Order Service]
        Inventory[Inventory Service]
        Payment[Payment Service]
        Notify[Notification Service]
    end
    
    subgraph Persistance Layer [Amazon DynamoDB]
        db1[(EuphoriaX-Users)]
        db2[(EuphoriaX-Products)]
        db3[(EuphoriaX-Cart)]
        db4[(EuphoriaX-Orders)]
        db5[(EuphoriaX-Inventory)]
        db6[(EuphoriaX-Payments)]
        db7[(EuphoriaX-Notifications)]
    end
    
    APIG -.-> Auth & User & Product & Cart & Order
    
    Auth -.-> db1
    Product -.-> db2
    Cart -.-> db3
    Order -.-> db4
    Inventory -.-> db5
    Payment -.-> db6
    Notify -.-> db7
    
    Order ===> Inventory & Payment & Notify
```

---

## 📦 2. The 8 Deployed Microservices

The entire backend is split into 8 specialized, fully functional domains. **All 8 services are independently deployed and currently active:**

1. 🔐 **`auth-service`**: Secures the platform via AWS Cognito, generating and validating JWT tokens.
2. 👤 **`user-service`**: Manages customer profiles, shipping addresses, and preferences.
3. 🛍️ **`product-service`**: Serves the dynamic catalog, categories, and fast product lookups.
4. 🛒 **`cart-service`**: Provides a resilient, high-speed shopping cart that persists across devices.
5. 📦 **`order-service`**: Orchestrates the complex checkout flow and manages order history.
6. 🧮 **`inventory-service`**: Ensures stock isn't oversold by locking and deducting available inventory.
7. 💳 **`payment-service`**: Handles secure transaction processing and gateway integrations.
8. 📧 **`notification-service`**: An event-driven consumer that automatically sends transactional alerts (e.g., Order Confirmation).

---

## 🗄️ 3. Automated Database Provisioning (DynamoDB)

This model completely eliminates manual database setup. Our Terraform infrastructure automatically creates and configures **all 7 required tables** across the AWS environment with `PAY_PER_REQUEST` billing mode for infinite scale:

* `EuphoriaX-Users`
* `EuphoriaX-Products`
* `EuphoriaX-Cart`
* `EuphoriaX-Orders`
* `EuphoriaX-Inventory`
* `EuphoriaX-Payments`
* `EuphoriaX-Notifications`

*Every table is strictly isolated. Each microservice is granted IAM permissions ONLY to its specific table, ensuring a true decoupled architecture.*

---

## ☁️ 4. AWS Services Utilized

This project leverages a wide array of managed AWS services to achieve a robust, event-driven architecture:

* **AWS Lambda**: Provides the serverless compute backbone for all 8 microservices, scaling instantly from zero to thousands of concurrent requests.
* **Amazon API Gateway**: Acts as the single, secure entry point for the frontend, routing HTTP requests to the appropriate backend Lambda functions.
* **Amazon DynamoDB**: A fully managed NoSQL database delivering single-digit millisecond performance for the 7 microservice tables.
* **Amazon Cognito**: Secures the platform by handling user registration, passwordless authentication, and JWT token vending.
* **Amazon SNS (Simple Notification Service)**: Used for high-throughput, push-based, many-to-many messaging and triggering CloudWatch alarms.
* **Amazon SQS (Simple Queue Service)**: Used to decouple heavy background processes (like order processing and email notifications) via reliable message queuing.
* **Amazon CloudWatch**: Centralized observability service for storing logs, building custom dashboards, and triggering alarms.
* **AWS X-Ray**: Provides end-to-end distributed tracing across microservices to identify performance bottlenecks as requests hop between API Gateway, Lambda, and DynamoDB.

---

## 🛠️ 5. Core Technology Stack

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Core** | React 19, Vite, TailwindCSS | Blazing fast Single Page Application |
| **State Management** | Zustand, React Query | Caching server state and managing global UI state |
| **Backend Compute** | Node.js, Express.js | Core microservice application logic |
| **Cloud Provider** | Amazon Web Services (AWS) | Global, scalable infrastructure |
| **Infrastructure as Code**| HashiCorp Terraform | Automating all database and compute creation |
| **CI/CD** | GitHub Actions | 100% automated deployment pipelines |
| **Security & Quality** | Snyk, SonarQube | Automated DevSecOps vulnerability blocking |

---

## 🛡️ 6. DevSecOps & Automated CI/CD

The project includes an incredibly robust, 100% automated pipeline built on GitHub Actions:

1. **Infrastructure CI/CD**: Pushing to `main` triggers Terraform to instantly create any missing DynamoDB tables, API Gateways, or Lambda functions.
2. **Security Gates**: Every backend microservice triggers a strict `Snyk` vulnerability scan and `SonarQube` code quality analysis.
3. **Resilient CD Pipeline**: The Continuous Deployment pipelines dynamically check if the AWS environment exists (vital for ephemeral AWS Learner Labs). If the environment was reset, the pipeline gracefully skips; if the environment exists, it instantly injects the new code into all 8 microservices simultaneously.

---

## 📈 7. Observability & Monitoring

* **Amazon CloudWatch Dashboards**: Terraform automatically provisions a central dashboard to monitor API latency, Lambda executions, and error rates across all 8 services.
* **AWS X-Ray**: Distributed tracing is injected into the services. A single checkout request can be visually traced as it hops from the API Gateway, to the Order Service, to the Payment Service, and into DynamoDB.

---

## 💻 8. How to Run the Project (Detailed Setup)

Since this is a fully automated Cloud-Native architecture, running the project involves authenticating with AWS and letting our code build the environment for you.

### Step 1: Clone the Repository
```bash
git clone https://github.com/kanishgask/Ecommerce-EuphoriaX.git
cd Ecommerce-EuphoriaX
```

### Step 2: Configure AWS Credentials
You must have the AWS CLI installed and configured with Administrator (or equivalent Learner Lab) access.
```bash
aws configure
# Enter your AWS Access Key ID, Secret Access Key, and Default Region (e.g., ap-southeast-1)
```

### Step 3: Automatically Provision the Cloud Infrastructure
Navigate into the `terraform` directory. This step will automatically log into your AWS account and build the API Gateway, all 8 Lambda functions, all 7 DynamoDB tables, and the CloudWatch Dashboards.
```bash
cd terraform
terraform init
terraform apply -auto-approve
```
*Note: Wait a few minutes for Terraform to finish building the environment. It will output an `api_gateway_url` when finished.*

### Step 4: Deploy the Microservices Code via GitHub Actions
Now that the infrastructure exists, the actual code must be injected into the Lambdas.
1. Go to your repository on GitHub.
2. Navigate to **Settings > Secrets and variables > Actions**.
3. Add your AWS credentials as secrets (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_SESSION_TOKEN`).
4. Navigate to the **Actions** tab.
5. Click on the latest workflow run and click **Re-run all jobs**.
*GitHub Actions will now zip all 8 microservices and instantly deploy them into your new AWS infrastructure.*

### Step 5: Start the Local Frontend
Open a new terminal window, grab the API Gateway URL generated from Step 3, and run the React frontend.
```bash
cd frontend

# Install dependencies
npm install

# Create environment file
echo "VITE_API_BASE_URL=<INSERT_API_GATEWAY_URL_HERE>" > .env

# Start the application
npm run dev
```
Visit `http://localhost:5173` in your browser to experience the fully functional EuphoriaX platform!

---

## 📸 9. Interface Showcase

*Replace these placeholders with actual screenshots of your fully working deployment.*

| Interactive Product Catalog | Resilient Shopping Cart |
| :---: | :---: |
| ![Catalog](https://via.placeholder.com/400x250.png?text=Product+Catalog) | ![Cart](https://via.placeholder.com/400x250.png?text=Shopping+Cart) |

---

## 👨‍💻 10. Author & License

**Kanishga S**
* **GitHub:** [@kanishgask](https://github.com/kanishgask)
* **Project Repository:** [Ecommerce-EuphoriaX](https://github.com/kanishgask/Ecommerce-EuphoriaX)

*This project is licensed under the MIT License.*
