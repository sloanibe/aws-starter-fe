# Integrating Existing Services with Eureka

This guide explains how to update your existing Spring Boot application (`aws-starter-api`) to register with the Eureka Service Discovery server.

## Overview

Integrating your existing monolithic application with Eureka is the first step toward a microservices architecture. This allows:

1. Service discovery capabilities for future microservices
2. Preparation for the Spring Cloud Gateway implementation
3. Gradual migration path from monolith to microservices

## Implementation Steps

### 1. Update Dependencies

Add the following dependencies to your `aws-starter-api/pom.xml`:

```xml
<!-- Spring Cloud Dependencies BOM -->
<properties>
    <!-- Keep your existing properties -->
    <spring-cloud.version>2023.0.0</spring-cloud.version>
</properties>

<dependencies>
    <!-- Keep your existing dependencies -->
    
    <!-- Eureka Client -->
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
    </dependency>
</dependencies>

<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-dependencies</artifactId>
            <version>${spring-cloud.version}</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```

### 2. Enable Eureka Client

Update your main application class to enable the Eureka client:

```java
package com.example.awsstarterapi;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient  // Add this annotation
public class AwsStarterApiApplication {
    public static void main(String[] args) {
        SpringApplication.run(AwsStarterApiApplication.class, args);
    }
}
```

### 3. Configure Eureka Client Properties

Add the following configuration to your `application.properties`:

```properties
# Eureka Client Configuration
spring.application.name=aws-starter-api
eureka.client.serviceUrl.defaultZone=http://13.52.157.48:8761/eureka/
eureka.client.register-with-eureka=true
eureka.client.fetch-registry=true

# Instance Configuration
eureka.instance.prefer-ip-address=true
eureka.instance.instance-id=${spring.application.name}:${random.value}
```

For the production environment, add these to `application-prod.properties`:

```properties
# Production Eureka Configuration
eureka.client.serviceUrl.defaultZone=http://13.52.157.48:8761/eureka/
eureka.instance.ip-address=13.52.157.48
```

### 4. Update Deployment Script

Update your deployment script to ensure the Eureka client properties are passed to the application:

```bash
# In deploy-springboot.sh, update the java command:
ssh -i $SSH_KEY ubuntu@$EC2_IP "cd $REMOTE_DIR && \
    nohup java -Xmx512m -Xms256m \
        -DSERVER_PORT=8080 \
        -DSPRING_PROFILES_ACTIVE=prod \
        -DAPP_NAME=aws-starter-api \
        -DMONGODB_URI=\$(grep MONGODB_URI .env | cut -d'=' -f2-) \
        -Deureka.client.serviceUrl.defaultZone=http://13.52.157.48:8761/eureka/ \
        -Deureka.instance.ip-address=13.52.157.48 \
        -jar ${APP_NAME}-0.0.1-SNAPSHOT.jar > app.log 2>&1 &"
```

## Testing the Integration

After deploying the updated application:

1. Check the Eureka dashboard at http://13.52.157.48:8761/
2. Verify that `AWS-STARTER-API` appears in the "Instances currently registered with Eureka" section
3. Check the health status of your application

## Troubleshooting

### Common Issues

1. **Service not registering with Eureka**
   - Verify network connectivity between your application and Eureka
   - Check that the Eureka server URL is correct
   - Ensure the application has the correct dependencies

2. **Wrong IP address in Eureka dashboard**
   - Set `eureka.instance.prefer-ip-address=true`
   - Explicitly set `eureka.instance.ip-address` in production

3. **Application crashes after adding Eureka client**
   - Check for dependency conflicts
   - Ensure Spring Cloud and Spring Boot versions are compatible

## Next Steps

After successfully integrating your existing application with Eureka:

1. Deploy the Config Server for centralized configuration
2. Implement the Spring Cloud Gateway with centralized CORS handling
3. Begin extracting functionality into dedicated microservices
