#!/bin/bash

# Script to deploy login service to EC2 instance
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Instance IPs
EC2_IP="13.52.157.48"
SSH_KEY="/home/msloan/.ssh/aws-starter-key.pem"
REMOTE_DIR="/home/ubuntu/login-service"

echo "Building login service..."
cd $PROJECT_ROOT/login-service
mvn clean package -DskipTests

echo "Stopping login service on server..."
ssh -i $SSH_KEY ubuntu@$EC2_IP "sudo systemctl stop login-service.service"

echo "Copying JAR file to server..."
scp -i $SSH_KEY $PROJECT_ROOT/login-service/target/login-service-0.0.1-SNAPSHOT.jar ubuntu@$EC2_IP:$REMOTE_DIR/login-service.jar

echo "Starting login service on server..."
ssh -i $SSH_KEY ubuntu@$EC2_IP "sudo systemctl start login-service.service"

echo "Deployment complete!"
