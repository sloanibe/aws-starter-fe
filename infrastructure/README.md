# AWS Infrastructure Setup

This directory contains CloudFormation templates to set up the complete AWS infrastructure for the project.

## Infrastructure Components

The `aws-infrastructure.yml` template creates:

1. **Network**:
   - VPC (10.0.0.0/16)
   - Public subnet in us-west-1b
   - Internet Gateway
   - Route tables and associations

2. **Security**:
   - Spring Boot security group (ports 22, 8080)
   - MongoDB security group (ports 22, 27017)
   - SSH access restricted to your IP
   - MongoDB access restricted to your IP and Spring Boot instance

3. **Compute**:
   - Spring Boot EC2 instance (t2.micro)
     - Java 17 pre-installed
     - Tagged for auto-stop
   - MongoDB EC2 instance (t2.micro)
     - MongoDB 7.0 pre-installed
     - Tagged for auto-stop

## Deployment Instructions

1. **Create Key Pair** (if not already done):
   ```bash
   aws ec2 create-key-pair \
       --region us-west-1 \
       --key-name aws-starter-key \
       --query 'KeyMaterial' \
       --output text > ~/.ssh/aws-starter-key.pem
   
   chmod 400 ~/.ssh/aws-starter-key.pem
   ```

2. **Deploy Stack**:
   ```bash
   aws cloudformation create-stack \
       --region us-west-1 \
       --stack-name aws-starter-stack \
       --template-body file://aws-infrastructure.yml \
       --capabilities CAPABILITY_IAM \
       --parameters \
           ParameterKey=KeyName,ParameterValue=aws-starter-key \
           ParameterKey=LocalIpAddress,ParameterValue=YOUR_IP/32
   ```

3. **Monitor Stack Creation**:
   ```bash
   aws cloudformation describe-stacks \
       --region us-west-1 \
       --stack-name aws-starter-stack \
       --query 'Stacks[0].StackStatus'
   ```

4. **Get Instance IPs**:
   ```bash
   aws cloudformation describe-stacks \
       --region us-west-1 \
       --stack-name aws-starter-stack \
       --query 'Stacks[0].Outputs'
   ```

## Post-Deployment Steps

1. **SSH to Spring Boot Instance**:
   ```bash
   ssh -i ~/.ssh/aws-starter-key.pem ec2-user@SPRINGBOOT_IP
   ```

2. **SSH to MongoDB Instance**:
   ```bash
   ssh -i ~/.ssh/aws-starter-key.pem ec2-user@MONGODB_IP
   ```

3. **Configure MongoDB**:
   - Create database user
   - Update Spring Boot application.yml with MongoDB credentials

## Cleanup

To delete all resources:
```bash
aws cloudformation delete-stack \
    --region us-west-1 \
    --stack-name aws-starter-stack
```
