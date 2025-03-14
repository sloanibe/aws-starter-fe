#!/bin/bash

# This script builds the Spring Boot jar and deploys it to EC2
set -e

# Configuration variables
KEY_PATH="/home/msloan/.ssh/aws-starter-key.pem"
EC2_USER="ubuntu"
EC2_HOST="3.101.24.225"        # Our new EC2 instance IP
DEST_DIR="/opt/aws-starter-api"    # Directory configured in our systemd service
JAR_NAME="aws-starter-api.jar"     # Simple name for our systemd service
LOCAL_JAR_PATH="aws-starter-api/target/aws-starter-api-0.0.1-SNAPSHOT.jar"

echo "Building jar file..."
cd aws-starter-api
mvn clean package -DskipTests
cd ..

echo "Creating remote app directory if it doesn't exist..."
ssh -i "$KEY_PATH" "${EC2_USER}@${EC2_HOST}" "mkdir -p ${DEST_DIR}"

echo "Syncing jar file to EC2..."
rsync -avz --progress -e "ssh -i ${KEY_PATH}" \
    "${LOCAL_JAR_PATH}" \
    "${EC2_USER}@${EC2_HOST}:${DEST_DIR}/${JAR_NAME}"

echo "Deploying application..."
ssh -i "$KEY_PATH" "${EC2_USER}@${EC2_HOST}" << EOF
    # Stop the Spring Boot service
    echo "Stopping Spring Boot service..."
    sudo systemctl stop spring-boot-app

    # Ensure the destination directory exists and has correct permissions
    sudo mkdir -p "${DEST_DIR}"
    sudo chown ubuntu:ubuntu "${DEST_DIR}"

    # Start the Spring Boot service
    echo "Starting Spring Boot service..."
    sudo systemctl start spring-boot-app

    # Check if the service is running
    sleep 5
    if sudo systemctl is-active spring-boot-app > /dev/null; then
        echo "Spring Boot service started successfully!"
    else
        echo "Failed to start Spring Boot service. Check logs with 'sudo journalctl -u spring-boot-app'"
        exit 1
    fi
EOF

echo "Deployment complete! Application is running on ${EC2_HOST}"
