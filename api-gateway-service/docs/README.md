# Spring Cloud Gateway Service

## Overview
The Spring Cloud Gateway service is a central entry point for all microservices in the AWS Starter application. It provides:

1. **Centralized Routing**: Routes requests to appropriate backend services based on path
2. **CORS Handling**: Centralized CORS configuration for all services
3. **Service Discovery Integration**: Uses Eureka for dynamic service discovery
4. **Consistent Security**: Foundation for implementing consistent security across services

## Architecture
The API Gateway sits between clients and backend microservices:

```
                                 ┌─────────────────┐
                                 │                 │
                                 │  Config Server  │
                                 │    (8888)       │
                                 │                 │
                                 └─────────────────┘
                                         ▲
                                         │
                                         │
┌───────────┐     ┌─────────────────┐   │   ┌─────────────────┐
│           │     │                 │   │   │                 │
│  Clients  │────▶│  API Gateway    │───┼──▶│  API Service    │
│           │     │    (8080)       │   │   │                 │
└───────────┘     └─────────────────┘   │   └─────────────────┘
                          │             │
                          │             │
                          ▼             │
                  ┌─────────────────┐   │
                  │                 │   │
                  │  Eureka Server  │◀──┘
                  │    (8761)       │
                  │                 │
                  └─────────────────┘
```

## CORS Configuration
The Gateway implements centralized CORS handling for all microservices, eliminating the need for individual services to handle CORS. The configuration allows:

- Specific origins: `sloandev.net`, `localhost:3000`, `localhost:8080`
- All standard HTTP methods
- Credentials support
- Appropriate headers

## Route Configuration
Routes are configured both in `application.properties` and in the `RouteConfig` Java class:

1. **API Service**: `/api/**` → `api-service`
2. **Auth Service**: `/auth/**` → `auth-service` (future implementation)
3. **Dashboard Service**: `/dashboard/**` → `dashboard-service` (future implementation)

## Deployment
The service is deployed as a systemd service on the EC2 instance:

1. Build with Maven
2. Deploy JAR to EC2
3. Configure systemd service
4. Start and enable the service

## Configuration
Configuration is loaded from:
1. Local `application.properties`
2. Environment-specific properties (e.g., `application-prod.properties`)
3. Config Server (for centralized configuration)

## Memory Optimization
The service is optimized for t2.small instance with:
- 256MB max heap
- 128MB initial heap
- Serial GC for low memory footprint
