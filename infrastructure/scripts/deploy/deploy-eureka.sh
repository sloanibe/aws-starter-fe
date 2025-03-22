#!/bin/bash

# Script should be run from the project root
if [[ ! -d "service-discovery-service" ]]; then
    echo "❌ Error: Script must be run from project root directory"
    echo "Usage: ./infrastructure/scripts/deploy/deploy-eureka.sh"
    exit 1
fi

# Set variables
EC2_IP="13.52.157.48"
SSH_KEY="/home/msloan/.ssh/aws-starter-key.pem"
APP_NAME="service-discovery-service"
APP_JAR="service-discovery-service/target/${APP_NAME}-0.0.1-SNAPSHOT.jar"
REMOTE_DIR="/home/ubuntu/${APP_NAME}"

# Check SSH key exists
if [[ ! -f "$SSH_KEY" ]]; then
    echo "❌ Error: SSH key not found at $SSH_KEY"
    exit 1
fi

echo "🚀 Building Eureka Service Discovery application..."
cd service-discovery-service
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

# Create remote directory if it doesn't exist
echo "📂 Setting up deployment directory..."
ssh -i $SSH_KEY ubuntu@$EC2_IP "mkdir -p $REMOTE_DIR"

# Clean up old deployment
if ssh -i $SSH_KEY ubuntu@$EC2_IP "test -f $REMOTE_DIR/${APP_NAME}-0.0.1-SNAPSHOT.jar"; then
    echo "🗑 Cleaning up old deployment..."
    ssh -i $SSH_KEY ubuntu@$EC2_IP "rm -f $REMOTE_DIR/${APP_NAME}-0.0.1-SNAPSHOT.jar $REMOTE_DIR/eureka.log"
fi

# Copy new JAR file to EC2
echo "💾 Copying application files to server..."
if ! scp -i $SSH_KEY $APP_JAR ubuntu@$EC2_IP:$REMOTE_DIR/; then
    echo "❌ Failed to copy JAR file to server"
    exit 1
fi

# Copy systemd service file
echo "📄 Copying systemd service file..."
if ! scp -i $SSH_KEY service-discovery-service/service-discovery.service ubuntu@$EC2_IP:/tmp/; then
    echo "❌ Failed to copy service file to server"
    exit 1
fi

# Install systemd service
echo "🔧 Installing systemd service..."
ssh -i $SSH_KEY ubuntu@$EC2_IP "sudo mv /tmp/service-discovery.service /etc/systemd/system/ && sudo systemctl daemon-reload"

# Check if the application is already running
echo "🔍 Checking application status..."
if ssh -i $SSH_KEY ubuntu@$EC2_IP "systemctl is-active service-discovery.service"; then
    echo "⏸️ Stopping existing service..."
    ssh -i $SSH_KEY ubuntu@$EC2_IP "sudo systemctl stop service-discovery.service"
fi

# Start the service
echo "▶️ Starting the service..."
ssh -i $SSH_KEY ubuntu@$EC2_IP "sudo systemctl start service-discovery.service"

# Enable service to start on boot
echo "🔄 Enabling service to start on boot..."
ssh -i $SSH_KEY ubuntu@$EC2_IP "sudo systemctl enable service-discovery.service"

# Wait for startup
echo "⏳ Waiting for Eureka server to start..."
sleep 10

# Check service status
echo "🔍 Checking service status..."
ssh -i $SSH_KEY ubuntu@$EC2_IP "systemctl status service-discovery.service"

# Verify Eureka is running
echo "🔍 Verifying Eureka server is running..."
for i in {1..6}; do
    if curl -s http://$EC2_IP:8761/actuator/health 2>&1 | grep -q '"status":"UP"'; then
        echo "✅ Eureka Service Discovery is healthy and ready to serve requests!"
        echo "📊 Eureka dashboard is available at: http://$EC2_IP:8761/"
        exit 0
    fi
    sleep 5
done

echo "❌ Health check failed"
echo "📋 Checking logs for errors:"
ssh -i $SSH_KEY ubuntu@$EC2_IP "tail -n 20 $REMOTE_DIR/eureka.log"
exit 1
