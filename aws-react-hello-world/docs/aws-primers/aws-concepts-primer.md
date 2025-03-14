---
title: AWS Concepts Primer
description: A comprehensive guide to AWS concepts for your application
---

# AWS Concepts Primer for Your Application

This document provides a simple explanation of the AWS concepts and components used in your application. It's designed to help you understand and maintain your application without requiring deep AWS expertise.

## Table of Contents
1. [Application Architecture Overview](#application-architecture-overview)
2. [DNS Records and Route 53](#dns-records-and-route-53)
3. [EC2 Instances](#ec2-instances)
4. [API Gateway](#api-gateway)
5. [S3 and CloudFront](#s3-and-cloudfront)
6. [Security Groups](#security-groups)
7. [SSL/TLS Certificates (ACM)](#ssltls-certificates-acm)
8. [Common Maintenance Tasks](#common-maintenance-tasks)
9. [Troubleshooting Guide](#troubleshooting-guide)

## Application Architecture Overview

Your application consists of:

1. **Frontend**: React application hosted on S3 and served via CloudFront at `sloandev.net`
2. **Backend**: Spring Boot API running on an EC2 instance, accessible through API Gateway at `api.sloandev.net`
3. **Web Server**: NGINX running on the EC2 instance, serving as a reverse proxy for the Spring Boot API
4. **Database**: MongoDB running on the same EC2 instance as the Spring Boot API

Here's a simplified diagram of your architecture:

```
                                  ┌─────────────┐
                                  │   Route 53  │
                                  │  DNS Records│
                                  └──────┬──────┘
                                         │
                 ┌─────────────────────┐ │ ┌────────────────────┐
                 │                     │ │ │                    │
                 ▼                     │ │ ▼                    │
        ┌─────────────────┐            │ │           ┌──────────────────┐
        │   CloudFront    │◄───────────┘ └──────────►│   API Gateway    │
        │  Distribution   │  sloandev.net  api.sloandev.net  │            │
        └────────┬────────┘                          └──────────┬───────┘
                 │                                              │
                 ▼                                              ▼
        ┌─────────────────┐                           ┌──────────────────┐
        │ S3 Bucket with  │                           │   EC2 Instance   │
        │  React Frontend │                           │                  │
        └─────────────────┘                           │  ┌────────────┐  │
                                                      │  │   NGINX    │  │
                                                      │  │(Reverse Proxy)│  │
                                                      │  └─────┬──────┘  │
                                                      │        │         │
                                                      │  ┌─────▼──────┐  │
                                                      │  │Spring Boot │  │
                                                      │  │    API     │  │
                                                      │  └────────────┘  │
                                                      │                  │
                                                      │  ┌────────────┐  │
                                                      │  │  MongoDB   │  │
                                                      │  │  Database  │  │
                                                      │  └────────────┘  │
                                                      └──────────────────┘
```

## DNS Records and Route 53

### What is DNS?
DNS (Domain Name System) translates human-readable domain names (like `sloandev.net`) into IP addresses that computers use to identify each other.

### Your DNS Setup
Your domain `sloandev.net` is managed in AWS Route 53, which contains the following key records:

1. **A Record for `sloandev.net`**: Points to your CloudFront distribution
   - This allows users to access your React frontend by visiting `sloandev.net`

2. **A Record for `api.sloandev.net`**: Points to your API Gateway
   - This allows your frontend to make API calls to your backend at `api.sloandev.net`

### How to View Your DNS Records
```bash
aws route53 list-resource-record-sets --hosted-zone-id YOUR_HOSTED_ZONE_ID
```

### How to Update DNS Records
If you need to update where your domain points (e.g., if you recreate your API Gateway):

1. Create a change batch file (like the one in `/infrastructure/route53-change-batch.json`)
2. Run:
```bash
aws route53 change-resource-record-sets --hosted-zone-id YOUR_HOSTED_ZONE_ID --change-batch file://path/to/change-batch.json
```

### Common DNS Issues
- **DNS Propagation Delay**: Changes to DNS records can take up to 48 hours to propagate globally, though typically it takes 15-60 minutes
- **TTL (Time to Live)**: This value determines how long DNS resolvers cache your records. Lower values mean faster propagation but more DNS lookups

## EC2 Instances

### What is EC2?
EC2 (Elastic Compute Cloud) provides virtual servers in the cloud. Your application uses a t2.micro instance to host both your Spring Boot API and MongoDB database.

### Your EC2 Setup
- **Instance Type**: t2.micro (1 vCPU, 1 GB RAM)
- **IP Address**: 13.52.157.48
- **Operating System**: Ubuntu 22.04 LTS
- **Services Running**:
  - Spring Boot API (Java application)
  - MongoDB Database

### How to Connect to Your EC2 Instance
```bash
ssh -i ~/.ssh/aws-starter-key.pem ubuntu@13.52.157.48
```

### Common EC2 Maintenance Tasks

#### Checking if Spring Boot Application is Running
```bash
ps -ef | grep java
```

#### Restarting the Spring Boot Application
```bash
# Find the process ID
ps -ef | grep aws-starter-api | grep -v grep

# Kill the existing process
kill -9 PROCESS_ID

# Start the application again
cd /home/ubuntu/aws-starter-api
nohup java -jar aws-starter-api-0.0.1-SNAPSHOT.jar > app.log 2>&1 &
```

#### Viewing Application Logs
```bash
tail -f /home/ubuntu/aws-starter-api/app.log
```

## API Gateway

### What is API Gateway?
API Gateway is a service that creates, publishes, and manages APIs. In your application, it sits in front of your EC2 instance and provides:
- HTTPS support with a valid certificate
- Rate limiting to prevent abuse
- A stable endpoint that won't change if your EC2 instance changes

### Your API Gateway Setup
- **Endpoint**: https://21hjo105z1.execute-api.us-west-1.amazonaws.com/prod/
- **Custom Domain**: api.sloandev.net
- **Rate Limit**: 20 requests per second with a burst limit of 40
- **Target**: Your EC2 instance at 13.52.157.48

### How API Gateway Routes Requests
1. A client makes a request to `api.sloandev.net/api/tasks`
2. Route 53 directs this to your API Gateway
3. API Gateway forwards the request to your EC2 instance at 13.52.157.48:8080/api/tasks
4. Your Spring Boot application processes the request and returns a response
5. API Gateway returns this response to the client

### Updating API Gateway
If you need to update your API Gateway (e.g., to point to a new EC2 instance):

1. Update the CloudFormation template in `/infrastructure/api-gateway.yml`
2. Run the deployment script:
```bash
cd /infrastructure
./deploy-api-gateway.sh
```

## NGINX

### What is NGINX?
NGINX is a high-performance web server that can also function as a reverse proxy, load balancer, and HTTP cache. In your application, NGINX serves as a reverse proxy that sits between the API Gateway and your Spring Boot application.

### Your NGINX Setup
- **Location**: Running on your EC2 instance
- **Configuration File**: `/etc/nginx/sites-available/default`
- **Primary Role**: Reverse proxy for your Spring Boot application
- **Port Configuration**: Listens on port 80 and forwards requests to your Spring Boot application on port 8080

### NGINX and API Gateway: Why Both?
You might wonder why your architecture uses both API Gateway and NGINX. Here's why this dual-layer approach is beneficial:

1. **Different Responsibilities**:
   - **API Gateway**: Handles external concerns (HTTPS, rate limiting, domain management)
   - **NGINX**: Handles internal routing on your EC2 instance

2. **Request Flow**:
   ```
   Internet → API Gateway → EC2 Instance → NGINX → Spring Boot Application
   ```

3. **Complementary Security**:
   - API Gateway protects against external threats and DDoS attacks
   - NGINX provides an additional security layer for your application

4. **Flexibility for Growth**:
   - If you add more services to your EC2 instance, NGINX can route to different applications based on URL paths without changing your API Gateway configuration

### Benefits of Using NGINX with API Gateway
1. **Local Request Handling**: Efficiently routes traffic to your Spring Boot application on port 8080
2. **Security**: Acts as a buffer between the internet and your application server
3. **Performance**: Can handle many concurrent connections and cache responses
4. **Flexibility**: Can serve static files directly while forwarding API requests to your Spring Boot application
5. **Load Balancing**: Can distribute traffic across multiple application servers (if you scale up in the future)

### Common NGINX Maintenance Tasks

#### Checking NGINX Status
```bash
sudo systemctl status nginx
```

#### Restarting NGINX
```bash
sudo systemctl restart nginx
```

#### Viewing NGINX Logs
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

#### Modifying NGINX Configuration
```bash
# Edit the configuration
sudo nano /etc/nginx/sites-available/default

# Test the configuration for syntax errors
sudo nginx -t

# Reload the configuration without downtime
sudo systemctl reload nginx
```

## S3 and CloudFront

### What is S3?
S3 (Simple Storage Service) is an object storage service. Your React frontend is stored as static files in an S3 bucket.

### What is CloudFront?
CloudFront is a content delivery network (CDN) that speeds up the distribution of your web content by serving it through a worldwide network of data centers.

### Your S3 and CloudFront Setup
- **S3 Bucket**: aws-starter-app (stores your React application files)
- **CloudFront Distribution**: Serves your S3 content with HTTPS at `sloandev.net`

### Updating Your Frontend
When you make changes to your React application:

1. Build your React application
2. Upload the build files to your S3 bucket
3. (Optional) Create a CloudFront invalidation if you need the changes to be immediately visible

```bash
# Build React app
cd /aws-react-hello-world
npm run build

# Upload to S3
aws s3 sync build/ s3://aws-starter-app --delete

# Create CloudFront invalidation (optional)
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

## Security Groups

### What are Security Groups?
Security groups act as virtual firewalls for your EC2 instances, controlling inbound and outbound traffic.

### Your Security Group Setup
Your EC2 instance has a security group that allows:
- SSH (port 22) from your IP address
- HTTP (port 80) from anywhere
- HTTPS (port 443) from anywhere
- Custom TCP (port 8080) from the API Gateway IP range

### Updating Security Groups
If you need to open additional ports or restrict access:

```bash
# Add a new inbound rule (example: allow MySQL port 3306)
aws ec2 authorize-security-group-ingress \
    --group-id YOUR_SECURITY_GROUP_ID \
    --protocol tcp \
    --port 3306 \
    --cidr 0.0.0.0/0
```

## SSL/TLS Certificates (ACM)

### What is ACM?
AWS Certificate Manager (ACM) handles the complexity of creating, storing, and renewing public and private SSL/TLS certificates.

### Your Certificate Setup
- You have an ACM certificate for `*.sloandev.net` that covers both `sloandev.net` and `api.sloandev.net`
- This certificate is used by both CloudFront and API Gateway to provide HTTPS

### Certificate Renewal
ACM automatically renews certificates issued through AWS. You don't need to take any action unless you receive notification emails from AWS.

## Common Maintenance Tasks

### Deploying Backend Changes
1. Build your Spring Boot application
2. Copy the JAR file to your EC2 instance
3. Restart the application

```bash
# Build the application
cd /aws-starter-api
./mvnw clean package -DskipTests

# Copy to EC2
scp -i ~/.ssh/aws-starter-key.pem target/aws-starter-api-0.0.1-SNAPSHOT.jar ubuntu@13.52.157.48:/home/ubuntu/aws-starter-api/

# Connect to EC2
ssh -i ~/.ssh/aws-starter-key.pem ubuntu@13.52.157.48

# Restart the application (on EC2)
ps -ef | grep aws-starter-api | grep -v grep | awk '{print $2}' | xargs kill -9
cd /home/ubuntu/aws-starter-api
nohup java -jar aws-starter-api-0.0.1-SNAPSHOT.jar > app.log 2>&1 &
```

### Checking MongoDB Collections
```bash
# Connect to EC2
ssh -i ~/.ssh/aws-starter-key.pem ubuntu@13.52.157.48

# Check MongoDB collections
mongosh "mongodb://admin:admin123@localhost:27017/aws_starter_db?authSource=admin" --eval 'db.getCollectionNames()'
```

### Monitoring EC2 Instance Health
```bash
# Connect to EC2
ssh -i ~/.ssh/aws-starter-key.pem ubuntu@13.52.157.48

# Check system resources
top
df -h
free -m
```

## Troubleshooting Guide

### API Gateway Returns 5xx Errors
1. Check if your EC2 instance is running: `aws ec2 describe-instance-status --instance-ids YOUR_INSTANCE_ID`
2. Check if your Spring Boot application is running on the EC2 instance
3. Verify that security groups allow traffic from API Gateway to your EC2 instance
4. Check application logs for errors: `tail -f /home/ubuntu/aws-starter-api/app.log`

### DNS Issues (Cannot Access Your Domain)
1. Verify DNS records in Route 53: `aws route53 list-resource-record-sets --hosted-zone-id YOUR_HOSTED_ZONE_ID`
2. Check if the domain is resolving correctly: `nslookup sloandev.net`
3. Remember that DNS changes can take time to propagate

### MongoDB Connection Issues
1. Check if MongoDB is running: `ps -ef | grep mongo`
2. Verify connection string in your application.yml file
3. Test direct connection to MongoDB: `mongosh "mongodb://admin:admin123@localhost:27017/aws_starter_db?authSource=admin" --eval 'db.serverStatus()'`

### SSL Certificate Issues
1. Check certificate status in ACM: `aws acm list-certificates`
2. Verify that the certificate is associated with your CloudFront distribution and API Gateway
3. Ensure the certificate covers all domains you're using (e.g., both sloandev.net and api.sloandev.net)

---

This primer covers the essential AWS concepts needed to maintain your application. For more detailed information on any specific topic, refer to the [AWS Documentation](https://docs.aws.amazon.com/).
