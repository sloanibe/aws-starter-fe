#!/bin/bash
# Deploy Email Service to EC2 instance

set -e

# Configuration
EC2_IP=${1:-13.52.157.48}
EC2_USER=${2:-ubuntu}
SERVICE_NAME="email-service"
TARGET_DIR="/home/ubuntu/email-service"
LOCAL_DIR="$(cd "$(dirname "$0")/../../${SERVICE_NAME}" && pwd)"

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
SERVER_PORT=8082
AWS_REGION=us-west-1
SENDER_EMAIL=${SENDER_EMAIL}
TEMPLATE_NAME=login-notification-dev
SPRING_RABBITMQ_HOST=${SPRING_RABBITMQ_HOST}
SPRING_RABBITMQ_PORT=${SPRING_RABBITMQ_PORT}
SPRING_RABBITMQ_USERNAME=${SPRING_RABBITMQ_USERNAME}
SPRING_RABBITMQ_PASSWORD=${SPRING_RABBITMQ_PASSWORD}
EOF

# Copy files to EC2
echo "Copying files to EC2..."
ssh -i ~/.ssh/aws-starter-key.pem ${EC2_USER}@${EC2_IP} "mkdir -p ${TARGET_DIR}"
scp -i ~/.ssh/aws-starter-key.pem "${LOCAL_DIR}/target/${SERVICE_NAME}-0.0.1-SNAPSHOT.jar" ${EC2_USER}@${EC2_IP}:${TARGET_DIR}/${SERVICE_NAME}.jar
scp -i ~/.ssh/aws-starter-key.pem "${LOCAL_DIR}/.env" ${EC2_USER}@${EC2_IP}:${TARGET_DIR}/.env
scp -i ~/.ssh/aws-starter-key.pem "${LOCAL_DIR}/${SERVICE_NAME}.service" ${EC2_USER}@${EC2_IP}:${TARGET_DIR}/${SERVICE_NAME}.service

# Install and restart service
echo "Installing and restarting systemd service..."
ssh -i ~/.ssh/aws-starter-key.pem ${EC2_USER}@${EC2_IP} "sudo cp ${TARGET_DIR}/${SERVICE_NAME}.service /etc/systemd/system/ && \
                          sudo chmod 644 /etc/systemd/system/${SERVICE_NAME}.service && \
                          sudo systemctl daemon-reload && \
                          sudo systemctl enable ${SERVICE_NAME}.service && \
                          sudo systemctl restart ${SERVICE_NAME}.service"

# Health check
echo "Checking service health..."
for i in {1..6}; do
    if ssh -i ~/.ssh/aws-starter-key.pem ${EC2_USER}@${EC2_IP} "curl -s http://localhost:8082/actuator/health 2>/dev/null | grep -q '"status":"UP"'"; then
        echo "✅ Email Service is healthy and ready!"
        echo "📊 Email Service is available at: http://${EC2_IP}:8082/"
        exit 0
    else
        echo "Waiting for Email Service to become healthy... ($i/6)"
        sleep 5
    fi
done
echo "❌ Email Service failed to become healthy after deployment."
exit 1
