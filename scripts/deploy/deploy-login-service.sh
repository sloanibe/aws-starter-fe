#!/bin/bash
# Deploy Login Service to EC2 instance

set -e

# Configuration
EC2_IP=${1:-13.52.157.48}
EC2_USER=${2:-ubuntu}
SERVICE_NAME="login-service"
TARGET_DIR="/home/ubuntu/login-service"
LOCAL_DIR="$(cd "$(dirname "$0")/../../${SERVICE_NAME}" && pwd)"
SSH_KEY=~/.ssh/aws-starter-key.pem

echo "Deploying ${SERVICE_NAME} to ${EC2_IP}..."

# Build the project
echo "Building ${SERVICE_NAME}..."
cd "${LOCAL_DIR}"
./mvnw clean package -DskipTests

# Source secrets
if [ -f "$HOME/.aws-starter-secrets" ]; then
  source "$HOME/.aws-starter-secrets"
else
  echo "Secrets file $HOME/.aws-starter-secrets not found! Aborting."
  exit 1
fi

# Create .env file for service
echo "Creating .env file..."
cat > .env << EOF
IP_ADDRESS=${EC2_IP}
SERVER_PORT=8081
MONGO_USERNAME=${MONGO_USERNAME}
MONGO_PASSWORD=${MONGO_PASSWORD}
SPRING_RABBITMQ_HOST=${SPRING_RABBITMQ_HOST}
SPRING_RABBITMQ_PORT=${SPRING_RABBITMQ_PORT}
SPRING_RABBITMQ_USERNAME=${SPRING_RABBITMQ_USERNAME}
SPRING_RABBITMQ_PASSWORD=${SPRING_RABBITMQ_PASSWORD}
EOF

# Copy files to EC2
echo "Copying files to EC2..."
ssh -i ~/.ssh/aws-starter-key.pem ${EC2_USER}@${EC2_IP} "mkdir -p ${TARGET_DIR}"
rsync -avz -e "ssh -i ~/.ssh/aws-starter-key.pem" "${LOCAL_DIR}/target/${SERVICE_NAME}-0.0.1-SNAPSHOT.jar" ${EC2_USER}@${EC2_IP}:${TARGET_DIR}/${SERVICE_NAME}.jar
rsync -avz -e "ssh -i ~/.ssh/aws-starter-key.pem" "${LOCAL_DIR}/.env" ${EC2_USER}@${EC2_IP}:${TARGET_DIR}/.env
rsync -avz -e "ssh -i ~/.ssh/aws-starter-key.pem" "${LOCAL_DIR}/${SERVICE_NAME}.service" ${EC2_USER}@${EC2_IP}:${TARGET_DIR}/${SERVICE_NAME}.service

# Install service
echo "Installing systemd service..."
ssh -i "$SSH_KEY" ${EC2_USER}@${EC2_IP} "sudo cp ${TARGET_DIR}/${SERVICE_NAME}.service /etc/systemd/system/ && \
                          sudo chmod 644 /etc/systemd/system/${SERVICE_NAME}.service && \
                          sudo systemctl daemon-reload && \
                          sudo systemctl enable ${SERVICE_NAME}.service"

echo "${SERVICE_NAME} deployed successfully!"
echo "To start the service, run: ssh -i \"$SSH_KEY\" ${EC2_USER}@${EC2_IP} 'sudo systemctl start ${SERVICE_NAME}'"
echo "To check status, run: ssh -i \"$SSH_KEY\" ${EC2_USER}@${EC2_IP} 'sudo systemctl status ${SERVICE_NAME}'"
