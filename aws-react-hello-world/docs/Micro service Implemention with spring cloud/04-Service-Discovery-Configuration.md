# Service Discovery with Eureka

## Overview

This document details the implementation of the Eureka Service Discovery server, which is a critical component in our Spring Cloud microservices architecture. Eureka enables services to find and communicate with each other without hardcoding hostname and port information.

**Current Status:** Deployed and operational at http://13.52.157.48:8761/

## Implementation Plan

### 1. Project Setup

We've created a new Spring Boot project with the following dependencies in the `service-discovery-service` directory:

```xml
<dependencies>
    <!-- Eureka Server -->
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-netflix-eureka-server</artifactId>
    </dependency>
    
    <!-- Actuator for health checks and metrics -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-actuator</artifactId>
    </dependency>
    
    <!-- Spring Boot Web -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
</dependencies>
```

The project uses Spring Boot 3.2.3 and Spring Cloud 2023.0.0.

### 2. Application Configuration

We've created two configuration files:

**application.properties** (Development):

```properties
# Server configuration
server.port=8761
spring.application.name=service-discovery

# Eureka configuration
eureka.client.register-with-eureka=false
eureka.client.fetch-registry=false
eureka.server.enable-self-preservation=false
eureka.server.eviction-interval-timer-in-ms=30000
eureka.server.renewal-percent-threshold=0.85

# Logging configuration
logging.level.com.netflix.eureka=INFO
logging.level.com.netflix.discovery=INFO

# Actuator endpoints
management.endpoints.web.exposure.include=health,info,metrics
management.endpoint.health.show-details=always
```

**application-prod.properties** (Production):

```properties
# Production-specific settings
server.port=8761

# Eureka configuration
eureka.instance.hostname=localhost
eureka.instance.prefer-ip-address=true
eureka.client.register-with-eureka=false
eureka.client.fetch-registry=false

# Security settings
management.endpoints.web.exposure.include=health,info
management.endpoint.health.show-details=when_authorized

# Logging configuration
logging.file.name=eureka.log
logging.level.root=INFO
logging.level.com.netflix.eureka=WARN
logging.level.com.netflix.discovery=WARN
```

### 3. Main Application Class

```java
package com.example.servicediscovery;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;

@SpringBootApplication
@EnableEurekaServer
public class ServiceDiscoveryApplication {
    public static void main(String[] args) {
        SpringApplication.run(ServiceDiscoveryApplication.class, args);
    }
}
```

### 4. Resource Configuration

We've configured the service for optimal performance on a t2.micro instance with the following JVM settings in the systemd service file:

```
-Xmx256m -Xms128m
```

This configuration allocates 256MB maximum heap and 128MB initial heap, which is sufficient for the Eureka server's needs while leaving resources for other services on the same instance.

### 5. Deployment Infrastructure

We've implemented two deployment options for the Eureka server:

#### 5.1 Direct Deployment Script

The script `infrastructure/scripts/deploy/deploy-eureka.sh` handles building and deploying the application to an existing EC2 instance:

```bash
#!/bin/bash

# Set variables
EC2_IP="13.52.157.48"
SSH_KEY="/home/msloan/.ssh/aws-starter-key.pem"
APP_NAME="service-discovery-service"
APP_JAR="service-discovery-service/target/${APP_NAME}-0.0.1-SNAPSHOT.jar"
REMOTE_DIR="/home/ubuntu/${APP_NAME}"

# Build the application
cd service-discovery-service
./mvnw clean package -DskipTests
cd ..

# Copy to deployment directory
scp -i $SSH_KEY $APP_JAR ubuntu@$EC2_IP:$REMOTE_DIR/

# Copy systemd service file
scp -i $SSH_KEY service-discovery-service/service-discovery.service ubuntu@$EC2_IP:/tmp/

# Install and start the service
ssh -i $SSH_KEY ubuntu@$EC2_IP "sudo mv /tmp/service-discovery.service /etc/systemd/system/ && \
    sudo systemctl daemon-reload && \
    sudo systemctl restart service-discovery.service && \
    sudo systemctl enable service-discovery.service"
```

#### 5.2 CloudFormation Deployment

We've also created a CloudFormation template (`infrastructure/cloudformation/eureka-service.yml`) for infrastructure-as-code deployment, which includes:

- EC2 instance configuration
- Security group with port 8761 open
- Systemd service setup
- User data script for initial setup

The CloudFormation deployment script is available at `infrastructure/scripts/deploy/deploy-eureka-cf.sh`.

## Working with the Eureka Server

### Accessing the Eureka Dashboard

The Eureka dashboard is available at: http://13.52.157.48:8761/

This dashboard provides a visual representation of all registered services and their status.

### Health Monitoring

You can check the health of the Eureka server using the Actuator endpoint:

```
http://13.52.157.48:8761/actuator/health
```

This returns a JSON response with the current status of the server and its components.

### Managing the Service

The Eureka service can be managed using our standard `services.sh` script:

```bash
# Check status
./scripts/server/services.sh status --service=eureka

# Start the service
./scripts/server/services.sh start --service=eureka

# Stop the service
./scripts/server/services.sh stop --service=eureka

# Restart the service
./scripts/server/services.sh restart --service=eureka
```

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

## Integrating Services with Eureka

### Registering Existing Services

To register the existing Spring Boot application with Eureka, follow these steps:

1. **Add Dependencies**

   Update the `pom.xml` of your service:

   ```xml
   <!-- Eureka Client -->
   <dependency>
       <groupId>org.springframework.cloud</groupId>
       <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
   </dependency>
   ```

   Also add the Spring Cloud BOM:

   ```xml
   <dependencyManagement>
       <dependencies>
           <dependency>
               <groupId>org.springframework.cloud</groupId>
               <artifactId>spring-cloud-dependencies</artifactId>
               <version>2023.0.0</version>
               <type>pom</type>
               <scope>import</scope>
           </dependency>
       </dependencies>
   </dependencyManagement>
   ```

2. **Enable Discovery Client**

   Add `@EnableDiscoveryClient` to your main application class:

   ```java
   @SpringBootApplication
   @EnableDiscoveryClient
   public class YourApplication {
       // ...
   }
   ```

3. **Configure Eureka Client**

   Add to your `application.properties`:

   ```properties
   # Eureka Client Configuration
   spring.application.name=aws-starter-api
   eureka.client.serviceUrl.defaultZone=http://13.52.157.48:8761/eureka/
   eureka.client.register-with-eureka=true
   eureka.client.fetch-registry=true
   eureka.instance.prefer-ip-address=true
   ```

4. **Update Deployment Script**

   Ensure your deployment script passes the Eureka configuration:

   ```bash
   -Deureka.client.serviceUrl.defaultZone=http://13.52.157.48:8761/eureka/ \
   -Deureka.instance.ip-address=YOUR_SERVICE_IP
   ```

### Service-to-Service Communication

Once services are registered with Eureka, you can use service discovery for communication:

```java
@Autowired
private DiscoveryClient discoveryClient;

public String callService() {
    List<ServiceInstance> instances = discoveryClient.getInstances("SERVICE-NAME");
    if (instances != null && !instances.isEmpty()) {
        URI serviceUri = instances.get(0).getUri();
        // Use RestTemplate or WebClient to call the service
    }
    return "Fallback response";
}
```

Alternatively, use Spring Cloud's `@LoadBalanced` RestTemplate:

```java
@Bean
@LoadBalanced
public RestTemplate restTemplate() {
    return new RestTemplate();
}

// Then inject and use it with the service name
@Autowired
private RestTemplate restTemplate;

public String callService() {
    return restTemplate.getForObject("http://SERVICE-NAME/api/resource", String.class);
}
```

## Next Steps

Now that the Eureka Service Discovery server is implemented and operational, we can proceed to:

1. Update the existing `aws-starter-api` to register with Eureka
2. Set up the Config Server for centralized configuration management
3. Implement the Spring Cloud Gateway with centralized CORS handling
4. Begin extracting functionality into dedicated microservices
