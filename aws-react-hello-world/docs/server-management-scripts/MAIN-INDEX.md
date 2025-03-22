# AWS Starter Project Documentation

Welcome to the AWS Starter Project documentation. This guide provides comprehensive information about managing your AWS infrastructure, deploying applications, and maintaining services.

## Documentation Navigation

### Main Guides

- [**Server Management Scripts**](README.md) - Comprehensive guide to all scripts
- [**Quick Reference Guide**](QUICK-REFERENCE.md) - Concise commands for common tasks
- [**Auto-Stop Functionality**](AUTO-STOP.md) - Guide to automatic EC2 instance management

### Indexes

- [**Alphabetical Topic Index**](TOPIC-INDEX.md) - Complete alphabetical listing of all topics
- [**Categorized Index**](INDEX.md) - Topics organized by category

## Key Topics

### Infrastructure Management

- [AWS Infrastructure Management](README.md#aws-infrastructure-management)
- [Auto-Stop Functionality](AUTO-STOP.md)
- [EC2 Instance Management](README.md#ec2-instancessh)

### Service Management

- [Service Management](README.md#servicessh)
- [Logging and Monitoring](README.md#view-logssh)
- [SSH Access](README.md#sshsh)

### Deployment

- [Deployment Scripts](README.md#deployment-scripts)
- [Deployment Workflows](README.md#workflow-examples)

## Common Tasks

### Starting Development

```bash
# Start EC2 instances
./scripts/server/ec2-instances.sh start

# Start services
./scripts/server/services.sh start
```

### Deploying Updates

```bash
# Deploy all components
./scripts/deploy/deploy-all.sh
```

### Shutting Down

```bash
# Stop services
./scripts/server/services.sh stop

# Stop EC2 instances
./scripts/server/ec2-instances.sh stop
```

## Additional Resources

- [AWS Documentation](https://docs.aws.amazon.com/)
- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [React Documentation](https://reactjs.org/docs/getting-started.html)
