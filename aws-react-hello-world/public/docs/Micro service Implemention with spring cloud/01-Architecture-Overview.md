# Spring Cloud Microservices Architecture

## Overview

This document outlines our approach to implementing a microservices architecture using Spring Cloud, with a focus on creating a login service behind a Spring Cloud Gateway that provides centralized CORS configuration for all services.

## Architecture Diagram

```
                                  ┌─────────────────┐
                                  │                 │
                                  │  Config Server  │
                                  │                 │
                                  └────────┬────────┘
                                           │
                                           ▼
┌──────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│              │    │                 │    │                 │    │                 │
│   Frontend   │◄──►│  Spring Cloud   │◄──►│  Eureka Server  │◄──►│  Admin Server   │
│              │    │    Gateway      │    │                 │    │                 │
└──────────────┘    └────────┬────────┘    └─────────────────┘    └─────────────────┘
                             │
                             │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
          ▼                 ▼                 ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│                 │ │                 │ │                 │
│  Auth Service   │ │ Dashboard Svc   │ │  Other Services │
│                 │ │                 │ │                 │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

## Core Components

1. **Spring Cloud Gateway**
   - Central entry point for all client requests
   - Handles CORS configuration for all services
   - Routes requests to appropriate microservices
   - Implements circuit breaking and rate limiting

2. **Eureka Service Discovery**
   - Registers all microservices
   - Enables dynamic service discovery
   - Facilitates load balancing

3. **Config Server**
   - Centralized configuration management
   - Environment-specific configurations
   - Runtime configuration updates

4. **Auth Service**
   - User authentication and authorization
   - JWT token generation and validation
   - User management
   - Guest login functionality

5. **Dashboard Service**
   - Consumes authentication from Auth Service
   - Provides dashboard data and functionality
   - Protected endpoints requiring authentication

6. **Spring Boot Admin**
   - Monitoring and management
   - Health checks
   - Metrics collection

## Deployment Strategy

All services will be designed to run on a t2.micro EC2 instance for demonstration purposes, with optimized memory settings and lightweight configurations.

## Next Steps

The implementation will proceed in phases:
1. Set up core infrastructure (Gateway, Eureka, Config Server)
2. Implement Auth Service with guest login
3. Migrate existing dashboard functionality to Dashboard Service
4. Add additional services as needed

Detailed implementation plans for each component are provided in subsequent documents.
