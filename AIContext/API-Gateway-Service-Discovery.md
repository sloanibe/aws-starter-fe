# API Gateway Service Discovery Mechanism

## Overview

This document explains how service discovery works in our Spring Cloud microservices architecture, using the Login Service as a practical example. The architecture leverages Eureka Service Discovery, Spring Cloud Gateway, and client-side load balancing to create a robust, scalable system.

## Architecture Components

Our microservices architecture consists of the following key components:

1. **Eureka Service Discovery Server**: Central registry for all microservices
2. **Spring Cloud Gateway**: API Gateway that routes requests to appropriate services
3. **Config Server**: Centralized configuration management
4. **Login Service**: Handles user authentication (our example service)
5. **Frontend Application**: React application that communicates with backend services

## Service Discovery Flow

### Registration Process

```
Service Registration Flow:

+---------------+                 +---------------+                 +---------------+
|               |                 |               |                 |               |
| Login Service |                 | Config Server |                 | Eureka Server |
|               |                 |               |                 |               |
+-------+-------+                 +-------+-------+                 +-------+-------+
        |                                 |                                 |
        | 1. Fetch configuration          |                                 |
        +-------------------------------->|                                 |
        |                                 |                                 |
        |     Return configuration        |                                 |
        |     (spring.application.name=   |                                 |
        |      LOGIN-SERVICE)             |                                 |
        |<--------------------------------+                                 |
        |                                 |                                 |
        | 2. Register with Eureka         |                                 |
        | (POST /eureka/apps/LOGIN-SERVICE)                                |
        +----------------------------------------------------------------->|
        |                                 |                                 |
        |                                 |      Acknowledge registration   |
        |<-----------------------------------------------------------------+
        |                                 |                                 |
        | 3. Send heartbeat (every 30s)   |                                 |
        +----------------------------------------------------------------->|
        |                                 |                                 |
        |                                 |      Acknowledge heartbeat      |
        |<-----------------------------------------------------------------+
        |                                 |                                 |
```

### Request Routing Flow

```
Login Request Flow:

+---------------+    +---------------+    +---------------+    +---------------+
|               |    |               |    |               |    |               |
|    Client     |    |  API Gateway  |    | Eureka Server |    | Login Service |
|   (Browser)   |    |               |    |               |    |               |
+-------+-------+    +-------+-------+    +-------+-------+    +-------+-------+
        |                    |                    |                    |
        | 1. POST /api/login |                    |                    |
        +------------------->|                    |                    |
        |                    | 2. Where is        |                    |
        |                    | LOGIN-SERVICE?     |                    |
        |                    | (lb://login-service)|                    |
        |                    +------------------->|                    |
        |                    |                    |                    |
        |                    | 3. LOGIN-SERVICE   |                    |
        |                    | is at localhost:8081                    |
        |                    |<-------------------+                    |
        |                    |                    |                    |
        |                    | 4. Forward request to                   |
        |                    | localhost:8081/login                    |
        |                    +---------------------------------------->|
        |                    |                    |                    |
        |                    |                    |                    |
        |                    | 5. Return login response               |
        |                    |<----------------------------------------+
        |                    |                    |                    |
        | 6. Return response |                    |                    |
        |<-------------------+                    |                    |
        |                    |                    |                    |
```

## Detailed Explanation

### 1. Service Registration

When the Login Service starts:

1. It reads its configuration from the Config Server, including its service name (`LOGIN-SERVICE`)
2. It registers with Eureka using the following information:
   - Service ID: `LOGIN-SERVICE`
   - Host: `localhost` (or the server's IP)
   - Port: `8081` (or configured port)
   - Health check URL: `/actuator/health`

```java
// In LoginServiceApplication.java
@SpringBootApplication
@EnableDiscoveryClient  // This enables registration with Eureka
public class LoginServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(LoginServiceApplication.class, args);
    }
}
```

Configuration in `application.yml`:
```yaml
spring:
  application:
    name: LOGIN-SERVICE  # This is the service ID used in registration

eureka:
  client:
    serviceUrl:
      defaultZone: http://localhost:8761/eureka/
  instance:
    preferIpAddress: true
```

### 2. Gateway Route Configuration

The API Gateway is configured to route requests based on path patterns:

```java
// In RouteConfig.java
@Configuration
public class RouteConfig {
    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
            .route("login-service-route", r -> r
                .path("/api/login")
                .filters(f -> f
                    .rewritePath("/api/login", "/login")
                    .addResponseHeader("X-Gateway-Source", "spring-cloud-gateway"))
                .uri("lb://login-service"))
            // Other routes...
            .build();
    }
}
```

### 3. Client-Side Load Balancing

The `lb://` prefix in the URI triggers Spring Cloud's client-side load balancing:

1. **Service Lookup**: When the Gateway receives a request matching the `/api/login` path:
   - It identifies that the request should be routed to `lb://login-service`
   - The `LoadBalancerClient` intercepts this special URI format

2. **Ribbon Integration**:
   - Netflix Ribbon (integrated with Spring Cloud) maintains a local cache of service instances
   - It periodically refreshes this cache from Eureka (default: every 30 seconds)

3. **Instance Selection**:
   - Ribbon queries its cache for instances of `LOGIN-SERVICE`
   - If multiple instances exist, it selects one using its load balancing algorithm (default: round-robin)
   - For our setup with a single instance, it simply returns that instance

4. **URI Translation**:
   - The `lb://login-service` URI is translated to a physical URI (e.g., `http://localhost:8081`)
   - The full request becomes `http://localhost:8081/login` (after path rewriting)

### 4. Request Processing

Once the physical URI is determined:

1. The Gateway forwards the request to the Login Service
2. The Login Controller processes the request:

```java
// In LoginController.java
@RestController
@RequestMapping("/login")
public class LoginController {
    @PostMapping
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest loginRequest) {
        // Process login request
        LoginResponse response = loginService.login(loginRequest);
        return ResponseEntity.ok(response);
    }
}
```

3. The Login Service processes the request and returns a response
4. The Gateway forwards the response back to the client

## System Architecture Diagram

```
System Architecture:

                                                                 +-------------------+
                                                                 |                   |
                                                                 |  Config Server    |
                                                                 |                   |
                                                                 +--------+----------+
                                                                          |
                                                                          | Configuration
                                                                          v
+---------------+     +---------------+     +---------------+     +---------------+
|               |     |               |     |               |     |               |
|    Client     |     |    AWS API    |     | Spring Cloud  |     | Eureka Service|
|   Browser     |     |    Gateway    |     |    Gateway    |<----|   Discovery   |
|               |     |               |     |               |     |               |
+-------+-------+     +-------+-------+     +-------+-------+     +---------------+
        |                     |                     |                     ^
        | 1. POST             | 2. Forward         | 3. Service          |
        | /api/login          |                     | Lookup              |
        v                     v                     |                     |
        |                     |                     |                     |
        |                     |                     v                     |
        |                     |             4. Return Instance            |
        |                     |                     |                     |
        |                     |                     |                     |
        |                     |                     |     +---------------+
        |                     |                     |     |               |
        |                     |                     |     |  Login Service|
        |                     |                     +---->|               |
        |                     |             5. Forward    +-------+-------+
        |                     |             to /login             |
        |                     |                                   |
        |                     |                                   v
        |                     |                           +---------------+
        |                     |                           |               |
        |                     |                           |    MongoDB    |
        |                     |                           |               |
        |                     |                           +---------------+
        |                     |                                   |
        |                     |                                   v
        |                     |                           +---------------+
        |                     |                           |               |
        |                     |                           |   RabbitMQ    |
        |                     |                           |               |
        |                     |                           +---------------+
        |                     |                                   |
        |                     |              8. Response          |
        |                     |<----------------------------------+
        |                     |
        | 10. Response        | 9. Response
        |<--------------------+
        |

All services inside EC2 t2.small instance (13.52.157.48):
- Eureka Service Discovery (8761)
- Spring Cloud Gateway
- Login Service
- MongoDB
- RabbitMQ
- Config Server (8888)
```

## Benefits of This Approach

1. **Dynamic Service Discovery**: Services can be added, removed, or scaled without reconfiguration
2. **Centralized Routing**: All requests go through a single entry point
3. **Load Balancing**: Automatic distribution of requests across multiple service instances
4. **Resilience**: The system can handle service failures gracefully
5. **Simplified Client Integration**: Clients only need to know the Gateway URL

## Real-World Example: Login Flow

Let's trace a complete login request through our system:

1. **Frontend Initiates Login**:
```typescript
// In AuthService.ts
async loginAsGuest(email: string, name: string, company?: string): Promise<GuestUser> {
  try {
    const response = await fetch(`${apiConfig.apiBaseUrl}${apiConfig.endpoints.login}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        name,
        organization: company || ''
      })
    });
    // Process response...
  } catch (error) {
    // Handle error...
  }
}
```

2. **Request Reaches API Gateway**:
   - The request arrives at `/api/login`
   - The Gateway matches it to the login-service route
   - It rewrites the path to `/login`
   - It uses Eureka to locate the Login Service

3. **Login Service Processes Request**:
   - The Login Controller receives the request
   - It calls the Login Service to process authentication
   - The service checks if the user exists in MongoDB
   - It creates or updates the user record
   - It publishes a login event to RabbitMQ (if enabled)
   - It returns a response with user details

4. **Response Returns to Client**:
   - The response travels back through the Gateway
   - The frontend processes the response and updates the UI

## Troubleshooting Common Issues

### Service Not Found

If the Gateway cannot find a service:

1. **Check Eureka Dashboard** (http://13.52.157.48:8761/):
   - Verify the service is registered with the correct name
   - Check if the service is in UP state

2. **Check Service Configuration**:
   - Verify `spring.application.name` is set correctly
   - Ensure Eureka client configuration is correct

3. **Check Service Logs**:
   - Look for registration errors
   - Verify the service is sending heartbeats

### Path Mapping Issues

If requests are not reaching the correct endpoint:

1. **Check Gateway Routes**:
   - Verify path patterns and rewrite rules
   - Ensure the route is using the correct service ID

2. **Check Controller Mappings**:
   - Ensure the controller's request mapping matches the rewritten path

## Conclusion

Our Spring Cloud microservices architecture uses Eureka Service Discovery and Spring Cloud Gateway to create a flexible, scalable system. The Login Service example demonstrates how services register with Eureka and how the Gateway routes requests to the appropriate service instances.

This approach provides a solid foundation for our microservices migration plan and enables us to add new services incrementally without disrupting existing functionality.
