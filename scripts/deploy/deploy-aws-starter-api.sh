#!/bin/bash

# Script to deploy the AWS Starter API service
set -e

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$PROJECT_ROOT"

# Set variables
EC2_IP="13.52.157.48"  # t2.small instance (combined services)
SSH_KEY="/home/msloan/.ssh/aws-starter-key.pem"
APP_NAME="aws-starter-api"
APP_JAR="aws-starter-api/target/${APP_NAME}-0.0.1-SNAPSHOT.jar"
REMOTE_DIR="/home/ubuntu/${APP_NAME}"

# Check SSH key exists
if [[ ! -f "$SSH_KEY" ]]; then
    echo "❌ Error: SSH key not found at $SSH_KEY"
    exit 1
fi

echo "🚀 Building Spring Boot application..."
cd aws-starter-api
./mvnw clean package -DskipTests
cd ..

# Check if build was successful
if [ $? -ne 0 ]; then
    echo "❌ Build failed. Exiting."
    exit 1
fi

echo "📦 Deploying to EC2 instance at $EC2_IP..."

# Get current IP for verification
CURRENT_IP=$(curl -s https://checkip.amazonaws.com)

# Test SSH connection with 10 second timeout
echo "🔍 Testing SSH connection from IP: $CURRENT_IP..."
if ! ssh -i $SSH_KEY -o ConnectTimeout=10 ubuntu@$EC2_IP "echo 'SSH connection successful'" 2>/dev/null; then
    echo "❌ SSH connection failed after 10 seconds"
    echo "ℹ️ Your current IP address is: $CURRENT_IP"
    echo "📝 Please verify this IP is allowed in the EC2 security group"
    exit 1
fi

# Stop the service before deployment
echo "⏹️ Stopping AWS Starter API service..."
ssh -i $SSH_KEY ubuntu@$EC2_IP "sudo systemctl stop aws-starter-api.service"

# Create remote directory if it doesn't exist
echo "📂 Setting up deployment directory..."
ssh -i $SSH_KEY ubuntu@$EC2_IP "mkdir -p $REMOTE_DIR"

# Copy new JAR file to EC2
echo "💾 Copying application files to server..."
if ! scp -i $SSH_KEY $APP_JAR ubuntu@$EC2_IP:$REMOTE_DIR/; then
    echo "❌ Failed to copy JAR file to server"
    exit 1
fi

# Verify the JAR file was transferred correctly
echo "🔍 Verifying JAR file integrity..."
JAR_SIZE_LOCAL=$(ls -l $APP_JAR | awk '{print $5}')
JAR_SIZE_REMOTE=$(ssh -i $SSH_KEY ubuntu@$EC2_IP "ls -l $REMOTE_DIR/${APP_NAME}-0.0.1-SNAPSHOT.jar | awk '{print \$5}'")

if [ "$JAR_SIZE_LOCAL" != "$JAR_SIZE_REMOTE" ]; then
    echo "❌ JAR file size mismatch. Local: $JAR_SIZE_LOCAL, Remote: $JAR_SIZE_REMOTE"
    exit 1
fi

# Start the service
echo "▶️ Starting AWS Starter API service..."
ssh -i $SSH_KEY ubuntu@$EC2_IP "sudo systemctl start aws-starter-api.service"

# Check service status
echo "🔍 Checking service status..."
sleep 5
SERVICE_STATUS=$(ssh -i $SSH_KEY ubuntu@$EC2_IP "sudo systemctl status aws-starter-api.service")

if echo "$SERVICE_STATUS" | grep -q "active (running)"; then
    echo "✅ AWS Starter API service is running!"
else
    echo "❌ AWS Starter API service failed to start. Status:"
    echo "$SERVICE_STATUS"
    echo "📋 Checking logs:"
    ssh -i $SSH_KEY ubuntu@$EC2_IP "sudo journalctl -u aws-starter-api.service | tail -n 50"
    exit 1
fi

echo "🎉 Deployment completed successfully!"
