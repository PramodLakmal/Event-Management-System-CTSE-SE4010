# User Service - Deployment Guide

This guide covers deploying the User Service to production using Docker and AWS ECS.

## Table of Contents

1. [Docker Setup](#docker-setup)
2. [AWS ECS Deployment](#aws-ecs-deployment)
3. [Docker Hub](#docker-hub)
4. [Configuration for Production](#configuration-for-production)
5. [Monitoring & Logging](#monitoring--logging)
6. [Scaling](#scaling)
7. [Troubleshooting](#troubleshooting)

---

## Docker Setup

### Building the Docker Image

```bash
# Navigate to user-service directory
cd user-service

# Build image
docker build -t user-service:1.0.0 .

# Verify build
docker images | grep user-service
```

### Running Container Locally

```bash
# Run with MongoDB running locally
docker run -p 3001:3001 \
  -e MONGODB_URI=mongodb://host.docker.internal:27017/event-management-db \
  -e JWT_SECRET=your_secret_key \
  -e NODE_ENV=production \
  user-service:1.0.0

# Using docker-compose (includes MongoDB)
docker-compose up --build
```

### Docker Best Practices

```dockerfile
# ✅ Correct Dockerfile practices

# Use specific version
FROM node:18-alpine

# Run as non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs

# Multi-stage build for smaller images (optional)
FROM node:18-alpine as builder
WORKDIR /build
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /build/node_modules ./node_modules
COPY . .
USER nodejs
EXPOSE 3001
CMD ["npm", "start"]
```

---

## AWS ECS Deployment

### Prerequisites

- AWS Account with appropriate permissions
- AWS CLI configured: `aws configure`
- ECR repository created
- ECS cluster created
- RDS MongoDB or DocumentDB cluster
- IAM roles and policies set up

### Step 1: Push Image to AWS ECR

```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin 123456789.dkr.ecr.us-east-1.amazonaws.com

# Tag image for ECR
docker tag user-service:1.0.0 \
  123456789.dkr.ecr.us-east-1.amazonaws.com/user-service:1.0.0

# Push to ECR
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/user-service:1.0.0
```

### Step 2: Create ECS Task Definition

Create `user-service-task-definition.json`:

```json
{
  "family": "user-service",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [
    {
      "name": "user-service",
      "image": "123456789.dkr.ecr.us-east-1.amazonaws.com/user-service:1.0.0",
      "essential": true,
      "portMappings": [
        {
          "containerPort": 3001,
          "hostPort": 3001,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "PORT",
          "value": "3001"
        },
        {
          "name": "SERVICE_NAME",
          "value": "user-service"
        }
      ],
      "secrets": [
        {
          "name": "MONGODB_URI",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:123456789:secret:mongodb-uri"
        },
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:123456789:secret:jwt-secret"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/user-service",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": [
          "CMD-SHELL",
          "curl -f http://localhost:3001/health || exit 1"
        ],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      }
    }
  ],
  "executionRoleArn": "arn:aws:iam::123456789:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::123456789:role/ecsTaskRole"
}
```

### Step 3: Register Task Definition

```bash
aws ecs register-task-definition \
  --cli-input-json file://user-service-task-definition.json
```

### Step 4: Create/Update ECS Service

```bash
# Create service
aws ecs create-service \
  --cluster event-management-cluster \
  --service-name user-service \
  --task-definition user-service:1 \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx,subnet-yyy],securityGroups=[sg-xxx],assignPublicIp=ENABLED}" \
  --load-balancers targetGroupArn=arn:aws:elasticloadbalancing:...,containerName=user-service,containerPort=3001

# Or update existing service
aws ecs update-service \
  --cluster event-management-cluster \
  --service user-service \
  --task-definition user-service:2 \
  --force-new-deployment
```

### Step 5: Configure Auto Scaling

```bash
# Create Auto Scaling target
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --resource-id service/event-management-cluster/user-service \
  --scalable-dimension ecs:service:DesiredCount \
  --min-capacity 2 \
  --max-capacity 10

# Create scaling policy
aws application-autoscaling put-scaling-policy \
  --policy-name user-service-scaling \
  --service-namespace ecs \
  --resource-id service/event-management-cluster/user-service \
  --scalable-dimension ecs:service:DesiredCount \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration file://scaling-policy.json
```

Create `scaling-policy.json`:

```json
{
  "TargetValue": 70.0,
  "PredefinedMetricSpecification": {
    "PredefinedMetricType": "ECSServiceAverageCPUUtilization"
  },
  "ScaleOutCooldown": 300,
  "ScaleInCooldown": 300
}
```

---

## Docker Hub

### Push to Docker Hub

```bash
# Login
docker login

# Tag image
docker tag user-service:1.0.0 username/user-service:1.0.0
docker tag user-service:1.0.0 username/user-service:latest

# Push
docker push username/user-service:1.0.0
docker push username/user-service:latest
```

---

## Configuration for Production

### Environment Variables

Store in AWS Secrets Manager:

```bash
# Create secret
aws secretsmanager create-secret \
  --name user-service-config \
  --secret-string '{
    "MONGODB_URI": "mongodb+srv://user:pass@cluster.mongodb.net/db",
    "JWT_SECRET": "very-long-secret-key-here",
    "JWT_EXPIRE": "7d"
  }'
```

### MongoDB Atlas Configuration

```javascript
// Recommended settings for production
{
  "connection": {
    "maxPoolSize": 50,
    "minPoolSize": 10,
    "maxIdleTimeMS": 45000,
    "waitQueueTimeoutMS": 10000
  },
  "backup": {
    "enabled": true,
    "frequency": "daily"
  },
  "monitoring": {
    "enabled": true,
    "alerts": true
  }
}
```

### Security Groups

**Ingress Rules:**

```
- Port 3001: From API Gateway (e.g., 10.0.1.0/24)
- Port 3001: From Registration Service (e.g., 10.0.2.0/24)
```

**Egress Rules:**

```
- Port 27017: To MongoDB (e.g., 10.0.3.0/24)
- Port 443: To external services (0.0.0.0/0)
```

---

## Monitoring & Logging

### CloudWatch Logs

```bash
# Create log group
aws logs create-log-group --log-group-name /ecs/user-service

# Configure log retention (30 days)
aws logs put-retention-policy \
  --log-group-name /ecs/user-service \
  --retention-in-days 30
```

### CloudWatch Alarms

```bash
# High CPU
aws cloudwatch put-metric-alarm \
  --alarm-name user-service-high-cpu \
  --alarm-description "Alert when CPU exceeds 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold

# Task failures
aws cloudwatch put-metric-alarm \
  --alarm-name user-service-task-failures \
  --alarm-description "Alert on task failures" \
  --metric-name TaskFailures \
  --namespace AWS/ECS \
  --statistic Sum \
  --period 60 \
  --threshold 1 \
  --comparison-operator GreaterThanOrEqualToThreshold
```

### Application Performance Monitoring

**Recommended Tools:**

- New Relic
- Datadog
- Dynatrace
- AWS X-Ray

Example with AWS X-Ray:

```javascript
const AWSXRay = require("aws-xray-sdk-core");
const http = AWSXRay.captureHttpsModule(require("http"));
const mongo = AWSXRay.captureAsyncFunc("Mongoose", async function () {
  // Database operations
});
```

---

## Scaling

### Horizontal Scaling

**Load Balancer Configuration:**

```yaml
LoadBalancer:
  Type: AWS::ElasticLoadBalancingV2::LoadBalancer
  Properties:
    Scheme: internet-facing
    Subnets:
      - subnet-xxx
      - subnet-yyy
    SecurityGroups:
      - sg-xxx

TargetGroup:
  Type: AWS::ElasticLoadBalancingV2::TargetGroup
  Properties:
    Port: 3001
    Protocol: HTTP
    TargetType: ip
    VpcId: vpc-xxx
    HealthCheckPath: /health
    HealthCheckIntervalSeconds: 30
    HealthCheckTimeoutSeconds: 5
    HealthyThresholdCount: 2
    UnhealthyThresholdCount: 3
```

### Vertical Scaling

**Task Definition Adjustments:**

```json
{
  "cpu": "512", // Increase from 256
  "memory": "1024" // Increase from 512
}
```

---

## Troubleshooting

### Container Won't Start

```bash
# Check logs
aws logs tail /ecs/user-service --follow

# Describe task
aws ecs describe-tasks \
  --cluster event-management-cluster \
  --tasks <task-arn>
```

### Common Issues

| Issue                    | Solution                                       |
| ------------------------ | ---------------------------------------------- |
| MongoDB connection fails | Check security group, verify connection string |
| Out of memory            | Increase task memory in task definition        |
| High latency             | Add more replicas, check MongoDB indexes       |
| Pod restarts             | Check health check endpoint, review logs       |

### Performance Optimization

```javascript
// Add connection pooling
const mongooseOptions = {
  maxPoolSize: 50,
  minPoolSize: 10,
  socketTimeoutMS: 45000,
};

// Add caching
const cache = require("node-cache");
const userCache = new cache({ stdTTL: 600 });
```

---

## CI/CD Integration

### GitHub Actions Workflow

```yaml
name: Deploy to AWS ECS

on:
  push:
    branches: [main]
    paths:
      - "user-service/**"

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Build and Push Docker Image
        run: |
          aws ecr get-login-password | docker login --username AWS --password-stdin ${{ secrets.ECR_URI }}
          docker build -t ${{ secrets.ECR_URI }}/user-service:${{ github.sha }} user-service/
          docker push ${{ secrets.ECR_URI }}/user-service:${{ github.sha }}

      - name: Update ECS Service
        run: |
          aws ecs update-service \
            --cluster event-management-cluster \
            --service user-service \
            --force-new-deployment
```

---

## Backup & Disaster Recovery

### MongoDB Backup

```bash
# Enable MongoDB Atlas backup
aws docdb describe-db-clusters \
  --db-cluster-identifier event-management-db

# Restore from backup
aws docdb restore-db-cluster-from-snapshot \
  --db-cluster-identifier restored-cluster \
  --snapshot-id backup-snapshot
```

### Data Replication

**Multi-region setup:**

```javascript
// Primary region
MONGODB_URI=mongodb+srv://...us-east-1...

// Failover region
BACKUP_MONGODB_URI=mongodb+srv://...us-west-2...
```

---

## Security Checklist

- [ ] All secrets in AWS Secrets Manager
- [ ] HTTPS/TLS enabled on load balancer
- [ ] Security groups properly configured
- [ ] IAM roles follow least privilege
- [ ] Docker image scanning enabled
- [ ] Logging and monitoring configured
- [ ] Auto-scaling policies set
- [ ] Database backups configured
- [ ] Disaster recovery plan tested

---

## Rollback Procedure

```bash
# If deployment fails, rollback to previous task definition
aws ecs update-service \
  --cluster event-management-cluster \
  --service user-service \
  --task-definition user-service:1 \
  --force-new-deployment
```

---

## Cost Optimization

- Use Fargate Spot for non-critical deployments (70% cheaper)
- Set appropriate resource limits (CPU/Memory)
- Configure auto-scaling properly
- Use CloudWatch cost anomaly detection
- Review and remove unused resources

---

## Support & Documentation

- [AWS ECS Documentation](https://docs.aws.amazon.com/ecs/)
- [Docker Documentation](https://docs.docker.com/)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)

---

## Quick Commands Reference

```bash
# View running services
aws ecs list-services --cluster event-management-cluster

# Check service status
aws ecs describe-services --cluster event-management-cluster --services user-service

# View task logs
aws logs tail /ecs/user-service --follow

# Scale service
aws ecs update-service --cluster event-management-cluster --service user-service --desired-count 5

# Force new deployment
aws ecs update-service --cluster event-management-cluster --service user-service --force-new-deployment
```
