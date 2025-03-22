#!/bin/bash

# Script to deploy Eureka Service Discovery using CloudFormation
# Usage: ./deploy-eureka-cf.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
CF_TEMPLATE="$PROJECT_ROOT/infrastructure/cloudformation/eureka-service.yml"
STACK_NAME="aws-starter-eureka-service"

# Check if CloudFormation template exists
if [[ ! -f "$CF_TEMPLATE" ]]; then
    echo "❌ Error: CloudFormation template not found at $CF_TEMPLATE"
    exit 1
fi

# Get AWS account details
echo "🔍 Checking AWS account details..."
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query "Account" --output text)
AWS_REGION=$(aws configure get region)

if [ -z "$AWS_ACCOUNT_ID" ] || [ -z "$AWS_REGION" ]; then
    echo "❌ Error: Could not determine AWS account ID or region. Please configure AWS CLI."
    exit 1
fi

echo "📋 AWS Account: $AWS_ACCOUNT_ID"
echo "📍 AWS Region: $AWS_REGION"

# Get VPC and subnet information
echo "🔍 Retrieving VPC and subnet information..."
VPC_ID=$(aws ec2 describe-vpcs --filters "Name=isDefault,Values=true" --query "Vpcs[0].VpcId" --output text)
SUBNET_ID=$(aws ec2 describe-subnets --filters "Name=vpc-id,Values=$VPC_ID" --query "Subnets[0].SubnetId" --output text)

if [ -z "$VPC_ID" ] || [ -z "$SUBNET_ID" ]; then
    echo "❌ Error: Could not determine VPC or subnet ID."
    exit 1
fi

echo "🌐 Using VPC: $VPC_ID"
echo "🌐 Using Subnet: $SUBNET_ID"

# Get current IP for security group
CURRENT_IP=$(curl -s https://checkip.amazonaws.com)
if [ -z "$CURRENT_IP" ]; then
    echo "⚠️ Warning: Could not determine current IP address. Using 0.0.0.0/0 for SSH access."
    CURRENT_IP="0.0.0.0/0"
else
    CURRENT_IP="$CURRENT_IP/32"
    echo "🔒 Restricting SSH access to: $CURRENT_IP"
fi

# Check if stack already exists
echo "🔍 Checking if CloudFormation stack already exists..."
if aws cloudformation describe-stacks --stack-name $STACK_NAME &> /dev/null; then
    echo "🔄 Stack already exists. Updating..."
    
    # Update the stack
    aws cloudformation update-stack \
        --stack-name $STACK_NAME \
        --template-body file://$CF_TEMPLATE \
        --parameters \
            ParameterKey=VpcId,ParameterValue=$VPC_ID \
            ParameterKey=SubnetId,ParameterValue=$SUBNET_ID \
            ParameterKey=SourceIp,ParameterValue=$CURRENT_IP \
        --capabilities CAPABILITY_IAM
    
    if [ $? -ne 0 ]; then
        echo "❌ Stack update failed or no updates to be performed."
        exit 1
    fi
    
    echo "⏳ Waiting for stack update to complete..."
    aws cloudformation wait stack-update-complete --stack-name $STACK_NAME
    
else
    echo "🆕 Creating new CloudFormation stack..."
    
    # Create the stack
    aws cloudformation create-stack \
        --stack-name $STACK_NAME \
        --template-body file://$CF_TEMPLATE \
        --parameters \
            ParameterKey=VpcId,ParameterValue=$VPC_ID \
            ParameterKey=SubnetId,ParameterValue=$SUBNET_ID \
            ParameterKey=SourceIp,ParameterValue=$CURRENT_IP \
        --capabilities CAPABILITY_IAM
    
    echo "⏳ Waiting for stack creation to complete..."
    aws cloudformation wait stack-create-complete --stack-name $STACK_NAME
fi

# Get outputs from the stack
echo "📊 Retrieving stack outputs..."
EUREKA_PUBLIC_IP=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='EurekaPublicIP'].OutputValue" --output text)
EUREKA_DASHBOARD_URL=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='EurekaDashboardUrl'].OutputValue" --output text)

echo "✅ Eureka Service Discovery infrastructure deployed successfully!"
echo "🌐 Eureka Public IP: $EUREKA_PUBLIC_IP"
echo "🔗 Eureka Dashboard URL: $EUREKA_DASHBOARD_URL"

# Now deploy the Spring Boot application
echo "🚀 Now deploying the Eureka Spring Boot application..."
echo "⏳ Please wait while we prepare the deployment..."

# Build the application
cd "$PROJECT_ROOT/service-discovery-service"
./mvnw clean package -DskipTests

# Deploy to the EC2 instance
echo "📦 Deploying application to EC2 instance..."
scp -i /home/msloan/.ssh/aws-starter-key.pem target/service-discovery-service-0.0.1-SNAPSHOT.jar ec2-user@$EUREKA_PUBLIC_IP:/home/eureka/service-discovery-service/

# Start the service
echo "▶️ Starting the Eureka service..."
ssh -i /home/msloan/.ssh/aws-starter-key.pem ec2-user@$EUREKA_PUBLIC_IP "sudo systemctl start service-discovery.service"

# Verify the service is running
echo "🔍 Verifying service status..."
ssh -i /home/msloan/.ssh/aws-starter-key.pem ec2-user@$EUREKA_PUBLIC_IP "sudo systemctl status service-discovery.service"

echo "✅ Deployment complete!"
echo "🔗 Eureka Dashboard URL: $EUREKA_DASHBOARD_URL"
echo "📝 Next steps:"
echo "  1. Update your existing services to register with Eureka"
echo "  2. Deploy the Config Server"
echo "  3. Deploy the API Gateway"
