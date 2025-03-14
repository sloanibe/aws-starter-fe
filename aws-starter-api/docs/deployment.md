# AWS Spring Boot Deployment Guide

## Infrastructure Overview
- Backend: Spring Boot application
- Database: MongoDB running on EC2 (IP: 3.101.153.60)
- Deployment: Direct deployment to EC2 using rsync

## Deployment Process
Our deployment process uses a bash script (`deploy-backend.sh`) that:
1. Builds the Spring Boot jar using Maven
2. Syncs the jar file to EC2 using rsync
3. Stops any existing application instance
4. Starts the new version

### Key Components
- **EC2 Instance**: Runs MongoDB and hosts our Spring Boot application
- **SSH Key**: `aws-starter-mongo-key.pem` used for secure connection
- **Application Directory**: `/home/ubuntu/app` on EC2 instance

### Deployment Commands
```bash
# Check EC2 instance status
aws ec2 describe-instance-status --instance-ids i-01d80332e1a5ef33f

# SSH into instance
ssh -i /home/msloan/aws-starter-mongo-key.pem ubuntu@3.101.153.60

# Deploy application
./deploy-backend.sh
```

### Monitoring
- Application logs are stored in `/home/ubuntu/app/app.log`
- Process can be monitored using `ps aux | grep java`

## Future Improvements
1. **Containerization**: Consider using Docker for consistent deployments
2. **CI/CD Pipeline**: Implement AWS CodePipeline and CodeDeploy
3. **Process Manager**: Add systemd service for better process management
4. **Load Balancer**: Consider adding ALB for high availability
