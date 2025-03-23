# Spring Cloud Config Server

This service provides centralized configuration management for the microservices architecture. It allows all microservices to retrieve their configuration from a central location, making it easier to manage configuration across environments.

## Overview

The Config Server is implemented using Spring Cloud Config Server, which provides a centralized configuration service that is horizontally scalable. It uses a Git repository as the source of configuration data, which allows for version control, history, and rollback capabilities.

## Features

- Centralized configuration management for all microservices
- Git-backed configuration repository for version control
- Environment-specific configuration profiles
- Secure credential management for Git repository access
- Integration with Eureka Service Discovery
- Health monitoring via Spring Boot Actuator

## Security

The Config Server accesses a private Git repository using credentials that are securely managed:

1. GitHub credentials (username and personal access token) are stored in a local protected file on the developer machine
2. Deployment scripts securely transfer credentials to the EC2 instance
3. A service-specific `.env` file with restricted permissions (chmod 600) is created on the EC2 instance
4. The systemd service uses the EnvironmentFile directive for isolated credential access
5. Credentials are never committed to the repository or exposed in system-wide environment

## Configuration

The Config Server is configured to run on port 8888 and is optimized for a t2.micro EC2 instance with memory settings of 256MB max heap.

### Application Properties

Key configuration properties include:

```properties
# Git repository configuration
spring.cloud.config.server.git.uri=${CONFIG_GIT_URI}
spring.cloud.config.server.git.username=${CONFIG_GIT_USERNAME}
spring.cloud.config.server.git.password=${CONFIG_GIT_PASSWORD}
spring.cloud.config.server.git.clone-on-start=true
spring.cloud.config.server.git.default-label=main
```

## Deployment

The Config Server is deployed as a systemd service on the EC2 instance. The deployment process is automated using the `deploy-config-server.sh` script, which:

1. Builds the application
2. Securely transfers the JAR file to the EC2 instance
3. Creates a secure `.env` file with Git credentials
4. Installs and starts the systemd service

## Usage

### Client Configuration

Microservices can connect to the Config Server by adding the following dependencies and configuration:

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-config</artifactId>
</dependency>
```

```properties
spring.config.import=optional:configserver:http://localhost:8888
spring.application.name=your-service-name
```

### Service Management

The Config Server can be managed using the `services.sh` script:

```bash
# Check status
./scripts/server/services.sh status --service=config-server

# Start the service
./scripts/server/services.sh start --service=config-server

# Stop the service
./scripts/server/services.sh stop --service=config-server

# Restart the service
./scripts/server/services.sh restart --service=config-server
```

## Fallback Mechanism

In case the Config Server is unavailable, microservices should implement a fallback mechanism by:

1. Using `optional:` prefix in the `spring.config.import` property
2. Providing default configuration values in the application's local properties file
3. Implementing retry mechanisms for configuration retrieval

## Monitoring

The Config Server exposes health and metrics endpoints via Spring Boot Actuator:

- Health: `http://<host>:8888/actuator/health`
- Info: `http://<host>:8888/actuator/info`
- Metrics: `http://<host>:8888/actuator/metrics`

## Integration with Existing Services

The Config Server is designed to work seamlessly with the existing microservices architecture, including the Eureka Service Discovery server. It provides a foundation for future service expansion and configuration management.
