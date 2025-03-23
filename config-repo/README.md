# Configuration Repository

This directory contains centralized configuration for all microservices in the AWS Starter application. The Spring Cloud Config Server will use these files to provide configuration to the various services.

## Directory Structure

```
config-repo/
├── application.yml           # Shared configuration for all services
├── aws-starter-api/          # Service-specific folder
│   ├── aws-starter-api.yml   # Default configuration
│   └── aws-starter-api-prod.yml # Production-specific overrides
└── service-discovery/        # Eureka configuration
    └── service-discovery.yml
```

## Configuration Files

### Common Configuration

- `application.yml`: Contains configuration shared by all services

### Service-Specific Configuration

- `aws-starter-api/aws-starter-api.yml`: Default configuration for the AWS Starter API
- `aws-starter-api/aws-starter-api-prod.yml`: Production-specific overrides for the AWS Starter API
- `service-discovery/service-discovery.yml`: Configuration for the Eureka Service Discovery server

## Environment-Specific Configuration

Configuration files follow the naming pattern:
- `{application-name}.yml`: Default configuration
- `{application-name}-{profile}.yml`: Environment-specific configuration (e.g., dev, test, prod)

## Usage

These configuration files will be used by the Spring Cloud Config Server to provide centralized configuration management for all microservices. Services will connect to the Config Server to retrieve their configuration at startup.

## Sensitive Information

Sensitive information such as passwords and API keys should not be committed directly to these files. Instead, use environment variables or a secure vault solution.
