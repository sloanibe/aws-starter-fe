# Spring Cloud Microservices Implementation Plan

## Overview

This document outlines the step-by-step implementation plan for migrating our current monolithic application to a microservices architecture using Spring Cloud. The plan focuses on creating a robust, scalable system that addresses our CORS configuration issues while providing a foundation for future service expansion.

## Implementation Phases

### Phase 1: Core Infrastructure Setup (Week 1)

1. **Set up Eureka Service Discovery**
   - Create and deploy Eureka server
   - Configure systemd service for automatic startup
   - Test service registration and discovery

2. **Implement Config Server**
   - Set up Git repository for configuration
   - Deploy Config Server with connection to repository
   - Create base configurations for all planned services
   - Configure systemd service for automatic startup

3. **Deploy Spring Cloud Gateway**
   - Implement gateway with centralized CORS configuration
   - Configure routes to existing monolithic application (temporary)
   - Set up circuit breakers and rate limiting
   - Test CORS handling through the gateway
   - Configure systemd service for automatic startup

### Phase 2: Auth Service Implementation (Week 2)

1. **Create Auth Service**
   - Implement user authentication and JWT generation
   - Migrate user data from existing application
   - Add guest login functionality
   - Implement token validation endpoints
   - Configure connection to MongoDB

2. **Update Gateway Configuration**
   - Route authentication requests to new Auth Service
   - Implement authentication filter for protected routes
   - Test end-to-end authentication flow

3. **Frontend Updates**
   - Update frontend to use new authentication endpoints
   - Test login, registration, and guest access

### Phase 3: Dashboard Service Implementation (Week 3)

1. **Create Dashboard Service**
   - Extract dashboard functionality from monolithic application
   - Implement service with JWT validation
   - Configure connection to MongoDB for dashboard data
   - Implement API endpoints for dashboard features

2. **Update Gateway Configuration**
   - Route dashboard requests to new Dashboard Service
   - Test end-to-end dashboard functionality

3. **Integration Testing**
   - Test complete flow from login to dashboard access
   - Verify CORS handling works correctly
   - Load test with multiple simultaneous users

### Phase 4: Additional Services & Refinement (Week 4+)

1. **Implement Additional Services**
   - Identify and extract other functional areas into microservices
   - Update gateway configuration for new services
   - Implement service-to-service communication where needed

2. **Monitoring and Management**
   - Set up Spring Boot Admin server
   - Configure distributed tracing with Sleuth and Zipkin
   - Implement centralized logging

3. **Deployment Automation**
   - Create comprehensive deployment scripts
   - Update existing CI/CD pipeline for microservices
   - Implement blue-green deployment strategy

## Resource Requirements

For our t2.micro EC2 instance, we'll need to optimize resource usage:

1. **Memory Allocation**
   - Eureka Server: 256MB
   - Config Server: 256MB
   - API Gateway: 256MB
   - Auth Service: 256MB
   - Dashboard Service: 256MB

2. **Startup Order**
   1. Eureka Server
   2. Config Server
   3. Auth Service
   4. Dashboard Service
   5. API Gateway

## Testing Strategy

1. **Unit Testing**
   - Test individual service components
   - Mock external dependencies

2. **Integration Testing**
   - Test service-to-service communication
   - Verify configuration loading from Config Server
   - Test service discovery via Eureka

3. **End-to-End Testing**
   - Test complete user flows through the gateway
   - Verify CORS handling for browser requests
   - Test authentication and authorization

## CORS Configuration Strategy

Our centralized CORS configuration will:

1. Be defined in the Config Server for consistency
2. Be implemented in the Spring Cloud Gateway
3. Include all necessary origins:
   - https://sloandev.net
   - https://www.sloandev.net
   - http://localhost:3000
   - http://localhost:5173
4. Allow appropriate methods and headers
5. Handle credentials correctly

## Rollback Plan

In case of issues:

1. Keep the monolithic application running in parallel initially
2. Maintain database backups before migration
3. Create gateway routes that can be quickly switched back to the monolithic application
4. Document all changes for quick troubleshooting

## Success Criteria

The migration will be considered successful when:

1. All functionality works through the microservices architecture
2. CORS issues are fully resolved
3. Services restart correctly after EC2 instance reboots
4. Performance is equal to or better than the monolithic application
5. Monitoring shows healthy services with no unexpected errors

## Next Steps

1. Set up the development environment for microservices
2. Create the Eureka Server as the first component
3. Begin implementing the Config Server and core configurations
4. Schedule regular review meetings to track progress
