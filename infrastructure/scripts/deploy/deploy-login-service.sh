#!/bin/bash

# Script should be run from the project root
if [[ ! -d "login-service" ]]; then
    echo "❌ Error: Script must be run from project root directory"
    echo "Usage: ./infrastructure/scripts/deploy/deploy-login-service.sh"
    exit 1
fi

# Set variables
EC2_IP="13.52.157.48"  # t2.small instance
SSH_KEY="/home/msloan/.ssh/aws-starter-key.pem"
APP_NAME="login-service"
APP_JAR="login-service/target/${APP_NAME}-0.0.1-SNAPSHOT.jar"
REMOTE_DIR="/home/ubuntu/${APP_NAME}"
EC2_USER="ubuntu"

# Check SSH key exists
if [[ ! -f "$SSH_KEY" ]]; then
    echo "❌ Error: SSH key not found at $SSH_KEY"
    # Try to find the key in the .ssh directory
    POSSIBLE_KEYS=(/home/msloan/.ssh/*.pem)
    if [[ ${#POSSIBLE_KEYS[@]} -gt 0 ]]; then
        echo "🔑 Found possible SSH keys:"
        for key in "${POSSIBLE_KEYS[@]}"; do
            echo "   - $key"
        done
        echo "Please specify the correct key path when running this script."
    fi
    exit 1
fi

echo "🚀 Building Login Service application..."
cd login-service
./mvnw clean package -DskipTests
cd ..

# Check if build was successful
if [ $? -ne 0 ]; then
    echo "❌ Build failed. Exiting."
    exit 1
fi

echo "📦 Creating environment file..."
cat > login-service/.env << EOF
IP_ADDRESS=${EC2_IP}
SERVER_PORT=8081
MONGO_USERNAME=admin
MONGO_PASSWORD=admin123
# RabbitMQ is disabled by default until it's set up
RABBITMQ_ENABLED=false
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USERNAME=guest
RABBITMQ_PASSWORD=guest
EOF

echo "📤 Deploying to EC2 instance at ${EC2_IP}..."

# Ensure SSH key has correct permissions
chmod 600 "$SSH_KEY"

# Create remote directory if it doesn't exist
ssh -i "$SSH_KEY" ${EC2_USER}@${EC2_IP} "mkdir -p ${REMOTE_DIR}"

# Copy JAR file and environment file
echo "🔄 Copying application files..."
scp -i "$SSH_KEY" "$APP_JAR" ${EC2_USER}@${EC2_IP}:${REMOTE_DIR}/${APP_NAME}.jar
scp -i "$SSH_KEY" "login-service/.env" ${EC2_USER}@${EC2_IP}:${REMOTE_DIR}/.env
scp -i "$SSH_KEY" "login-service/${APP_NAME}.service" ${EC2_USER}@${EC2_IP}:${REMOTE_DIR}/${APP_NAME}.service

# Install and configure systemd service
echo "⚙️ Configuring systemd service..."
ssh -i "$SSH_KEY" ${EC2_USER}@${EC2_IP} "sudo cp ${REMOTE_DIR}/${APP_NAME}.service /etc/systemd/system/ && \
                                         sudo chmod 644 /etc/systemd/system/${APP_NAME}.service && \
                                         sudo systemctl daemon-reload && \
                                         sudo systemctl enable ${APP_NAME} && \
                                         sudo systemctl restart ${APP_NAME}"

# Wait for service to start
echo "⏳ Waiting for Login Service to start..."
sleep 10

# Check if service is running
echo "🔍 Checking service status..."
ssh -i "$SSH_KEY" ${EC2_USER}@${EC2_IP} "sudo systemctl status ${APP_NAME}"

# Check if service is healthy
echo "🏥 Checking service health..."
for i in {1..6}; do
    if ssh -i "$SSH_KEY" ${EC2_USER}@${EC2_IP} "curl -s http://localhost:8081/actuator/health 2>&1" | grep -q '"status":"UP"'; then
        echo "✅ Login Service is healthy and ready to serve requests!"
        echo "📊 Login Service is available at: http://${EC2_IP}:8081/"
        exit 0
    fi
    echo "⏳ Waiting for service to become healthy... (attempt $i/6)"
    sleep 10
done

echo "⚠️ Warning: Could not confirm Login Service health within timeout period."
echo "📋 Please check logs on the server using:"
echo "   ssh -i \"$SSH_KEY\" ${EC2_USER}@${EC2_IP} \"sudo journalctl -u ${APP_NAME} -f\""
exit 1
