#!/bin/bash
# Deploy Login Service to EC2 instance

set -e

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

# Define variables
EC2_IP="13.52.157.48"
EC2_USER="ubuntu"
SERVICE_NAME="login-service"
LOCAL_DIR="${PROJECT_ROOT}/login-service"
TARGET_DIR="/home/ubuntu/login-service"

# First, ensure EC2 infrastructure is up-to-date
echo "🔍 Checking EC2 infrastructure..."
$PROJECT_ROOT/scripts/aws/manage-aws.sh status --service=ec2

# Call the infrastructure deployment script
echo "🚀 Deploying Login Service using infrastructure deployment script..."
cd "$PROJECT_ROOT" && ./infrastructure/scripts/deploy/deploy-login-service.sh

# Create .env file for service
echo "Creating .env file..."
cat > .env << EOF
IP_ADDRESS=${EC2_IP}
SERVER_PORT=8081
MONGO_USERNAME=admin
MONGO_PASSWORD=admin123
# RabbitMQ configuration
RABBITMQ_ENABLED=true
RABBITMQ_HOST=rabbitmq.sloandev.net
RABBITMQ_PORT=5672
RABBITMQ_USERNAME=aws-starter
RABBITMQ_PASSWORD=aws-starter-password
EOF

# Copy files to EC2
echo "Copying files to EC2..."
SSH_KEY="/home/msloan/.ssh/aws-starter-key.pem"

# Check if SSH key exists
if [ ! -f "$SSH_KEY" ]; then
  echo "SSH key not found at $SSH_KEY"
  echo "Please enter the path to your SSH key:"
  read -p "> " SSH_KEY
  if [ ! -f "$SSH_KEY" ]; then
    echo "SSH key not found. Aborting deployment."
    exit 1
  fi
fi

# Make sure key has correct permissions
chmod 600 "$SSH_KEY"

# Use the key for SSH and SCP commands
ssh -i "$SSH_KEY" ${EC2_USER}@${EC2_IP} "mkdir -p ${TARGET_DIR}"
scp -i "$SSH_KEY" "${LOCAL_DIR}/target/${SERVICE_NAME}-0.0.1-SNAPSHOT.jar" ${EC2_USER}@${EC2_IP}:${TARGET_DIR}/${SERVICE_NAME}.jar
scp -i "$SSH_KEY" "${LOCAL_DIR}/.env" ${EC2_USER}@${EC2_IP}:${TARGET_DIR}/.env
scp -i "$SSH_KEY" "${LOCAL_DIR}/${SERVICE_NAME}.service" ${EC2_USER}@${EC2_IP}:${TARGET_DIR}/${SERVICE_NAME}.service

# Install service
echo "Installing systemd service..."
ssh -i "$SSH_KEY" ${EC2_USER}@${EC2_IP} "sudo cp ${TARGET_DIR}/${SERVICE_NAME}.service /etc/systemd/system/ && \
                          sudo chmod 644 /etc/systemd/system/${SERVICE_NAME}.service && \
                          sudo systemctl daemon-reload && \
                          sudo systemctl enable ${SERVICE_NAME}.service"

echo "${SERVICE_NAME} deployed successfully!"
echo "To start the service, run: ssh -i \"$SSH_KEY\" ${EC2_USER}@${EC2_IP} 'sudo systemctl start ${SERVICE_NAME}'"
echo "To check status, run: ssh -i \"$SSH_KEY\" ${EC2_USER}@${EC2_IP} 'sudo systemctl status ${SERVICE_NAME}'"
