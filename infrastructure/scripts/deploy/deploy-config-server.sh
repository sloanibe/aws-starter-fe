#!/bin/bash

# Script should be run from the project root
if [[ ! -d "config-server-service" ]]; then
    echo "❌ Error: Script must be run from project root directory"
    echo "Usage: ./infrastructure/scripts/deploy/deploy-config-server.sh"
    exit 1
fi

# Set variables
EC2_IP="13.52.157.48"  # Same EC2 instance as Eureka
SSH_KEY="/home/msloan/.ssh/aws-starter-key.pem"
APP_NAME="config-server-service"
APP_JAR="config-server-service/target/${APP_NAME}-0.0.1-SNAPSHOT.jar"
REMOTE_DIR="/home/ubuntu/${APP_NAME}"

# Check SSH key exists
if [[ ! -f "$SSH_KEY" ]]; then
    echo "❌ Error: SSH key not found at $SSH_KEY"
    exit 1
fi

# Set GitHub credentials from access token file
GITHUB_TOKEN_FILE="$HOME/.github-access-token"

if [[ ! -f "$GITHUB_TOKEN_FILE" ]]; then
    echo "❌ Error: GitHub access token file not found at $GITHUB_TOKEN_FILE"
    exit 1
fi

# Read GitHub username and token from file
GITHUB_TOKEN=$(cat "$GITHUB_TOKEN_FILE" | tr -d '\r\n')

# Set configuration variables
CONFIG_GIT_URI=${CONFIG_GIT_URI:-"https://github.com/sloanibe/aws-starter-fe"}
CONFIG_GIT_USERNAME=${CONFIG_GIT_USERNAME:-"sloanibe"}
CONFIG_GIT_PASSWORD=${CONFIG_GIT_PASSWORD:-"$GITHUB_TOKEN"}

echo "🔐 Using GitHub credentials for $CONFIG_GIT_URI"

echo "🚀 Building Config Server application..."
cd config-server-service
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
    ssh -i $SSH_KEY ubuntu@$EC2_IP "rm -f $REMOTE_DIR/${APP_NAME}-0.0.1-SNAPSHOT.jar $REMOTE_DIR/config-server.log"
fi

# Copy new JAR file to EC2
echo "💾 Copying application files to server..."
if ! scp -i $SSH_KEY $APP_JAR ubuntu@$EC2_IP:$REMOTE_DIR/; then
    echo "❌ Failed to copy JAR file to server"
    exit 1
fi

# Create .env file with GitHub credentials
echo "🔐 Creating secure environment file..."
cat << EOF > /tmp/config-server.env
CONFIG_GIT_URI=${CONFIG_GIT_URI}
CONFIG_GIT_USERNAME=${CONFIG_GIT_USERNAME}
CONFIG_GIT_PASSWORD=${CONFIG_GIT_PASSWORD}
EOF

# Copy .env file to EC2 with secure permissions
echo "📄 Copying environment file..."
if ! scp -i $SSH_KEY /tmp/config-server.env ubuntu@$EC2_IP:/tmp/; then
    echo "❌ Failed to copy environment file to server"
    exit 1
fi

# Secure the environment file on the server
ssh -i $SSH_KEY ubuntu@$EC2_IP "mv /tmp/config-server.env $REMOTE_DIR/.env && chmod 600 $REMOTE_DIR/.env"

# Remove local temp file
rm /tmp/config-server.env

# Copy systemd service file
echo "📄 Copying systemd service file..."
if ! scp -i $SSH_KEY config-server-service/config-server.service ubuntu@$EC2_IP:/tmp/; then
    echo "❌ Failed to copy service file to server"
    exit 1
fi



# Install systemd service
echo "🔧 Installing systemd service..."
ssh -i $SSH_KEY ubuntu@$EC2_IP "sudo mv /tmp/config-server.service /etc/systemd/system/ && sudo systemctl daemon-reload"

# Check if the application is already running
echo "🔍 Checking application status..."
if ssh -i $SSH_KEY ubuntu@$EC2_IP "systemctl is-active config-server.service"; then
    echo "⏸️ Stopping existing service..."
    ssh -i $SSH_KEY ubuntu@$EC2_IP "sudo systemctl stop config-server.service"
fi

# Start the service
echo "▶️ Starting the service..."
ssh -i $SSH_KEY ubuntu@$EC2_IP "sudo systemctl start config-server.service"

# Enable service to start on boot
echo "🔄 Enabling service to start on boot..."
ssh -i $SSH_KEY ubuntu@$EC2_IP "sudo systemctl enable config-server.service"

# Wait for startup
echo "⏳ Waiting for Config Server to start..."
sleep 10

# Check service status
echo "🔍 Checking service status..."
ssh -i $SSH_KEY ubuntu@$EC2_IP "systemctl status config-server.service"

# Verify Config Server is running
echo "🔍 Verifying Config Server is running..."
for i in {1..6}; do
    if curl -s http://$EC2_IP:8888/actuator/health 2>&1 | grep -q '"status":"UP"'; then
        echo "✅ Config Server is healthy and ready to serve requests!"
        echo "📊 Config Server is available at: http://$EC2_IP:8888/"
        exit 0
    fi
    sleep 5
done

echo "❌ Health check failed"
echo "📋 Checking logs for errors:"
ssh -i $SSH_KEY ubuntu@$EC2_IP "tail -n 20 $REMOTE_DIR/config-server.log"
exit 1
