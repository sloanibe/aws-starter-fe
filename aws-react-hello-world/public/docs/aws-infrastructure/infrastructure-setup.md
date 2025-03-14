# Infrastructure Setup

This document outlines how the AWS infrastructure is provisioned and managed for the AWS Starter Project.

## Overview

The AWS Starter Project uses CloudFormation to provision and manage its infrastructure. This infrastructure-as-code approach ensures consistency, repeatability, and easier management of AWS resources.

## CloudFormation Templates

The project uses two main CloudFormation templates:

1. **aws-infrastructure.yml**: The original template that creates separate EC2 instances for the API and MongoDB
2. **aws-infrastructure-combined.yml**: An optimized template that creates a single EC2 instance running both the API and MongoDB

### Combined Infrastructure Template

The combined template (`aws-infrastructure-combined.yml`) provisions:

- A VPC with public and private subnets
- Security groups for controlling access
- A single EC2 instance running Spring Boot, MongoDB, and Nginx
- IAM roles and policies for EC2 instance permissions

## Managing the Stack

The infrastructure is managed using the `manage-stack.sh` script, which provides commands for creating, updating, and deleting the CloudFormation stack.

### Creating the Stack

```bash
./manage-stack.sh create
```

This command:
1. Creates a new CloudFormation stack using the template
2. Provisions all required AWS resources
3. Outputs important information like instance IDs and IP addresses

### Updating the Stack

```bash
./manage-stack.sh update
```

This command:
1. Updates the existing CloudFormation stack with any template changes
2. Applies changes to the AWS resources as needed

### Deleting the Stack

```bash
./manage-stack.sh delete
```

This command:
1. Deletes the CloudFormation stack
2. Terminates all associated AWS resources

## Security Groups

The infrastructure includes security groups that control inbound and outbound traffic:

- **SSH Access**: Port 22 for administration
- **HTTP/HTTPS**: Ports 80 and 443 for web traffic
- **Spring Boot**: Port 8080 for direct API access
- **MongoDB**: Port 27017 for database access (internal only)

## Elastic IP Configuration

The EC2 instance is configured with an Elastic IP address (13.52.157.48) to provide a stable endpoint for the API. This ensures that the IP address doesn't change when the instance is stopped and started.

## Cost Optimization

The infrastructure is designed with cost optimization in mind:

1. **Instance Type**: Using t2.micro instances which are eligible for the AWS Free Tier
2. **Combined Services**: Running multiple services on a single instance to reduce costs
3. **AutoStop Tag**: Instances are tagged with `AutoStop=true` to enable automated shutdown when not in use

## DNS Configuration

The infrastructure relies on Route 53 for DNS management:

- **sloandev.net**: Points to the CloudFront distribution for the frontend
- **api.sloandev.net**: Points to the Elastic IP of the EC2 instance for the backend

## Monitoring and Logging

The infrastructure includes basic monitoring through CloudWatch:

- **Instance Metrics**: CPU, memory, and disk usage
- **Application Logs**: Stored on the EC2 instance

## Best Practices

The infrastructure follows several AWS best practices:

1. **Infrastructure as Code**: Using CloudFormation for reproducible deployments
2. **Security Groups**: Limiting access to only necessary ports and IP ranges
3. **IAM Roles**: Following the principle of least privilege
4. **Resource Tagging**: All resources are tagged for better organization and cost tracking
