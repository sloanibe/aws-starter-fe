#!/bin/bash
# Deploy Email Service to EC2 instance

set -e

# Configuration
EC2_IP=${1:-13.52.157.48}
EC2_USER=${2:-ec2-user}
SERVICE_NAME="email-service"
TARGET_DIR="/home/ec2-user/email-service"
LOCAL_DIR="$(cd "$(dirname "$0")/../../${SERVICE_NAME}" && pwd)"

echo "Deploying ${SERVICE_NAME} to ${EC2_IP}..."

# Build the project
echo "Building ${SERVICE_NAME}..."
cd "${LOCAL_DIR}"
./mvnw clean package -DskipTests

# Create .env file for service
echo "Creating .env file..."
cat > .env << EOF
IP_ADDRESS=${EC2_IP}
SERVER_PORT=8082
AWS_REGION=us-west-1
SENDER_EMAIL=admin@sloandev.net
TEMPLATE_NAME=login-notification-dev
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USERNAME=guest
RABBITMQ_PASSWORD=guest
EOF

# Copy files to EC2
echo "Copying files to EC2..."
ssh ${EC2_USER}@${EC2_IP} "mkdir -p ${TARGET_DIR}"
scp "${LOCAL_DIR}/target/${SERVICE_NAME}-0.0.1-SNAPSHOT.jar" ${EC2_USER}@${EC2_IP}:${TARGET_DIR}/${SERVICE_NAME}.jar
scp "${LOCAL_DIR}/.env" ${EC2_USER}@${EC2_IP}:${TARGET_DIR}/.env
scp "${LOCAL_DIR}/${SERVICE_NAME}.service" ${EC2_USER}@${EC2_IP}:${TARGET_DIR}/${SERVICE_NAME}.service

# Install service
echo "Installing systemd service..."
ssh ${EC2_USER}@${EC2_IP} "sudo cp ${TARGET_DIR}/${SERVICE_NAME}.service /etc/systemd/system/ && \
                          sudo chmod 644 /etc/systemd/system/${SERVICE_NAME}.service && \
                          sudo systemctl daemon-reload && \
                          sudo systemctl enable ${SERVICE_NAME}.service"

echo "${SERVICE_NAME} deployed successfully!"
echo "To start the service, run: ssh ${EC2_USER}@${EC2_IP} 'sudo systemctl start ${SERVICE_NAME}'"
echo "To check status, run: ssh ${EC2_USER}@${EC2_IP} 'sudo systemctl status ${SERVICE_NAME}'"
