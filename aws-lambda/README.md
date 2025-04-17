# AWS Lambda Implementation for AWS Starter API

This project contains AWS Lambda functions that replace the Spring Boot controllers in the AWS Starter API. It's part of the migration from a traditional microservices architecture to a serverless architecture using AWS Lambda.

## Project Structure

```
aws-lambda/
├── src/main/java/
│   └── com/example/awsstarterapi/lambda/
│       └── projects/
│           ├── GetAllProjectsHandler.java  # Lambda handler for GET /projects
│           └── model/
│               └── ProjectEntity.java      # Data model
├── template.yaml                           # AWS SAM template
└── pom.xml                                 # Maven dependencies
```

## Getting Started

### Prerequisites

- AWS CLI
- AWS SAM CLI
- Java 17
- Maven

### Building the Project

```bash
mvn clean package
```

This will create a JAR file in the `target` directory.

### Deploying with SAM

```bash
# Build the SAM application
sam build

# Deploy to AWS (first time)
sam deploy --guided

# Subsequent deployments
sam deploy
```

### Testing Locally

You can test the Lambda function locally using the SAM CLI:

```bash
# Start a local API Gateway
sam local start-api

# Or invoke a specific function
sam local invoke GetAllProjectsFunction
```

## Integration with Existing Architecture

This Lambda implementation is designed to work alongside the existing Spring Boot application. The AWS API Gateway can route requests to either the Lambda functions or the existing Spring Boot API based on the path.

### Current Routes:
- `/api/projects` → Spring Boot API

### New Lambda Routes:
- `/lambda-api/projects` → Lambda function

## Environment Variables

- `MONGODB_URI`: MongoDB connection string (required)

## Security

In production, you should store the MongoDB connection string in AWS Secrets Manager and retrieve it securely in your Lambda function.

## Monitoring and Logging

All Lambda functions use SLF4J for logging. Logs are automatically sent to CloudWatch Logs.

## Next Steps

1. Implement additional Lambda functions for other endpoints
2. Set up CI/CD pipeline for automated deployment
3. Migrate database to a managed service (MongoDB Atlas or DynamoDB)
4. Implement authentication and authorization
