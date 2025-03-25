# Login Service Integration Documentation

## Overview

The Login Service is a critical component of the AWS Starter microservices architecture, responsible for user authentication and authorization. This document outlines the integration of the Login Service with the Spring Cloud infrastructure, including Eureka Service Discovery and Config Server.

## Architecture Components

The microservices architecture consists of the following key components:

1. **Spring Cloud Gateway**: Central entry point with centralized CORS configuration
2. **Eureka Service Discovery**: For dynamic service registration and discovery
3. **Config Server**: For centralized, externalized configuration
4. **Login Service**: Dedicated service for authentication and JWT token management
5. **AWS Starter API**: Core business logic service

## Login Service Configuration

### Application Name

The Login Service is registered with Eureka as `LOGIN-SERVICE`. This name is critical for service discovery and must be consistent across all configuration files.

### Configuration Sources

The Login Service retrieves its configuration from two primary sources:

1. **bootstrap.yml**: Contains minimal configuration needed to connect to the Config Server
   ```yaml
   spring:
     application:
       name: LOGIN-SERVICE
   ```

2. **Config Server**: Provides centralized configuration from the GitHub repository
   ```yaml
   # MongoDB Configuration
   spring:
     application:
       name: LOGIN-SERVICE
     data:
       mongodb:
         host: localhost
         port: 27017
         database: aws-starter
         authentication-database: admin
         username: ${MONGO_USERNAME:admin}
         password: ${MONGO_PASSWORD:password}
   ```

### Service Registration

To ensure proper registration with Eureka, the Login Service's systemd service file includes an explicit JVM parameter:

```
ExecStart=/usr/bin/java -Dspring.application.name=LOGIN-SERVICE -jar login-service.jar
```

This ensures that the application name is set correctly even if the bootstrap.yml or Config Server configuration fails to load.

## Config Server Optimization

The Config Server is configured to efficiently serve configurations while minimizing resource usage on the t2.small EC2 instance (2GB RAM).

### Memory Allocation

The Config Server's memory allocation has been optimized to prevent OutOfMemoryError issues:

```
ExecStart=/usr/bin/java -Xmx256m -Xms128m ...
```

### Repository Cloning Optimization

To prevent memory issues when cloning large repositories, the Config Server is configured to focus only on the config-repo directory:

```
-DSPRING_CLOUD_CONFIG_SERVER_GIT_SEARCH_PATHS=config-repo
```

## Troubleshooting

### Common Issues

1. **Service Registering as "UNKNOWN" in Eureka**
   - **Cause**: Application name not properly configured or not being picked up
   - **Solution**: Ensure spring.application.name is set in bootstrap.yml and as a JVM parameter

2. **Config Server OutOfMemoryError**
   - **Cause**: Insufficient heap space when cloning repository
   - **Solution**: Increase heap space allocation and specify search paths to limit cloning scope

3. **Service Not Appearing in Eureka**
   - **Cause**: Service not starting properly or not connecting to Eureka
   - **Solution**: Check service logs, ensure Eureka client is properly configured

### Verification Steps

To verify that the Login Service is properly integrated:

1. Check Eureka dashboard at http://[EC2-IP]:8761
2. Verify Login Service appears as "LOGIN-SERVICE"
3. Test authentication endpoints through the API Gateway

## Deployment

The Login Service is deployed using a systemd service file that ensures it starts automatically and with the correct configuration:

```
[Unit]
Description=Login Service
After=service-discovery.service config-server.service
Requires=service-discovery.service config-server.service

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/login-service
EnvironmentFile=/home/ubuntu/login-service/.env
ExecStart=/usr/bin/java -Dspring.application.name=LOGIN-SERVICE -jar login-service.jar
SuccessExitStatus=143
TimeoutStopSec=10
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

## Future Improvements

1. Implement circuit breakers for resilience
2. Add rate limiting to protect against abuse
3. Enhance security with OAuth2 integration
4. Implement distributed tracing for better debugging
