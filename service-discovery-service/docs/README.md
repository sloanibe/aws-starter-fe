# Eureka Service Discovery

This document provides an overview of the Eureka Service Discovery implementation for the AWS Starter microservices architecture.

## Overview

Eureka Service Discovery is a core component of our Spring Cloud microservices architecture. It enables:

- Dynamic service registration and discovery
- Load balancing across service instances
- Failover support when services go down
- Centralized service registry for the entire ecosystem

## Architecture

The Eureka Service Discovery server is implemented as a standalone Spring Boot application that runs on the EC2 instance. It provides:

- A REST API for service registration and discovery
- A dashboard UI for monitoring registered services
- Health checks for registered services

## Implementation Details

### Components

1. **Eureka Server**
   - Spring Boot application with `@EnableEurekaServer`
   - Optimized for t2.micro instance (256MB heap)
   - Configured for standalone mode (non-clustered)

2. **Deployment**
   - Systemd service for automatic startup
   - Deployment script for easy updates
   - Health monitoring via Spring Boot Actuator

3. **Integration Points**
   - Other services will register with Eureka
   - Spring Cloud Gateway will use Eureka for service discovery

## Configuration

### Server Configuration

The Eureka server is configured with the following properties:

```properties
# Don't register the server with itself
eureka.client.register-with-eureka=false
eureka.client.fetch-registry=false

# Eureka server settings
eureka.server.enable-self-preservation=false
eureka.server.renewal-percent-threshold=0.85
eureka.server.eviction-interval-timer-in-ms=30000

# Eureka instance settings
eureka.instance.hostname=localhost
eureka.instance.prefer-ip-address=true
```

### Client Configuration (for other services)

To register a service with Eureka, add the following to the service's `application.properties`:

```properties
# Eureka client configuration
eureka.client.serviceUrl.defaultZone=http://eureka-server-ip:8761/eureka/
eureka.client.register-with-eureka=true
eureka.client.fetch-registry=true

# Instance configuration
eureka.instance.prefer-ip-address=true
```

## Deployment

### Prerequisites

- Java 17
- EC2 instance with at least 1GB RAM
- Network access to port 8761

### Deployment Steps

1. Build the application:
   ```bash
   cd service-discovery-service
   ./mvnw clean package
   ```

2. Deploy using the script:
   ```bash
   ./infrastructure/scripts/deploy/deploy-eureka.sh
   ```

3. Verify deployment:
   - Access the Eureka dashboard at http://[ec2-ip]:8761/
   - Check service health at http://[ec2-ip]:8761/actuator/health

## Management

The Eureka service can be managed using the `services.sh` script:

```bash
# Check status
./scripts/server/services.sh status --service=eureka

# Start the service
./scripts/server/services.sh start --service=eureka

# Stop the service
./scripts/server/services.sh stop --service=eureka

# Restart the service
./scripts/server/services.sh restart --service=eureka
```

## Monitoring

The Eureka server provides several endpoints for monitoring:

- Dashboard: http://[ec2-ip]:8761/
- Health: http://[ec2-ip]:8761/actuator/health
- Info: http://[ec2-ip]:8761/actuator/info
- Metrics: http://[ec2-ip]:8761/actuator/metrics

## Next Steps

1. Update the existing Spring Boot application to register with Eureka
2. Deploy the Config Server
3. Deploy the Spring Cloud Gateway with centralized CORS handling

## Troubleshooting

### Common Issues

1. **Service not starting**
   - Check logs: `tail -f /home/ubuntu/service-discovery-service/eureka.log`
   - Verify systemd service: `systemctl status service-discovery.service`

2. **Services not registering**
   - Verify network connectivity between services and Eureka
   - Check client configuration in service's application.properties
   - Ensure correct Eureka server URL is specified

3. **High memory usage**
   - Adjust JVM settings in systemd service file
   - Consider reducing renewal interval for large number of services
