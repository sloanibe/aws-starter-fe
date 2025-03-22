# AWS Starter Project - Quick Reference Guide

This document provides quick reference commands for common operations in the AWS Starter project.

## EC2 Instance Management

| Operation | Command |
|-----------|---------|
| Start all instances | `./scripts/server/ec2-instances.sh start` |
| Stop all instances | `./scripts/server/ec2-instances.sh stop` |
| Check instance status | `./scripts/server/ec2-instances.sh status` |
| Start specific instance | `./scripts/server/ec2-instances.sh start --instance=combined` |

## Service Management

| Operation | Command |
|-----------|---------|
| Start all services | `./scripts/server/services.sh start` |
| Stop all services | `./scripts/server/services.sh stop` |
| Restart Spring Boot | `./scripts/server/services.sh restart --service=spring-boot` |
| Check service status | `./scripts/server/services.sh status` |

## AWS Infrastructure

| Operation | Command |
|-----------|---------|
| Deploy all infrastructure | `./scripts/aws/manage-aws.sh deploy --service=all` |
| Update EC2 infrastructure | `./scripts/aws/manage-aws.sh update --service=ec2` |
| Check auto-stop status | `./scripts/aws/manage-aws.sh status --service=auto-stop` |
| Delete API Gateway | `./scripts/aws/manage-aws.sh delete --service=api-gateway` |

## Application Deployment

| Operation | Command |
|-----------|---------|
| Deploy all applications | `./scripts/deploy/deploy-all.sh` |
| Deploy Spring Boot only | `./scripts/deploy/deploy-springboot.sh` |

## Logs and SSH

| Operation | Command |
|-----------|---------|
| SSH to instance | `./scripts/server/ssh.sh` |
| View Spring Boot logs | `./scripts/server/view-logs.sh --service=spring-boot` |
| Follow MongoDB logs | `./scripts/server/view-logs.sh --service=mongodb --follow` |

## Common Workflows

### Starting Development Environment

```bash
# Start EC2 instances
./scripts/server/ec2-instances.sh start

# Wait for instances to fully initialize (about 1-2 minutes)
sleep 60

# Start services
./scripts/server/services.sh start

# Check status
./scripts/server/services.sh status
```

### Shutting Down Environment

```bash
# Stop services gracefully
./scripts/server/services.sh stop

# Stop EC2 instances
./scripts/server/ec2-instances.sh stop
```

### Deploying Updates

```bash
# Deploy backend updates
./scripts/deploy/deploy-springboot.sh

# Restart services
./scripts/server/services.sh restart
```
