# Microservices-Based Reminder System

## Architecture Overview

This document outlines the architecture for a microservices-based reminder system using Spring Boot, Eureka, AWS SQS, MongoDB, and MySQL. The system allows users to create, manage, and receive notifications for reminders.

![Microservices Architecture](https://via.placeholder.com/800x500.png?text=Reminder+System+Microservices+Architecture)

## Core Components

### 1. Service Discovery (Eureka Server)
- **Purpose**: Enables services to find and communicate with each other
- **Technology**: Netflix Eureka
- **Deployment**: Single instance on EC2
- **Configuration**: Self-preservation mode disabled for development

### 2. User Service
- **Purpose**: Manages user accounts, authentication, and user preferences
- **Technology**: Spring Boot with Spring Security
- **Database**: MySQL
- **Key Endpoints**:
  - `/api/users` - User management
  - `/api/auth` - Authentication
  - `/api/preferences` - User preferences
- **Events Published**:
  - `UserCreated`
  - `UserUpdated`
  - `UserPreferencesChanged`

### 3. Reminder Service
- **Purpose**: Manages reminder creation, updates, and queries
- **Technology**: Spring Boot
- **Database**: MongoDB (reminders collection)
- **Key Endpoints**:
  - `/api/reminders` - CRUD operations for reminders
  - `/api/reminders/search` - Search and filter reminders
- **Events Published**:
  - `ReminderCreated`
  - `ReminderUpdated`
  - `ReminderDeleted`
  - `ReminderRescheduled`

### 4. Scheduler Service
- **Purpose**: Monitors upcoming reminders and triggers notifications
- **Technology**: Spring Boot with Spring Scheduler
- **Database**: MongoDB (scheduled_jobs collection)
- **Key Endpoints**:
  - `/api/scheduler/status` - View scheduled jobs
  - `/api/scheduler/manual-trigger` - Force trigger a reminder (for testing)
- **Events Published**:
  - `ReminderDue`
  - `SchedulerHealthStatus`

### 5. Notification Service
- **Purpose**: Sends email notifications via AWS SES
- **Technology**: Spring Boot with AWS SDK
- **Database**: MongoDB (notifications collection)
- **Key Endpoints**:
  - `/api/notifications/history` - View notification history
  - `/api/notifications/templates` - Manage notification templates
- **Events Consumed**:
  - `ReminderDue`
  - `UserCreated` (for welcome emails)

## Communication Patterns

### Synchronous Communication
- REST APIs for direct service-to-service communication
- Used for immediate responses and queries

### Asynchronous Communication
- AWS SQS for event-based communication
- Key queues:
  - `reminder-events-queue` - For reminder lifecycle events
  - `notification-queue` - For events that trigger notifications
  - `user-events-queue` - For user-related events

## Database Design

### MySQL (User Service)
- **Tables**:
  - `users` - Core user data
  - `user_preferences` - User settings and preferences
  - `roles` - User roles for authorization

### MongoDB (Shared by other services)
- **Collections**:
  - `reminders` - Reminder details and metadata
  - `scheduled_jobs` - Jobs scheduled for execution
  - `notification_templates` - Templates for different notification types
  - `notification_history` - Record of sent notifications

## Deployment Strategy

### Infrastructure
- Single EC2 instance hosting all services
- Services run on different ports
- API Gateway for external access

### Service Configuration
- Eureka Server: Port 8761
- User Service: Port 8081
- Reminder Service: Port 8082
- Scheduler Service: Port 8083
- Notification Service: Port 8084

### Resource Allocation
- Each service configured with appropriate memory limits
- JVM heap sizes optimized for small EC2 instance

## Implementation Phases

### Phase 1: Core Infrastructure
1. Set up Eureka Server
2. Configure AWS SQS queues
3. Set up MySQL and MongoDB

### Phase 2: Core Services
1. Implement User Service with authentication
2. Implement Reminder Service with basic CRUD

### Phase 3: Supporting Services
1. Implement Scheduler Service
2. Implement Notification Service with AWS SES integration

### Phase 4: Integration and Testing
1. End-to-end testing
2. Performance optimization
3. Security hardening

## Monitoring and Management

- Health endpoints for each service
- Centralized logging
- Basic metrics collection

## Future Enhancements

- Add API Gateway for better security and routing
- Implement Circuit Breaker pattern for resilience
- Add more notification channels (SMS, push notifications)
- Containerize services with Docker for better isolation
