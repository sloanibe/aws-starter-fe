# Service Discovery with Eureka

## Overview

This document details the implementation of the Eureka Service Discovery server, which is a critical component in our Spring Cloud microservices architecture. Eureka enables services to find and communicate with each other without hardcoding hostname and port information.

## Implementation Plan

### 1. Project Setup

Create a new Spring Boot project with the following dependencies:

```xml
<dependencies>
    <!-- Eureka Server -->
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-netflix-eureka-server</artifactId>
    </dependency>
    
    <!-- Config Client (optional, for centralized configuration) -->
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-config</artifactId>
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
  port: 8761

spring:
  application:
    name: eureka-server
  config:
    import: optional:configserver:http://localhost:8888

eureka:
  client:
    register-with-eureka: false
    fetch-registry: false
    service-url:
      defaultZone: http://localhost:8761/eureka/
  server:
    wait-time-in-ms-when-sync-empty: 0
    enable-self-preservation: false

management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics
```

### 3. Main Application Class

```java
package com.example.eurekaserver;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;

@SpringBootApplication
@EnableEurekaServer
public class EurekaServerApplication {
    public static void main(String[] args) {
        SpringApplication.run(EurekaServerApplication.class, args);
    }
}
```

### 4. Resource Configuration

For optimal performance on a t2.micro instance:

```
JVM_OPTS="-Xms128m -Xmx256m -XX:+UseG1GC"
```

### 5. Deployment Script

Create a deployment script for the Eureka Server:

```bash
#!/bin/bash

# Build the application
./mvnw clean package -DskipTests

# Copy to deployment directory
scp -i /path/to/key.pem target/eureka-server-0.0.1-SNAPSHOT.jar ubuntu@ec2-instance:/opt/eureka-server/

# Create systemd service
cat << EOF | ssh -i /path/to/key.pem ubuntu@ec2-instance "sudo tee /etc/systemd/system/eureka-server.service"
[Unit]
Description=Eureka Service Discovery Server
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/opt/eureka-server
ExecStart=/usr/bin/java -Xms128m -Xmx256m -XX:+UseG1GC -jar /opt/eureka-server/eureka-server-0.0.1-SNAPSHOT.jar
SuccessExitStatus=143
TimeoutStopSec=10
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

# Enable and start the service
ssh -i /path/to/key.pem ubuntu@ec2-instance "sudo systemctl enable eureka-server.service && sudo systemctl start eureka-server.service"
```

## Verifying Service Discovery

To verify the Eureka Server is working correctly:

1. Access the Eureka dashboard at `http://localhost:8761`
2. Verify that the dashboard shows the server is up and running
3. After deploying other services, verify they register with Eureka and appear in the dashboard

## High Availability Considerations (Future Enhancement)

For production environments, consider setting up a Eureka cluster for high availability:

```yaml
# Example configuration for Eureka HA (multiple instances)
eureka:
  client:
    service-url:
      defaultZone: http://eureka-1:8761/eureka/,http://eureka-2:8762/eureka/
```

## Security Considerations (Future Enhancement)

For production environments, consider securing the Eureka server:

```yaml
# Example security configuration
spring:
  security:
    user:
      name: eureka
      password: ${EUREKA_PASSWORD:securepassword}

eureka:
  client:
    service-url:
      defaultZone: http://eureka:${EUREKA_PASSWORD:securepassword}@localhost:8761/eureka/
```

## Next Steps

Once the Eureka Service Discovery server is implemented and tested, we can proceed to:

1. Configure all services (Gateway, Auth Service, Dashboard Service) to register with Eureka
2. Implement service-to-service communication using Eureka service discovery
3. Set up the Config Server for centralized configuration management
