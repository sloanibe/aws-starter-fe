#!/bin/bash

# Script to deploy updated Login Service and API Gateway Service to EC2 instance
# This script deploys the updated services with path rewriting to fix the path duplication issue

set -e  # Exit on error

echo "=== Deploying Updated Services to Fix Path Duplication Issue ==="

# Configuration
EC2_HOST="ec2-13-52-157-48.us-west-1.compute.amazonaws.com"
EC2_USER="ec2-user"
SSH_KEY_PATH="~/.ssh/aws-starter-key.pem"
LOCAL_LOGIN_JAR="login-service/target/login-service-0.0.1-SNAPSHOT.jar"
LOCAL_GATEWAY_JAR="api-gateway-service/target/api-gateway-service-0.0.1-SNAPSHOT.jar"
REMOTE_LOGIN_JAR="/home/ec2-user/services/login-service.jar"
REMOTE_GATEWAY_JAR="/home/ec2-user/services/api-gateway-service.jar"

# Check if JAR files exist
if [ ! -f "$LOCAL_LOGIN_JAR" ]; then
    echo "Error: Login Service JAR not found at $LOCAL_LOGIN_JAR"
    exit 1
fi

if [ ! -f "$LOCAL_GATEWAY_JAR" ]; then
    echo "Error: API Gateway Service JAR not found at $LOCAL_GATEWAY_JAR"
    exit 1
fi

echo "Step 1: Copying updated JAR files to EC2 instance..."
scp -i $SSH_KEY_PATH $LOCAL_LOGIN_JAR $EC2_USER@$EC2_HOST:$REMOTE_LOGIN_JAR
scp -i $SSH_KEY_PATH $LOCAL_GATEWAY_JAR $EC2_USER@$EC2_HOST:$REMOTE_GATEWAY_JAR

echo "Step 2: Restarting services on EC2 instance..."
ssh -i $SSH_KEY_PATH $EC2_USER@$EC2_HOST << 'EOF'
    echo "Stopping Login Service..."
    sudo systemctl stop login-service
    
    echo "Stopping API Gateway Service..."
    sudo systemctl stop api-gateway-service
    
    echo "Starting Login Service..."
    sudo systemctl start login-service
    
    echo "Starting API Gateway Service..."
    sudo systemctl start api-gateway-service
    
    echo "Checking service status..."
    echo "Login Service:"
    sudo systemctl status login-service | head -n 10
    
    echo "API Gateway Service:"
    sudo systemctl status api-gateway-service | head -n 10
EOF

echo "Step 3: Testing the API endpoints..."
echo "Testing login endpoint through AWS API Gateway..."
curl -s -X POST -H 'Content-Type: application/json' \
    -d '{"email":"test@example.com","password":"password","organization":"Test Company"}' \
    https://vab90wx4u0.execute-api.us-west-1.amazonaws.com/prod/api/login | jq

echo "Testing test endpoint through AWS API Gateway..."
curl -s -X GET https://vab90wx4u0.execute-api.us-west-1.amazonaws.com/prod/api/test | jq

echo "=== Deployment Complete ==="
