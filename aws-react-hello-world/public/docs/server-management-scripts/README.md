# AWS Starter Project - Server Management Scripts

This document provides a comprehensive guide to all the high-level scripts available in the AWS Starter project. These scripts help you manage your AWS infrastructure, deploy applications, and manage services running on EC2 instances.

## Table of Contents

1. [AWS Infrastructure Management](#aws-infrastructure-management)
   - [manage-aws.sh](#manage-awssh)
   - [setup-auto-stop.sh](#setup-auto-stopsh)
2. [Deployment Scripts](#deployment-scripts)
   - [deploy-all.sh](#deploy-allsh)
   - [deploy-springboot.sh](#deploy-springbootsh)
3. [Server Management Scripts](#server-management-scripts)
   - [ec2-instances.sh](#ec2-instancessh)
   - [services.sh](#servicessh)
   - [ssh.sh](#sshsh)
   - [view-logs.sh](#view-logssh)

---

## AWS Infrastructure Management

### manage-aws.sh

**Location**: `/scripts/aws/manage-aws.sh`

**Purpose**: Central script for managing all AWS infrastructure components including EC2 instances, API Gateway, SES, and auto-stop functionality.

**Usage**:
```bash
./scripts/aws/manage-aws.sh [deploy|update|status|delete] [--service=all|api-gateway|ses|ec2|auto-stop] [--force] [--env=dev|prod]
```

**Examples**:
- Deploy all infrastructure: `./scripts/aws/manage-aws.sh deploy --service=all`
- Check status of EC2: `./scripts/aws/manage-aws.sh status --service=ec2`
- Delete API Gateway: `./scripts/aws/manage-aws.sh delete --service=api-gateway`
- Update auto-stop functionality: `./scripts/aws/manage-aws.sh update --service=auto-stop`

**Options**:
- `deploy`: Create new infrastructure
- `update`: Update existing infrastructure
- `status`: Check status of infrastructure
- `delete`: Delete infrastructure
- `--service=all|api-gateway|ses|ec2|auto-stop`: Specify which service to manage
- `--force`: Force recreation of resources (with deploy)
- `--env=dev|prod`: Specify environment (default: dev)

---

### setup-auto-stop.sh

**Location**: `/scripts/aws/setup-auto-stop.sh`

**Purpose**: Sets up automatic stopping and starting of EC2 instances using EventBridge rules and Lambda functions.

**Usage**:
```bash
./scripts/aws/setup-auto-stop.sh [--stop-time=HH:MM] [--start-time=HH:MM]
```

**Examples**:
- Setup with default times: `./scripts/aws/setup-auto-stop.sh`
- Custom schedule: `./scripts/aws/setup-auto-stop.sh --stop-time=23:30 --start-time=07:30`

**Note**: This script is an alternative to using `manage-aws.sh` with the `auto-stop` service. It provides more direct control over the schedule times.

---

## Deployment Scripts

### deploy-all.sh

**Location**: `/scripts/deploy/deploy-all.sh`

**Purpose**: Deploys both frontend and backend applications to AWS.

**Usage**:
```bash
./scripts/deploy/deploy-all.sh [--env=dev|prod]
```

**Examples**:
- Deploy to development: `./scripts/deploy/deploy-all.sh`
- Deploy to production: `./scripts/deploy/deploy-all.sh --env=prod`

---

### deploy-springboot.sh

**Location**: `/scripts/deploy/deploy-springboot.sh`

**Purpose**: Deploys only the Spring Boot backend application to EC2.

**Usage**:
```bash
./scripts/deploy/deploy-springboot.sh [--env=dev|prod]
```

**Examples**:
- Deploy to development: `./scripts/deploy/deploy-springboot.sh`
- Deploy to production: `./scripts/deploy/deploy-springboot.sh --env=prod`

---

## Server Management Scripts

### ec2-instances.sh

**Location**: `/scripts/server/ec2-instances.sh`

**Purpose**: Manages EC2 instances (start, stop, status) at the instance level.

**Usage**:
```bash
./scripts/server/ec2-instances.sh [start|stop|status] [--instance=all|combined|springboot|mongodb]
```

**Examples**:
- Start all instances: `./scripts/server/ec2-instances.sh start`
- Stop the combined instance: `./scripts/server/ec2-instances.sh stop --instance=combined`
- Check status of all instances: `./scripts/server/ec2-instances.sh status`

**Note**: This script manages the actual EC2 instances, not the services running on them. Use `services.sh` to manage services after instances are running.

---

### services.sh

**Location**: `/scripts/server/services.sh`

**Purpose**: Manages services running on EC2 instances (Spring Boot, MongoDB).

**Usage**:
```bash
./scripts/server/services.sh [start|stop|restart|status|kill] [--service=all|spring-boot|mongodb]
```

**Examples**:
- Start all services: `./scripts/server/services.sh start`
- Restart Spring Boot: `./scripts/server/services.sh restart --service=spring-boot`
- Check status of MongoDB: `./scripts/server/services.sh status --service=mongodb`

**Note**: This script requires that the EC2 instances are already running. Use `ec2-instances.sh` first to start instances if needed.

---

### ssh.sh

**Location**: `/scripts/server/ssh.sh`

**Purpose**: Provides easy SSH access to EC2 instances.

**Usage**:
```bash
./scripts/server/ssh.sh [--instance=combined|springboot|mongodb]
```

**Examples**:
- SSH to combined instance: `./scripts/server/ssh.sh`
- SSH to Spring Boot instance: `./scripts/server/ssh.sh --instance=springboot`

**Note**: Instances must be running before you can SSH to them.

---

### view-logs.sh

**Location**: `/scripts/server/view-logs.sh`

**Purpose**: Displays logs from services running on EC2 instances.

**Usage**:
```bash
./scripts/server/view-logs.sh [--service=spring-boot|mongodb] [--lines=100] [--follow]
```

**Examples**:
- View Spring Boot logs: `./scripts/server/view-logs.sh --service=spring-boot`
- Follow MongoDB logs: `./scripts/server/view-logs.sh --service=mongodb --follow`
- View last 500 lines of Spring Boot logs: `./scripts/server/view-logs.sh --service=spring-boot --lines=500`

**Options**:
- `--service=spring-boot|mongodb`: Which service logs to view
- `--lines=N`: Number of lines to display (default: 100)
- `--follow`: Continuously show new log entries (like `tail -f`)

---

## Workflow Examples

### Complete Deployment Workflow

1. Deploy infrastructure:
   ```bash
   ./scripts/aws/manage-aws.sh deploy --service=all
   ```

2. Deploy applications:
   ```bash
   ./scripts/deploy/deploy-all.sh
   ```

3. Check status:
   ```bash
   ./scripts/aws/manage-aws.sh status --service=all
   ./scripts/server/services.sh status
   ```

### Daily Development Workflow

1. Start EC2 instances:
   ```bash
   ./scripts/server/ec2-instances.sh start
   ```

2. Start services:
   ```bash
   ./scripts/server/services.sh start
   ```

3. View logs:
   ```bash
   ./scripts/server/view-logs.sh --service=spring-boot --follow
   ```

4. Stop instances when done:
   ```bash
   ./scripts/server/ec2-instances.sh stop
   ```

### Setting Up Auto-Stop

1. Configure auto-stop functionality:
   ```bash
   ./scripts/aws/manage-aws.sh deploy --service=auto-stop
   ```

2. Verify configuration:
   ```bash
   ./scripts/aws/manage-aws.sh status --service=auto-stop
   ```

This will automatically stop EC2 instances at 11:30 PM PST and start them at 7:30 AM PST.
