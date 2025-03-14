# Spring Boot AWS Deployment Debug Context

## Current Status
- Application deployment to EC2 is failing
- MongoDB connection issues with SSL/TLS
- Process management issues on EC2 instance

## Environment Details
- EC2 Host: 44.234.191.56
- MongoDB Host: aws-starter.j7v6t.mongodb.net
- Application Port: 8080

## Configuration Files

### application.yml
```yaml
spring:
  data:
    mongodb:
      uri: mongodb+srv://${MONGODB_USER}:${MONGODB_PASSWORD}@${MONGODB_HOST}/${MONGODB_DATABASE}?retryWrites=true&w=majority&authSource=${MONGODB_AUTH_DATABASE}&ssl=true&tls=true&tlsAllowInvalidCertificates=true

logging:
  level:
    root: ${SPRING_LOG_LEVEL:INFO}
    org.mongodb: DEBUG
```

### Environment Variables
Key environment variables from `.env`:
- MONGODB_USER=sloanibe
- MONGODB_DATABASE=aws_starter
- MONGODB_HOST=aws-starter.j7v6t.mongodb.net
- MONGODB_PORT=27017
- SERVER_PORT=8080
- SPRING_PROFILES_ACTIVE=prod

## Current Issues

### 1. MongoDB Connection
- SSL/TLS connection issues observed
- Added SSL parameters to MongoDB URI
- Still experiencing connection timeouts

### 2. Process Management
- Port 8080 conflicts observed
- Process cleanup not working consistently
- Modified deploy.sh to handle process cleanup better

### 3. Application Startup
- Application fails to start properly after deployment
- Logs show potential port binding issues
- Need to verify if Java process is running correctly

## Recent Changes

1. Modified `application.yml`:
   - Added SSL/TLS parameters to MongoDB URI
   - Added MongoDB debug logging
   - Removed duplicate database configuration

2. Enhanced `deploy.sh`:
   - Improved process cleanup
   - Added port availability check
   - Enhanced logging capabilities
   - Added proper process management

## Next Steps

1. **Process Management**
   - Verify process cleanup is working
   - Ensure port 8080 is free before starting
   - Add proper process status checking

2. **MongoDB Connection**
   - Verify MongoDB Atlas connectivity
   - Check SSL/TLS certificate validation
   - Monitor connection timeouts

3. **Logging**
   - Implement better log capture
   - Monitor application startup sequence
   - Track MongoDB connection attempts

4. **Security**
   - Verify environment variable transfer
   - Ensure sensitive data is properly handled
   - Check EC2 security group settings

## Commands for Debugging

```bash
# Check running Java processes
ps aux | grep java

# Check port usage
sudo netstat -tln | grep 8080

# View application logs
cat /home/ec2-user/app.log

# Monitor log in real-time
tail -f /home/ec2-user/app.log
```

## Additional Notes
- The application is using Spring Boot 3.2.1
- MongoDB Atlas is being used as the database
- Environment variables are properly transferred to EC2
- Process management needs improvement
- Log capture and monitoring need enhancement
