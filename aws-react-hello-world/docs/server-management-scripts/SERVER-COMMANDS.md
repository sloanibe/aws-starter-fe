---
title: Server Management Commands
tags: [server, commands, start, stop, restart, ec2, services]
---

# Server Management Commands

This document provides a comprehensive reference for all server management commands available in the AWS Starter project.

## Service Management Commands

The `services.sh` script allows you to manage services running on EC2 instances.

### Basic Usage

```bash
./scripts/server/services.sh [ACTION] [--service=SERVICE_NAME]
```

### Available Actions

| Action | Description |
|--------|-------------|
| `start` | Start the specified service(s) |
| `stop` | Stop the specified service(s) |
| `restart` | Restart the specified service(s) |
| `status` | Check the status of the specified service(s) |
| `kill` | Force kill the specified service(s) |

### Available Services

| Service | Description |
|---------|-------------|
| `all` | All services (default) |
| `spring-boot` | Spring Boot application service |
| `mongodb` | MongoDB database service |

### Examples

```bash
# Start all services
./scripts/server/services.sh start

# Stop only the Spring Boot service
./scripts/server/services.sh stop --service=spring-boot

# Restart MongoDB
./scripts/server/services.sh restart --service=mongodb

# Check status of all services
./scripts/server/services.sh status
```

## EC2 Instance Management

The `ec2-instances.sh` script allows you to manage EC2 instances.

### Basic Usage

```bash
./scripts/server/ec2-instances.sh [ACTION] [--instance=INSTANCE_NAME]
```

### Available Actions

| Action | Description |
|--------|-------------|
| `start` | Start the specified instance(s) |
| `stop` | Stop the specified instance(s) |
| `status` | Check the status of the specified instance(s) |

### Available Instances

| Instance | Description |
|----------|-------------|
| `all` | All instances (default) |
| `combined` | The combined server instance |
| `api` | The API server instance |

### Examples

```bash
# Start all EC2 instances
./scripts/server/ec2-instances.sh start

# Stop a specific instance
./scripts/server/ec2-instances.sh stop --instance=combined

# Check status of all instances
./scripts/server/ec2-instances.sh status
```

## Common Workflows

### Starting the Development Environment

```bash
# Start EC2 instances
./scripts/server/ec2-instances.sh start

# Wait for instances to be running (check status)
./scripts/server/ec2-instances.sh status

# Start services once instances are running
./scripts/server/services.sh start
```

### Shutting Down the Environment

```bash
# Stop services first
./scripts/server/services.sh stop

# Then stop EC2 instances
./scripts/server/ec2-instances.sh stop
```

### Troubleshooting Service Issues

```bash
# Check service status
./scripts/server/services.sh status

# Restart problematic service
./scripts/server/services.sh restart --service=spring-boot

# View logs if needed
./scripts/server/view-logs.sh --service=spring-boot
```
