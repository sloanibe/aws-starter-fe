# Centralized Configuration with Spring Cloud Config

## Overview

This document details the implementation of Spring Cloud Config Server, which provides centralized, externalized configuration for all microservices in our architecture. This allows us to manage configuration properties across different environments and update them without redeploying services.

## Implementation Plan

### 1. Project Setup

Create a new Spring Boot project with the following dependencies:

```xml
<dependencies>
    <!-- Config Server -->
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-config-server</artifactId>
    </dependency>
    
    <!-- Eureka Client for service discovery -->
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
    </dependency>
    
    <!-- Actuator for health checks and metrics -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-actuator</artifactId>
    </dependency>
</dependencies>
```

### 2. Application Configuration

Create an `application.yml` file:

```yaml
server:
  port: 8888

spring:
  application:
    name: config-server
  cloud:
    config:
      server:
        git:
          uri: ${CONFIG_GIT_URI:https://github.com/yourusername/aws-starter-config}
          default-label: main
          search-paths: '{application}'
          clone-on-start: true
        # Alternatively, use a local file system repository
        # native:
        #   search-locations: file://${user.home}/config-repo

eureka:
  client:
    service-url:
      defaultZone: ${EUREKA_URI:http://localhost:8761/eureka}
  instance:
    prefer-ip-address: true

management:
  endpoints:
    web:
      exposure:
        include: health,info,refresh
```

### 3. Main Application Class

```java
package com.example.configserver;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.config.server.EnableConfigServer;

@SpringBootApplication
@EnableConfigServer
@EnableDiscoveryClient
public class ConfigServerApplication {
    public static void main(String[] args) {
        SpringApplication.run(ConfigServerApplication.class, args);
    }
}
```

### 4. Configuration Repository Setup

Create a Git repository to store configuration files for all services:

```
config-repo/
├── api-gateway/
│   ├── api-gateway.yml
│   ├── api-gateway-dev.yml
│   └── api-gateway-prod.yml
├── auth-service/
│   ├── auth-service.yml
│   ├── auth-service-dev.yml
│   └── auth-service-prod.yml
├── dashboard-service/
│   ├── dashboard-service.yml
│   ├── dashboard-service-dev.yml
│   └── dashboard-service-prod.yml
└── application.yml  # Shared configuration for all services
```

Example `application.yml` (shared configuration):

```yaml
# Common configuration shared by all services
eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka
  instance:
    prefer-ip-address: true

management:
  endpoints:
    web:
      exposure:
        include: health,info,refresh

# CORS configuration shared by all services
cors:
  allowed-origins:
    - https://sloandev.net
    - https://www.sloandev.net
    - http://localhost:3000
    - http://localhost:5173
  allowed-methods:
    - GET
    - POST
    - PUT
    - DELETE
    - OPTIONS
  allowed-headers:
    - Content-Type
    - Authorization
  allow-credentials: true
  max-age: 3600
```

Example `api-gateway.yml`:

```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: auth-service
          uri: lb://auth-service
          predicates:
            - Path=/api/auth/**
        - id: dashboard-service
          uri: lb://dashboard-service
          predicates:
            - Path=/api/dashboard/**
          filters:
            - AuthenticationFilter
```

Example `auth-service.yml`:

```yaml
spring:
  data:
    mongodb:
      uri: mongodb://localhost:27017/auth-service

jwt:
  expiration: 86400000  # 24 hours in milliseconds
```

### 5. Resource Configuration

For optimal performance on a t2.micro instance:

```
JVM_OPTS="-Xms128m -Xmx256m -XX:+UseG1GC"
```

### 6. Deployment Script

Create a deployment script for the Config Server:

```bash
#!/bin/bash

# Build the application
./mvnw clean package -DskipTests

# Copy to deployment directory
scp -i /path/to/key.pem target/config-server-0.0.1-SNAPSHOT.jar ubuntu@ec2-instance:/opt/config-server/

# Create systemd service
cat << EOF | ssh -i /path/to/key.pem ubuntu@ec2-instance "sudo tee /etc/systemd/system/config-server.service"
[Unit]
Description=Spring Cloud Config Server
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/opt/config-server
Environment="CONFIG_GIT_URI=https://github.com/yourusername/aws-starter-config"
Environment="EUREKA_URI=http://localhost:8761/eureka"
ExecStart=/usr/bin/java -Xms128m -Xmx256m -XX:+UseG1GC -jar /opt/config-server/config-server-0.0.1-SNAPSHOT.jar
SuccessExitStatus=143
TimeoutStopSec=10
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

# Enable and start the service
ssh -i /path/to/key.pem ubuntu@ec2-instance "sudo systemctl enable config-server.service && sudo systemctl start config-server.service"
```

## Configuring Services to Use Config Server

For each service (Gateway, Auth, Dashboard), update the application configuration to use the Config Server:

```yaml
spring:
  application:
    name: service-name  # e.g., api-gateway, auth-service
  config:
    import: optional:configserver:http://localhost:8888
  cloud:
    config:
      fail-fast: true  # Fail startup if cannot connect to Config Server
      retry:
        initial-interval: 1500
        multiplier: 1.5
        max-attempts: 6
```

## Refreshing Configuration at Runtime

To enable runtime configuration updates without restarting services:

1. Add the Spring Cloud Config Client dependency to each service:
   ```xml
   <dependency>
       <groupId>org.springframework.cloud</groupId>
       <artifactId>spring-cloud-starter-config</artifactId>
   </dependency>
   <dependency>
       <groupId>org.springframework.boot</groupId>
       <artifactId>spring-boot-starter-actuator</artifactId>
   </dependency>
   ```

2. Add the `@RefreshScope` annotation to configuration beans:
   ```java
   @Configuration
   @RefreshScope
   public class CorsConfig {
       // Configuration properties will be refreshed when triggered
   }
   ```

3. Trigger a refresh when configuration changes:
   ```bash
   curl -X POST http://localhost:8080/actuator/refresh
   ```

## Security Considerations (Future Enhancement)

For production environments, consider securing the Config Server:

```yaml
# Example security configuration
spring:
  security:
    user:
      name: configuser
      password: ${CONFIG_PASSWORD:securepassword}
```

And update client configurations:

```yaml
spring:
  cloud:
    config:
      uri: http://localhost:8888
      username: configuser
      password: ${CONFIG_PASSWORD:securepassword}
```

## Next Steps

Once the Config Server is implemented and tested, we can proceed to:

1. Update all services to use the Config Server for configuration
2. Implement the Dashboard Service that will use the Auth Service for authentication
3. Configure the Spring Cloud Gateway to route requests to all services
