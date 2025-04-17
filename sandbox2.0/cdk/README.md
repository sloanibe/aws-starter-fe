# AWS Serverless Microservices Architecture

This project implements a serverless microservices architecture using AWS CDK with Kotlin. It organizes multiple Lambda functions by microservice while sharing a single API Gateway.

## Architecture Overview

![Architecture Diagram](https://mermaid.ink/img/pako:eNp1kk1PwzAMhv9KlBOgSf3YdkCcEBJiB8QFcTDNGiJIU-IUjWr_nXRlRYzBLa_fR7ZlH1FpLVBEVYNNrXbk0JjcGqtXpLUjZ6RLYEPJFbDWyqGIXgNYZ1JNZKmxQJJOxnGcJFEUxb0YNMYY9-KdGMRJ3I_7_V6cJMNBkiTnYtBgYzFKkn7c78VJPxkOhv_FJJWlRRE9-Yt3aDwt0Tn0i1xTDgvjHFm_ORfQGlnZHEW0JZfBnrTKYUmVzTLYkKkKaGxh3YFqKKJnf-7QZrBBW1AFO_Ib8NvKzFZoHcwxg1fSFVTGVlAZXUJpXQYbY3fwRLbxj9xgBhVVBVRk99RQCRdSGVRGV3BBdVnA3JgVrI3bwdxoBQ9Gzv3vHK0fwdJfMPcX_FCmhIUxJXz6Ib6hLWDmR_Xmh_jlLVXwaNTUTzk1toIHVJW_4tHnfEdb-gQnRs3gUZvpYZQiStxbG0WUurc2jvwXG0d-aeOoF_0CJxTwQQ?type=png)

## Key Components

### 1. ApiInfrastructureStack
Creates a shared API Gateway for all microservices with:
- Custom domain configuration (api.sloandev.net)
- SSL certificate
- CORS settings
- Base path mapping

### 2. MicroserviceConstruct
A custom CDK construct that:
- Groups Lambda functions by microservice
- Creates API resources for each microservice
- Manages shared configurations
- Simplifies adding new endpoints

### 3. Service Stacks
Individual stacks for each microservice that:
- Use the shared API Gateway
- Implement their own Lambda functions
- Define their own resources and permissions

## Current Microservices

### Guest Service
- Endpoints:
  - POST /guests - Register a new guest
  - GET /guests - Get all guests
- Lambda Functions:
  - register-guest
  - get-guests

### Email Service
- Endpoints:
  - POST /emails - Send an email
  - GET /emails - Get email templates
  - POST /emails/bulk - Send bulk emails
- Lambda Functions:
  - send-email
  - get-templates
  - send-bulk-email

## Adding a New Microservice

1. Create a new service stack class extending `Stack`
2. Use the `MicroserviceConstruct` to organize your Lambda functions
3. Add the new stack to `AwsStarterApp.kt`

Example:
```kotlin
// Create a new service stack
val newServiceStack = NewServiceStack(app, "NewServiceStack", 
    StackProps.builder().env(env).build(), 
    apiStack)
```

## Deployment

Deploy all stacks with:
```bash
cdk deploy --all
```

Or deploy individual stacks:
```bash
cdk deploy ApiInfrastructureStack
cdk deploy GuestServiceStack
```

## Benefits of This Architecture

1. **Organizational Clarity**: Each microservice has its own stack and construct
2. **Shared Infrastructure**: All microservices share a single API Gateway
3. **Simplified Management**: Common configuration is handled by the construct
4. **Easy Expansion**: Adding new microservices follows a consistent pattern
5. **Clean API Structure**: Each service has its own path prefix (/guests, /emails, etc.)
