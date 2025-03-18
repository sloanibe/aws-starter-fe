# Deployment Process

This document outlines the detailed deployment process for both the frontend and backend components of the AWS Starter Project.

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

The Spring Boot backend is deployed to an EC2 instance (IP: 13.52.157.48) using a deployment script.

### Deployment Process Details

The deployment script (`scripts/deploy/deploy-backend.sh`) performs the following steps:

1. **Build Application**:
   ```bash
   ./mvnw clean package -DskipTests
   ```

2. **Server Preparation**:
   - Creates remote directory: `/home/ubuntu/aws-starter-api`
   - Uses SSH key: `aws-starter-key.pem`

3. **Application Deployment**:
   - Copies JAR file to EC2 using SCP
   - Checks for existing application process
   - Gracefully stops any running instance
   - Starts new application with logging:
     ```bash
     nohup java -jar aws-starter-api.jar > app.log 2>&1 &
     ```

### Process Management

1. **Systemd Service Configuration**:
   ```ini
   [Service]
   Type=simple
   User=ec2-user
   WorkingDirectory=/home/ec2-user/aws-starter-api
   ExecStart=/usr/bin/java -Xmx512m -Xms256m -jar aws-starter-api.jar
   Restart=always
   RestartSec=5
   ```

2. **Memory Configuration**:
   - Maximum heap: 512MB
   - Initial heap: 256MB
   - Auto-restart on failure

### Environment Configuration

1. **MongoDB Settings**:
   ```yaml
   spring.data.mongodb:
     uri: mongodb://${MONGO_USER:aws_starter_user}:${MONGO_PWD:aws_starter_pass}@localhost:27017/aws_starter_db
     database: aws_starter_db
   ```
   - Connection timeout: 3000ms
   - Authentication required
   - Configurable via environment variables:
     - MONGO_USER
     - MONGO_PWD

2. **AWS Integration**:
   - Region: us-west-1 (configurable via AWS_REGION)
   - SES Email Service:
     - Sender: sloanibe@gmail.com
     - Template: login-notification-dev

3. **Application Settings**:
   - Server port: 8080
   - Binds to: 0.0.0.0 (all interfaces)
   - Immediate shutdown mode

4. **Security Settings**:
   - CORS allowed origins:
     ```
     - http://localhost:3000,5173,5174
     - http://aws-starter-app.s3-website-us-west-1.amazonaws.com
     - https://d23g2ah1oukxrw.cloudfront.net
     - https://(www.|api.)?sloandev.net
     ```
   - Rate limiting:
     - Default: 10 requests/second
     - Configurable via APP_RATE_LIMIT_REQUESTS_PER_SECOND

### Monitoring and Logging

1. **Application Logs**:
   - Main log file: `app.log` in deployment directory
   - Access via SSH:
     ```bash
     ssh -i aws-starter-key.pem ubuntu@13.52.157.48 'tail -f /home/ubuntu/aws-starter-api/app.log'
     ```

2. **Health Monitoring**:
   - Spring Boot Actuator endpoints enabled
   - Health check URL: `/actuator/health`
   - Detailed health info for authorized users

## Deployment Best Practices

1. **Pre-Deployment**:
   - Test all changes locally
   - Verify MongoDB connection settings
   - Check AWS credentials and permissions
   - Commit code changes to version control

2. **During Deployment**:
   - Monitor application logs for startup errors
   - Verify MongoDB connection success
   - Check API endpoints through API Gateway
   - Validate CORS settings if making frontend changes

3. **Post-Deployment**:
   - Verify application health endpoint
   - Test critical application features
   - Monitor error rates and response times
   - Check email notification system if modified

## Troubleshooting

### Frontend Issues

1. **Build Failures**:
   - Check TypeScript errors in development
   - Verify dependency versions
   - Try skipping TypeScript check if needed: Remove `tsc -b` from build script

2. **Deployment Failures**:
   - Verify AWS credentials
   - Check S3 bucket permissions
   - Validate CloudFront distribution ID

### Backend Issues

1. **Deployment Failures**:
   - Check SSH key permissions and path
   - Verify EC2 security group allows SSH
   - Ensure sufficient disk space on EC2

2. **Application Startup**:
   - Verify MongoDB is running and accessible
   - Check environment variables
   - Review app.log for startup errors
   - Verify Java version and memory settings

3. **Runtime Issues**:
   - Check MongoDB connection errors
   - Verify AWS credentials for SES
   - Monitor rate limiting metrics
   - Review CORS configuration if API calls fail
