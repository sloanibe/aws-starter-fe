# Spring Cloud Gateway with Centralized CORS Configuration

## Overview

This document details the implementation of Spring Cloud Gateway as the entry point for our microservices architecture, with a focus on centralized CORS configuration that will apply to all services.

## Implementation Plan

### 1. Project Setup

Create a new Spring Boot project with the following dependencies:

```xml
<dependencies>
    <!-- Spring Cloud Gateway -->
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-gateway</artifactId>
    </dependency>
    
    <!-- Eureka Client for Service Discovery -->
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
    </dependency>
    
    <!-- Config Client for centralized configuration -->
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
  port: 8080

spring:
  application:
    name: api-gateway
  cloud:
    gateway:
      discovery:
        locator:
          enabled: true
          lower-case-service-id: true
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

eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/
  instance:
    prefer-ip-address: true
```

### 3. Centralized CORS Configuration

Create a configuration class that applies CORS settings to all routes:

```java
package com.example.gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
public class CorsConfig {

    @Bean
    public CorsWebFilter corsWebFilter() {
        CorsConfiguration corsConfig = new CorsConfiguration();
        corsConfig.setAllowedOrigins(Arrays.asList(
            "https://sloandev.net", 
            "https://www.sloandev.net",
            "http://localhost:3000",
            "http://localhost:5173"
        ));
        corsConfig.setMaxAge(3600L);
        corsConfig.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        corsConfig.setAllowedHeaders(Arrays.asList("Content-Type", "Authorization"));
        corsConfig.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfig);
        
        return new CorsWebFilter(source);
    }
}
```

### 4. Main Application Class

```java
package com.example.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class ApiGatewayApplication {
    public static void main(String[] args) {
        SpringApplication.run(ApiGatewayApplication.class, args);
    }
}
```

### 5. JWT Authentication Filter (Optional)

For securing routes that require authentication:

```java
package com.example.gateway.filter;

import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class AuthenticationFilter extends AbstractGatewayFilterFactory<AuthenticationFilter.Config> {

    private final JwtUtil jwtUtil;
    
    public AuthenticationFilter(JwtUtil jwtUtil) {
        super(Config.class);
        this.jwtUtil = jwtUtil;
    }
    
    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            if (isAuthMissing(exchange)) {
                return onError(exchange, HttpStatus.UNAUTHORIZED);
            }
            
            final String token = getAuthHeader(exchange);
            
            if (jwtUtil.isInvalid(token)) {
                return onError(exchange, HttpStatus.UNAUTHORIZED);
            }
            
            populateRequestWithHeaders(exchange, token);
            
            return chain.filter(exchange);
        };
    }
    
    // Helper methods for JWT validation and header manipulation
    // ...
    
    public static class Config {
        // Configuration properties if needed
    }
}
```

### 6. Resource Configuration

For optimal performance on a t2.micro instance:

```
JVM_OPTS="-Xms128m -Xmx256m -XX:+UseG1GC"
```

### 7. Deployment Script

Create a deployment script that sets up the gateway with proper environment variables:

```bash
#!/bin/bash

# Build the application
./mvnw clean package -DskipTests

# Copy to deployment directory
scp -i /path/to/key.pem target/api-gateway-0.0.1-SNAPSHOT.jar ubuntu@ec2-instance:/opt/api-gateway/

# Create systemd service
cat << EOF | ssh -i /path/to/key.pem ubuntu@ec2-instance "sudo tee /etc/systemd/system/api-gateway.service"
[Unit]
Description=API Gateway
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/opt/api-gateway
ExecStart=/usr/bin/java -Xms128m -Xmx256m -XX:+UseG1GC -jar /opt/api-gateway/api-gateway-0.0.1-SNAPSHOT.jar
SuccessExitStatus=143
TimeoutStopSec=10
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

# Enable and start the service
ssh -i /path/to/key.pem ubuntu@ec2-instance "sudo systemctl enable api-gateway.service && sudo systemctl start api-gateway.service"
```

## Testing CORS Configuration

To verify the CORS configuration is working correctly:

1. Deploy the gateway
2. Send a preflight OPTIONS request from a different origin:
   ```
   curl -v -X OPTIONS -H "Origin: https://sloandev.net" \
   -H "Access-Control-Request-Method: GET" \
   -H "Access-Control-Request-Headers: Content-Type" \
   http://your-gateway-url/api/auth/status
   ```
3. Verify the response includes the correct CORS headers:
   ```
   Access-Control-Allow-Origin: https://sloandev.net
   Access-Control-Allow-Methods: GET,POST,PUT,DELETE,OPTIONS
   Access-Control-Allow-Headers: Content-Type,Authorization
   ```

## Next Steps

Once the gateway is configured with centralized CORS handling, we can proceed to implement the Auth Service that will handle user authentication and authorization.
