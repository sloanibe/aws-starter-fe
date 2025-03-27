# AWS Microservices Manager

A Groovy-based JavaFX desktop application for managing and troubleshooting the AWS Starter microservices architecture.

## Features

- **EC2 Instance Management**: Start, stop, and monitor EC2 instances
- **Service Control**: Restart, monitor, and debug microservices
- **Path Testing**: Test request paths through the dual-gateway architecture
- **Log Viewing**: View consolidated logs from all services
- **Health Monitoring**: Monitor the health of all microservices
- **Eureka Integration**: View service registrations in Eureka

## Architecture

This tool is designed specifically for the AWS Starter microservices architecture, which includes:

- **Dual-Gateway Architecture**:
  - AWS API Gateway (external)
  - Spring Cloud Gateway (internal)
- **Core Services**:
  - Eureka Service Discovery
  - Config Server
  - API Gateway
  - AWS Starter API
  - Login Service

## Requirements

- Java 17 or higher
- Gradle 7.0 or higher
- AWS CLI configured with appropriate credentials
- Access to the EC2 instances and services

## Building

```bash
./gradlew build
```

## Running

```bash
./gradlew run
```

## Creating a Native Package

```bash
./gradlew jpackage
```

This will create a platform-specific installer in the `build/jpackage` directory.

## Development

This project uses:

- **Groovy**: For concise, expressive code
- **JavaFX**: For the UI components
- **AWS SDK**: For direct AWS integration
- **Spring Boot Admin Client**: For monitoring Spring services

## Troubleshooting Features

The tool includes specialized features for debugging common issues in the microservices architecture:

- **Path Rewriting Visualization**: See how paths are transformed through the dual-gateway architecture
- **CORS Testing**: Test CORS configurations across services
- **Service Registration Monitor**: Track service registration/deregistration with Eureka
- **Memory Usage Tracking**: Monitor memory usage on the t2.small instance to prevent OOM errors

## Integrating with Existing Scripts

The tool integrates with existing shell scripts in the `scripts/server` directory, providing a graphical interface for:

- EC2 instance management (`ec2-instances.sh`)
- Service control (via systemctl)
- Log viewing (via journalctl)

## License

This project is part of the AWS Starter application and follows its licensing terms.
