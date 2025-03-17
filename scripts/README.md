# AWS Starter Scripts

This directory contains helper scripts for managing the AWS Starter application. The scripts are organized into three main categories:
1. Service Management - Day-to-day operations like starting/stopping services
2. Monitoring - Log viewing and health checks
3. Infrastructure - AWS resource management

## Directory Structure

```
scripts/
├── aws/            # AWS infrastructure management
│   └── manage-aws.sh  # Manage AWS resources (EC2, API Gateway, SES)
├── server/         # Service and monitoring scripts
│   ├── services.sh    # Manage application services
│   ├── view-logs.sh   # View and monitor logs
│   └── ssh.sh         # SSH utilities
└── README.md      # This file
```

## Script Categories

### 1. Service Management (`services.sh`)
Manages application-level services running on EC2.

```bash
# Start/Stop/Restart all services
./scripts/server/services.sh start
./scripts/server/services.sh stop
./scripts/server/services.sh restart

# Manage specific service
./scripts/server/services.sh start --service=spring-boot
./scripts/server/services.sh stop --service=mongodb

# Check service status
./scripts/server/services.sh status

# Force kill hung processes
./scripts/server/services.sh kill --service=spring-boot
```

### 2. Monitoring (`view-logs.sh`)
Provides real-time monitoring and log access.

```bash
# View Spring Boot logs
./scripts/server/view-logs.sh --service=spring-boot

# View MongoDB logs
./scripts/server/view-logs.sh --service=mongodb

# Follow logs in real-time
./scripts/server/view-logs.sh --service=spring-boot --follow

# Show only errors
./scripts/server/view-logs.sh --service=spring-boot --error

# View last 100 lines
./scripts/server/view-logs.sh --service=mongodb --tail 100

# Check service health
./scripts/server/view-logs.sh --service=spring-boot --health
```

### 3. Infrastructure Management (`manage-aws.sh`)
Manages AWS infrastructure and resources.

```bash
# Deploy/Update AWS Services
./scripts/aws/manage-aws.sh deploy --service=all      # Deploy all services
./scripts/aws/manage-aws.sh update --service=ses     # Update SES configuration
./scripts/aws/manage-aws.sh deploy --service=api-gateway --force  # Force redeploy API Gateway

# Check AWS Status
./scripts/aws/manage-aws.sh status --service=all     # Check all services
./scripts/aws/manage-aws.sh status --service=ec2     # Check EC2 instances

# Delete AWS Resources
./scripts/aws/manage-aws.sh delete --service=ses     # Delete SES stack
```

## Common Operations

### Initial Setup
```bash
# 1. Deploy AWS infrastructure
./scripts/aws/manage-aws.sh deploy --service=all

# 2. Start services
./scripts/server/services.sh start

# 3. Check status
./scripts/server/services.sh status
./scripts/aws/manage-aws.sh status --service=all
```

### Monitoring
```bash
# 1. Check service health
./scripts/server/services.sh status

# 2. View application logs
./scripts/server/view-logs.sh --service=spring-boot --follow

# 3. Check AWS resources
./scripts/aws/manage-aws.sh status --service=all
```

### Troubleshooting
```bash
# 1. Check for errors
./scripts/server/view-logs.sh --service=spring-boot --error

# 2. Restart problematic service
./scripts/server/services.sh restart --service=spring-boot

# 3. Force kill if needed
./scripts/server/services.sh kill --service=spring-boot

# 4. Verify AWS configuration
./scripts/aws/manage-aws.sh status --service=all
```

## Best Practices

1. **Service Management**
   - Use `services.sh` for daily operations (start/stop/restart)
   - Always check status after operations
   - Use kill command only as a last resort

2. **Monitoring**
   - Use `view-logs.sh` for real-time monitoring
   - Check both application and AWS status regularly
   - Keep an eye on error logs

3. **AWS Management**
   - Use `manage-aws.sh` for infrastructure changes
   - Always check status before and after changes
   - Use --force option carefully
   - Back up data before major changes
