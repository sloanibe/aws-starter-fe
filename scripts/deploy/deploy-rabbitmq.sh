#!/bin/bash
# Deploy RabbitMQ using CloudFormation

set -e

# Configuration
STACK_NAME="aws-starter-rabbitmq"
TEMPLATE_FILE="$(cd "$(dirname "$0")/../../infrastructure/cloudformation" && pwd)/rabbitmq-service.yml"
KEY_NAME="aws-starter-key"
LOCAL_IP="$(curl -s https://checkip.amazonaws.com)/32"
HOSTED_ZONE_ID="Z03563681XDZ1U0VJCB9P"
DOMAIN_NAME="rabbitmq.sloandev.net"

echo "Deploying RabbitMQ using CloudFormation..."
echo "Template file: ${TEMPLATE_FILE}"

# Check if stack exists
if aws cloudformation describe-stacks --stack-name ${STACK_NAME} >/dev/null 2>&1; then
  echo "Stack ${STACK_NAME} already exists, updating..."
  
  # Update the stack
  aws cloudformation update-stack \
    --stack-name ${STACK_NAME} \
    --template-body file://${TEMPLATE_FILE} \
    --parameters \
      ParameterKey=KeyName,ParameterValue=${KEY_NAME} \
      ParameterKey=LocalIpAddress,ParameterValue=${LOCAL_IP} \
      ParameterKey=EnvironmentName,ParameterValue=aws-starter \
      ParameterKey=HostedZoneId,ParameterValue=${HOSTED_ZONE_ID} \
      ParameterKey=DomainName,ParameterValue=${DOMAIN_NAME} \
    --capabilities CAPABILITY_IAM
  
  # Wait for stack update to complete
  echo "Waiting for stack update to complete..."
  aws cloudformation wait stack-update-complete --stack-name ${STACK_NAME}
  
  echo "Stack update completed!"
else
  echo "Creating new stack ${STACK_NAME}..."
  
  # Create the stack
  aws cloudformation create-stack \
    --stack-name ${STACK_NAME} \
    --template-body file://${TEMPLATE_FILE} \
    --parameters \
      ParameterKey=KeyName,ParameterValue=${KEY_NAME} \
      ParameterKey=LocalIpAddress,ParameterValue=${LOCAL_IP} \
      ParameterKey=EnvironmentName,ParameterValue=aws-starter \
      ParameterKey=HostedZoneId,ParameterValue=${HOSTED_ZONE_ID} \
      ParameterKey=DomainName,ParameterValue=${DOMAIN_NAME} \
    --capabilities CAPABILITY_IAM
  
  # Wait for stack creation to complete
  echo "Waiting for stack creation to complete..."
  aws cloudformation wait stack-create-complete --stack-name ${STACK_NAME}
  
  echo "Stack creation completed!"
fi

# Get stack outputs
RABBITMQ_IP=$(aws cloudformation describe-stacks \
  --stack-name ${STACK_NAME} \
  --query "Stacks[0].Outputs[?OutputKey=='RabbitMQInstancePublicIP'].OutputValue" \
  --output text)

RABBITMQ_UI=$(aws cloudformation describe-stacks \
  --stack-name ${STACK_NAME} \
  --query "Stacks[0].Outputs[?OutputKey=='RabbitMQManagementUI'].OutputValue" \
  --output text)

RABBITMQ_DNS=$(aws cloudformation describe-stacks \
  --stack-name ${STACK_NAME} \
  --query "Stacks[0].Outputs[?OutputKey=='RabbitMQDNSName'].OutputValue" \
  --output text)

echo "RabbitMQ deployed successfully!"
echo "RabbitMQ Instance IP: ${RABBITMQ_IP}"
echo "RabbitMQ DNS: ${RABBITMQ_DNS}"
echo "Management UI: ${RABBITMQ_UI}"
echo "Username: admin"
echo "Password: admin123"

# Update configuration in other services
echo "Updating RabbitMQ configuration in services..."

# Update Login Service configuration
LOGIN_ENV_FILE="/home/msloan/gitprojects/aws-starter/login-service/.env"
if [ -f "${LOGIN_ENV_FILE}" ]; then
  echo "Updating Login Service .env file..."
  sed -i "s/RABBITMQ_HOST=.*/RABBITMQ_HOST=${RABBITMQ_DNS}/g" "${LOGIN_ENV_FILE}"
  sed -i "s/RABBITMQ_ENABLED=.*/RABBITMQ_ENABLED=true/g" "${LOGIN_ENV_FILE}"
  echo "Login Service configuration updated."
fi

# Update Email Service configuration
EMAIL_ENV_FILE="/home/msloan/gitprojects/aws-starter/email-service/.env"
if [ -f "${EMAIL_ENV_FILE}" ]; then
  echo "Updating Email Service .env file..."
  sed -i "s/RABBITMQ_HOST=.*/RABBITMQ_HOST=${RABBITMQ_DNS}/g" "${EMAIL_ENV_FILE}"
  echo "Email Service configuration updated."
fi

echo ""
echo "Next steps:"
echo "1. Deploy the Login Service with: ./scripts/deploy/deploy-login-service.sh"
echo "2. Deploy the Email Service with: ./scripts/deploy/deploy-email-service.sh"
echo "3. Test the end-to-end login flow with RabbitMQ integration"
