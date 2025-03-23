#!/bin/bash

# Script to install and enable all systemd service files on the EC2 instance
# Usage: ./install-systemd-files.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# EC2 instance details
EC2_IP="13.52.157.48"
SSH_KEY="/home/msloan/.ssh/aws-starter-key.pem"

# Service files to install
SERVICE_FILES=(
    "$PROJECT_ROOT/service-discovery-service/service-discovery.service"
    "$PROJECT_ROOT/config-server-service/config-server.service"
    "$PROJECT_ROOT/api-gateway-service/api-gateway.service"
    "$PROJECT_ROOT/aws-starter-api/aws-starter-api.service"
)

echo "Installing and enabling systemd service files on EC2 instance..."

# Copy service files to EC2 instance and enable them
for service_file in "${SERVICE_FILES[@]}"; do
    if [ -f "$service_file" ]; then
        service_name=$(basename "$service_file")
        echo "Installing $service_name..."
        
        # Copy service file to EC2 instance
        scp -i $SSH_KEY "$service_file" ubuntu@$EC2_IP:/tmp/
        
        # Move to system directory and enable
        ssh -i $SSH_KEY ubuntu@$EC2_IP "sudo mv /tmp/$service_name /etc/systemd/system/ && \
            sudo systemctl daemon-reload && \
            sudo systemctl enable $service_name && \
            echo \"✅ $service_name installed and enabled\""
    else
        echo "❌ Service file not found: $service_file"
    fi
done

echo "Creating necessary directories..."
ssh -i $SSH_KEY ubuntu@$EC2_IP "mkdir -p /home/ubuntu/api-gateway-service"

echo "Checking if JAR files exist..."
ssh -i $SSH_KEY ubuntu@$EC2_IP "ls -la /home/ubuntu/*/"

echo "Starting all services..."
ssh -i $SSH_KEY ubuntu@$EC2_IP "sudo systemctl start service-discovery.service && \
    echo \"Waiting for Eureka to start...\" && \
    sleep 10 && \
    sudo systemctl start config-server.service && \
    echo \"Waiting for Config Server to start...\" && \
    sleep 10 && \
    sudo systemctl start api-gateway.service && \
    sudo systemctl start aws-starter-api.service"

echo "Checking service status..."
ssh -i $SSH_KEY ubuntu@$EC2_IP "echo \"=== Service Discovery Status ===\" && \
    sudo systemctl status service-discovery.service --no-pager && \
    echo -e \"\n=== Config Server Status ===\" && \
    sudo systemctl status config-server.service --no-pager && \
    echo -e \"\n=== API Gateway Status ===\" && \
    sudo systemctl status api-gateway.service --no-pager && \
    echo -e \"\n=== AWS Starter API Status ===\" && \
    sudo systemctl status aws-starter-api.service --no-pager"

echo "All services installed, enabled, and started!"
echo "These services will now start automatically when the EC2 instance boots up."
