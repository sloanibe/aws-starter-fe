# AWS Starter Microservices Architecture

## Overview

This document provides a comprehensive overview of the AWS Starter microservices architecture, detailing how each component interacts within the system to provide a scalable, maintainable, and robust application.

## Architecture Diagram

```
┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │
│  Frontend       │     │  API Gateway    │
│  (React)        │────▶│  Service        │
│                 │     │                 │
└─────────────────┘     └────────┬────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │                 │
                        │  Eureka Service │
                        │  Discovery      │
                        │                 │
                        └────────┬────────┘
                                 │
           ┌───────────┬─────────┼─────────┬───────────┐
           │           │         │         │           │
           ▼           ▼         ▼         ▼           ▼
┌─────────────────┐ ┌─────┐ ┌─────────┐ ┌─────┐ ┌─────────────┐
│                 │ │     │ │         │ │     │ │             │
│  Config Server  │ │ API │ │  Login  │ │ ... │ │ Future      │
│  Service        │ │     │ │ Service │ │     │ │ Services    │
│                 │ │     │ │         │ │     │ │             │
└─────────────────┘ └─────┘ └─────────┘ └─────┘ └─────────────┘
           │                     │
           │                     │
           ▼                     ▼
┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │
│  GitHub Config  │     │  MongoDB        │
│  Repository     │     │  Database       │
│                 │     │                 │
└─────────────────┘     └─────────────────┘
```

## Core Components

### 1. Frontend (React)

The frontend is a React application hosted on S3/CloudFront that communicates with the backend services through the API Gateway. It provides the user interface for the application.

### 2. API Gateway Service

The API Gateway serves as the central entry point for all client requests. It routes requests to the appropriate microservices based on the request path.

**Key Features:**
- Centralized CORS handling
- Request routing
- Load balancing
- Circuit breaking
- Service discovery integration via Eureka

### 3. Eureka Service Discovery

Eureka enables dynamic service registration and discovery, allowing services to find and communicate with each other without hardcoded URLs.

**Key Features:**
- Service registration
- Service discovery
- Health monitoring
- Load balancing support

### 4. Config Server Service

The Config Server provides centralized, externalized configuration for all microservices from a Git repository.

**Key Features:**
- Centralized configuration
- Environment-specific configurations
- Dynamic configuration updates
- Encryption/decryption of sensitive properties

### 5. Login Service

The Login Service handles user authentication and authorization, generating JWT tokens for authenticated users.

**Key Features:**
- User authentication
- JWT token generation
- Password encryption
- User management

### 6. AWS Starter API

The core business logic service that handles the main application functionality.

**Key Features:**
- Business logic implementation
- Data processing
- Integration with MongoDB

## Infrastructure

All services are deployed on a single t2.small EC2 instance (2GB RAM, 2x CPU credits) with the following optimizations:

- Memory settings tuned for each Java service
- Services communicate via localhost for minimal latency
- Elastic IP ensures consistent addressing
- Systemd services configured for automatic restart

## Service Communication

### Synchronous Communication

Services communicate synchronously via REST APIs, with service discovery handled by Eureka.

### Asynchronous Communication

For event-driven communication, services use RabbitMQ:

- Login events
- User registration events
- System notifications

## Configuration Management

### Config Server

The Config Server retrieves configurations from a GitHub repository with the following structure:

```
config-repo/
├── application.yml                 # Common configuration for all services
├── api-gateway-service/
│   ├── api-gateway-service.yml     # Default configuration
│   └── api-gateway-service-prod.yml # Production-specific configuration
├── login-service/
│   └── login-service.yml           # Login service configuration
└── service-discovery/
    └── service-discovery.yml       # Eureka configuration
```

### Environment Variables

Services use environment variables stored in `.env` files for sensitive configuration:

- Database credentials
- API keys
- Service-specific settings

## Deployment Process

Each service has a dedicated deployment script that:

1. Builds the service JAR file
2. Transfers it to the EC2 instance
3. Sets up the environment file
4. Configures the systemd service
5. Starts or restarts the service

## Memory Optimization

Memory settings are carefully tuned for the t2.small instance:

- Config Server: `-Xmx256m -Xms128m`
- Eureka: `-Xmx256m -Xms128m`
- API Gateway: `-Xmx256m -Xms128m`
- Login Service: Default settings
- MongoDB: Limited to 512MB

## Security Considerations

- JWT-based authentication
- HTTPS for all external communication
- Sensitive data encrypted in configuration
- API Gateway as the single entry point
- No direct access to backend services

## Monitoring and Health Checks

All services expose health endpoints via Spring Boot Actuator:

- `/actuator/health` - Service health information
- `/actuator/info` - Service information
- `/actuator/metrics` - Service metrics

## Troubleshooting Guide

### Common Issues

1. **Service Not Registering with Eureka**
   - Check application name configuration
   - Verify Eureka client settings
   - Ensure service has network access to Eureka

2. **Config Server Issues**
   - Check Git repository access
   - Verify memory settings
   - Check search paths configuration

3. **API Gateway Routing Issues**
   - Verify route configurations
   - Check service registration in Eureka
   - Examine request logs

## Future Enhancements

1. **Circuit Breakers**: Implement Resilience4j for fault tolerance
2. **Distributed Tracing**: Add Sleuth and Zipkin for request tracing
3. **Containerization**: Move to Docker containers for better isolation
4. **Kubernetes**: For advanced orchestration and scaling
5. **CI/CD Pipeline**: Automated testing and deployment
