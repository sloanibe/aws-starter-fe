# Deployment Process

This document outlines the deployment process for both the frontend and backend components of the AWS Starter Project.

## Frontend Deployment

The React frontend is deployed to AWS S3 and distributed via CloudFront using npm scripts defined in `package.json`.

### Deployment Scripts

The following deployment scripts are available:

```json
"deploy": "npm version patch && npm run build && aws s3 sync dist s3://aws-starter-app --delete && aws cloudfront create-invalidation --distribution-id E3HMJW9ME79W32 --paths \"/*\"",
"deploy:patch": "npm version patch && npm run build && aws s3 sync dist s3://aws-starter-app --delete && aws cloudfront create-invalidation --distribution-id E3HMJW9ME79W32 --paths \"/*\"",
"deploy:minor": "npm version minor && npm run build && aws s3 sync dist s3://aws-starter-app --delete && aws cloudfront create-invalidation --distribution-id E3HMJW9ME79W32 --paths \"/*\"",
"deploy:major": "npm version major && npm run build && aws s3 sync dist s3://aws-starter-app --delete && aws cloudfront create-invalidation --distribution-id E3HMJW9ME79W32 --paths \"/*\""
```

### Deployment Steps

1. **Version Increment**: The script automatically increments the version number in `package.json`
2. **Build**: Compiles and bundles the React application using Vite
3. **S3 Sync**: Uploads the built files to the S3 bucket, deleting any old files
4. **CloudFront Invalidation**: Invalidates the CloudFront cache to ensure the latest version is served

### Manual Deployment

To manually deploy the frontend:

```bash
cd /home/msloan/gitprojects/aws-starter/aws-react-hello-world
npm run deploy
```

## Backend Deployment

The Spring Boot backend is deployed to an EC2 instance using a deployment script.

### Deployment Script

The deployment script (`deploy-backend.sh`) handles:
1. Building the Spring Boot application
2. Copying the JAR file to the EC2 instance
3. Restarting the service

### Manual Deployment

To manually deploy the backend:

```bash
cd /home/msloan/gitprojects/aws-starter
./deploy-backend.sh
```

## Starting and Stopping the Environment

The project includes scripts to start and stop the AWS environment:

### Starting the Environment

```bash
cd /home/msloan/gitprojects/aws-starter
bash scripts/start-aws-env.sh
```

This script:
1. Starts the EC2 instance
2. Waits for the instance to be ready
3. Displays instance details

### Stopping the Environment

```bash
cd /home/msloan/gitprojects/aws-starter
bash scripts/stop-aws-env.sh
```

This script:
1. Stops the EC2 instance
2. Waits for the instance to be fully stopped

## Deployment Best Practices

1. **Test Locally First**: Always test changes locally before deploying
2. **Version Control**: Commit changes to version control before deploying
3. **Incremental Versioning**: Use appropriate version increments (patch, minor, major)
4. **Monitoring**: Check application logs after deployment
5. **Rollback Plan**: Have a plan for rolling back if issues are encountered

## Troubleshooting Deployment Issues

### Frontend Deployment Issues

1. **S3 Access Denied**: Check AWS credentials and bucket permissions
2. **CloudFront Invalidation Failed**: Verify distribution ID and permissions
3. **Build Errors**: Check for TypeScript errors or dependency issues

### Backend Deployment Issues

1. **SSH Connection Failed**: Check security group rules and key permissions
2. **Service Restart Failed**: Check systemd service configuration
3. **Application Startup Failed**: Check application logs for errors
