# AWS ECS + EC2 Deployment Guide

Because you will be using 4 separate EC2 instances within a single AWS Account (fueled by $120 credits), deploying via **Amazon Elastic Container Service (ECS)** is the safest and most efficient approach to fulfill the assignment requirements while strictly maintaining the "Free Tier/Credits" budget. EKS (Kubernetes) is too expensive ($72/mo just for the control plane).

## Prerequisites
1. **Docker Hub**: Ensure your CI/CD pipeline (`.github/workflows/ci-cd.yml`) has successfully built and pushed your images to Docker Hub.
2. **MongoDB Atlas**: Ensure your MongoDB cluster is actively running and you have your `MONGODB_URI`.
3. **Kafka (KRaft)**: Since Kafka is required, one of the 4 group members needs to run the Kafka KRaft Container on their EC2 instance alongside their microservice.

---

## Step 1: Create an ECS Cluster
1. Open the [Amazon ECS Console](https://console.aws.amazon.com/ecs/).
2. On the left menu, select **Clusters** and click **Create cluster**.
3. **Cluster name**: `Event-Management-Cluster`
4. **Infrastructure**:
   - Check **Amazon EC2 instances**.
   - Auto Scaling Group (ASG): Create a new ASG.
   - Operating system: **Amazon Linux 2**
   - EC2 instance type: `t2.micro` (Important: Only $0.0116/hour)
   - Desired capacity: `4` (One for each microservice).
5. Click **Create**. AWS will now automatically spin up 4 `t2.micro` EC2 instances and attach them to your new ECS cluster.

## Step 2: Configure EC2 Security Groups
Your microservices need to be accessible over the internet to satisfy the rubric!
1. Go to the **EC2 Console** -> **Instances**. Find the 4 newly created instances.
2. Click the **Security** tab for the instances and click the Security Group.
3. Edit **Inbound Rules** and add:
   - **Type**: Custom TCP, **Port Range**: `3001` (User Service), **Source**: `0.0.0.0/0`
   - **Type**: Custom TCP, **Port Range**: `3002` (Event Service), **Source**: `0.0.0.0/0`
   - **Type**: Custom TCP, **Port Range**: `3003` (Registration Service), **Source**: `0.0.0.0/0`
   - **Type**: Custom TCP, **Port Range**: `3004` (Notification Service), **Source**: `0.0.0.0/0`
   - **Type**: Custom TCP, **Port Range**: `3005` (API Gateway), **Source**: `0.0.0.0/0`
   - **Type**: Custom TCP, **Port Range**: `3006` (Frontend), **Source**: `0.0.0.0/0`

## Step 3: Create ECS Task Definitions for Each Service
You need a "Task Definition" for each microservice. Let's use `user-service` as an example:
1. Go to ECS -> **Task Definitions** -> **Create new task definition**.
2. **Name**: `user-service-task`
3. **Launch type**: `EC2` (Do NOT select Fargate).
4. **Container details**:
   - Name: `user-service`
   - Image URI: `your-dockerhub-username/user-service:latest` (This was built by GitHub Actions!)
   - Port mappings: Container port `3001`, Host port `3001`.
   - **Memory Limits**: Hard limit: `256` MB (Leaves room on the 1GB `t2.micro`).
5. **Environment variables**:
   - Add `PORT` = `3001`
   - Add `MONGODB_URI` = `mongodb+srv://...` (Your Atlas URI)
   - Add `JWT_SECRET` = `your_secret`
6. Click **Create**!
*(Repeat Step 3 for event-service, registration-service, and notification-service).*

## Step 4: Deploy the Tasks (Run the Microservices)
1. Go to your `Event-Management-Cluster`.
2. Click the **Services** tab -> **Deploy**.
3. **Compute options**: Launch type `EC2`.
4. **Task definition**: Select `user-service-task`.
5. **Service name**: `user-service-deployment`
6. **Desired tasks**: `1`
7. Click **Deploy**.

AWS will now find one of your 4 `t2.micro` EC2 instances, pull the Docker image from Docker Hub, inject the environment variables, and start the container securely! It is now accessible via the EC2 instance's Public IPv4 address.
