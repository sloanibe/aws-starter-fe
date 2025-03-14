# EC2 and Spring Boot Setup

This document outlines how the Spring Boot backend is set up and deployed on an EC2 instance.

## Overview

The backend of the AWS Starter Project consists of:
- Spring Boot application serving REST APIs
- MongoDB database for data storage
- Nginx as a reverse proxy for SSL termination

All these components run on a single EC2 instance (t2.micro) in the us-west-1 region.

## EC2 Instance Setup

### Instance Configuration

The EC2 instance is provisioned using CloudFormation with the following specifications:
- Instance Type: t2.micro
- AMI: Amazon Linux 2
- Security Group: Allows inbound traffic on ports 22 (SSH), 80 (HTTP), 443 (HTTPS), and 8080 (Spring Boot)
- Elastic IP: For stable addressing (13.52.157.48)
- Tags: Name=aws-starter-combined, AutoStop=true

### Security Group Configuration

The security group is configured to allow:
- SSH access (port 22) for administration
- HTTP (port 80) for Nginx
- HTTPS (port 443) for secure API access
- Direct access to Spring Boot (port 8080) for testing

## Spring Boot Application

### Application Structure

The Spring Boot application (`aws-starter-api`) is a simple REST API with:
- Controller for handling API requests
- MongoDB integration for data persistence
- CORS configuration for cross-origin requests

### Key Configuration Files

#### application.yml
```yaml
spring:
  data:
    mongodb:
      host: localhost
      port: 27017
      database: testdb

server:
  port: 8080
```

#### CORS Configuration
```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("https://sloandev.net")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

## MongoDB Setup

MongoDB is installed directly on the EC2 instance:

```bash
# Install MongoDB
sudo amazon-linux-extras install mongodb4.0

# Start and enable MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

## Nginx Configuration

Nginx is configured as a reverse proxy to handle SSL termination:

```nginx
server {
    listen 80;
    server_name api.sloandev.net;
    
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name api.sloandev.net;
    
    ssl_certificate /etc/letsencrypt/live/api.sloandev.net/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.sloandev.net/privkey.pem;
    
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Systemd Service Configuration

The Spring Boot application is configured as a systemd service for automatic startup and management:

```ini
[Unit]
Description=Spring Boot Application
After=syslog.target network.target

[Service]
User=ec2-user
WorkingDirectory=/home/ec2-user/app
ExecStart=/usr/bin/java -jar aws-starter-api-0.0.1-SNAPSHOT.jar
SuccessExitStatus=143
TimeoutStopSec=10
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

## Deployment Process

The Spring Boot application is deployed using a script that:
1. Builds the application locally
2. Copies the JAR file to the EC2 instance
3. Restarts the systemd service

```bash
#!/bin/bash
# Build the application
cd aws-starter-api
./mvnw clean package -DskipTests

# Copy to EC2
scp -i ~/.ssh/aws-key.pem target/aws-starter-api-0.0.1-SNAPSHOT.jar ec2-user@api.sloandev.net:/home/ec2-user/app/

# Restart the service
ssh -i ~/.ssh/aws-key.pem ec2-user@api.sloandev.net "sudo systemctl restart spring-boot-app"
```

## Starting and Stopping

The EC2 instance can be started and stopped using AWS CLI commands or the provided scripts:

```bash
# Start the instance
aws ec2 start-instances --instance-ids i-00c601082fcb6bec1 --region us-west-1

# Stop the instance
aws ec2 stop-instances --instance-ids i-00c601082fcb6bec1 --region us-west-1
```

## Monitoring and Logs

Logs for the Spring Boot application are available via:

```bash
# View Spring Boot logs
ssh ec2-user@api.sloandev.net "sudo journalctl -u spring-boot-app"

# View Nginx logs
ssh ec2-user@api.sloandev.net "sudo tail -f /var/log/nginx/access.log"
ssh ec2-user@api.sloandev.net "sudo tail -f /var/log/nginx/error.log"
```
