# Spring Boot Server Authentication Issue

## Current Status
- **Issue**: Spring Boot server failing to authenticate with MongoDB
- **Error**: `Exception authenticating MongoCredential{mechanism=SCRAM-SHA-1, userName='aws_starter_user', source='aws_starter_db'}`
- **Root Cause**: Mismatch between application's expected MongoDB user (`aws_starter_user`) and actual MongoDB credentials being used (`admin`)

## Server Details
- **EC2 IP Address**: 13.52.157.48
- **Domain**: api.sloandev.net (points to API Gateway, not EC2)
- **Spring Boot Port**: 8080
- **Current MongoDB URI**: `mongodb://admin:admin123@localhost:27017/aws_starter_db?authSource=admin`

## Server Deployment
- **Location**: `/home/ubuntu/aws-starter-api/`
- **JAR File**: `aws-starter-api-0.0.1-SNAPSHOT.jar`
- **Current Process ID**: 184067

### Current Deployment Command
```bash
cd /home/ubuntu/aws-starter-api && \
nohup java -Xmx512m -Xms256m \
  -DSERVER_PORT=8080 \
  -DSPRING_PROFILES_ACTIVE=prod \
  -DAPP_NAME=aws-starter-api \
  -DMONGODB_URI=$(grep MONGODB_URI .env | cut -d"=" -f2-) \
  -jar aws-starter-api-0.0.1-SNAPSHOT.jar > app.log 2>&1 &
```

## Next Steps
1. Verify MongoDB initialization script content
2. Create correct MongoDB user (`aws_starter_user`) or update application to use admin credentials
3. Restart Spring Boot application with correct credentials
4. Verify API endpoints are working through API Gateway

## Important Files
- **Application Logs**: `/home/ubuntu/aws-starter-api/app.log`
- **MongoDB Init Script**: `/home/ubuntu/aws-starter-api/mongodb-init.js`
- **Environment File**: `/home/ubuntu/aws-starter-api/.env`
- **Nginx Config**: `/etc/nginx/sites-available/api.sloandev.net`

## Access Commands
```bash
# SSH to server
ssh -i ~/.ssh/aws-starter-key.pem ubuntu@13.52.157.48

# Check application status
ps aux | grep java

# View logs
tail -f /home/ubuntu/aws-starter-api/app.log

# Check MongoDB users
mongosh --quiet --eval "db.getUsers()" --username admin --password admin123 --authenticationDatabase admin
```
