#!/bin/bash

# Script should be run from the project root
if [[ ! -d "aws-starter-api" ]]; then
    echo "❌ Error: Script must be run from project root directory"
    echo "Usage: ./infrastructure/scripts/deploy/deploy-backend.sh"
    exit 1
fi

# Set variables
EC2_IP="13.52.157.48"
SSH_KEY="/home/msloan/.ssh/aws-starter-key.pem"
APP_NAME="aws-starter-api"
APP_JAR="aws-starter-api/target/${APP_NAME}-0.0.1-SNAPSHOT.jar"
REMOTE_DIR="/home/ubuntu/${APP_NAME}"

# Check SSH key exists
if [[ ! -f "$SSH_KEY" ]]; then
    echo "❌ Error: SSH key not found at $SSH_KEY"
    exit 1
fi

echo "🚀 Building Spring Boot application..."
cd aws-starter-api
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
    echo "📝 Please verify this IP is allowed in the EC2 security group:"
    echo "   1. Go to AWS Console > EC2 > Security Groups"
    echo "   2. Find group: sg-04a28d3509034f21f"
    echo "   3. Edit inbound rules"
    echo "   4. Ensure port 22 (SSH) is allowed from: $CURRENT_IP/32"
    exit 1
fi

# Create remote directory if it doesn't exist
echo "📂 Setting up deployment directory..."
ssh -i $SSH_KEY ubuntu@$EC2_IP "mkdir -p $REMOTE_DIR"

# Clean up old deployment
if ssh -i $SSH_KEY ubuntu@$EC2_IP "test -f $REMOTE_DIR/${APP_NAME}-0.0.1-SNAPSHOT.jar"; then
    echo "🗑 Cleaning up old deployment..."
    ssh -i $SSH_KEY ubuntu@$EC2_IP "rm -f $REMOTE_DIR/${APP_NAME}-0.0.1-SNAPSHOT.jar $REMOTE_DIR/app.log"
fi

# Copy new JAR file to EC2
echo "💾 Copying application files to server..."
if ! scp -i $SSH_KEY $APP_JAR ubuntu@$EC2_IP:$REMOTE_DIR/; then
    echo "❌ Failed to copy JAR file to server"
    exit 1
fi

# Check if the application is already running
echo "🔍 Checking application status..."
OLD_PIDS=$(ssh -i $SSH_KEY ubuntu@$EC2_IP "ps -ef | grep ${APP_NAME} | grep -v grep | awk '{print \$2}'")

# Stop any existing processes
if [ ! -z "$OLD_PIDS" ]; then
    echo "⏸️ Stopping existing application processes..."
    for PID in $OLD_PIDS; do
        echo "   Stopping PID: $PID"
        ssh -i $SSH_KEY ubuntu@$EC2_IP "kill -15 $PID" || true
    done
    
    # Give processes time to shutdown gracefully
    sleep 3
    
    # Force kill if still running
    for PID in $OLD_PIDS; do
        if ssh -i $SSH_KEY ubuntu@$EC2_IP "ps -p $PID > /dev/null 2>&1"; then
            echo "   Force killing PID: $PID"
            ssh -i $SSH_KEY ubuntu@$EC2_IP "kill -9 $PID" || true
        fi
    done
    
    # Final verification
    sleep 2
    RUNNING_PIDS=$(ssh -i $SSH_KEY ubuntu@$EC2_IP "ps -ef | grep ${APP_NAME} | grep -v grep | awk '{print \$2}'")
    if [ ! -z "$RUNNING_PIDS" ]; then
        echo "❌ Failed to stop all existing processes: $RUNNING_PIDS"
        exit 1
    fi
fi

# Verify directory exists and has correct permissions
echo "🔍 Verifying deployment directory..."
ssh -i $SSH_KEY ubuntu@$EC2_IP "mkdir -p $REMOTE_DIR && chmod 755 $REMOTE_DIR"

# Verify Java is installed and accessible
echo "🔍 Verifying Java installation..."
JAVA_CHECK=$(ssh -i $SSH_KEY ubuntu@$EC2_IP "which java")
if [ -z "$JAVA_CHECK" ]; then
    echo "❌ Java not found. Please ensure Java is installed."
    exit 1
fi

# Start the application with environment variables
echo "▶️ Starting the application..."
ssh -i $SSH_KEY ubuntu@$EC2_IP "cd $REMOTE_DIR && \
    # Start the application with environment variables
    JAVA_HOME=\$(dirname \$(dirname \$(readlink -f \$(which java)))) \
    nohup java -Xmx512m -Xms256m \
        -DSERVER_PORT=8080 \
        -DSPRING_PROFILES_ACTIVE=prod \
        -DAPP_NAME=aws-starter-api \
        -DMONGODB_URI=\$(grep MONGODB_URI .env | cut -d'=' -f2-) \
        -jar ${APP_NAME}-0.0.1-SNAPSHOT.jar > app.log 2>&1 &"

# Wait for startup and get new PID
sleep 5
NEW_PID=$(ssh -i $SSH_KEY ubuntu@$EC2_IP "ps -ef | grep ${APP_NAME} | grep -v grep | awk '{print \$2}'")

if [ -z "$NEW_PID" ]; then
    echo "❌ Application failed to start. Check logs for details:"
    ssh -i $SSH_KEY ubuntu@$EC2_IP "tail -n 20 $REMOTE_DIR/app.log"
    exit 1
fi

# Monitor application startup
echo "🔍 Monitoring deployment status..."

# Clear the log file
ssh -i $SSH_KEY ubuntu@$EC2_IP "truncate -s 0 $REMOTE_DIR/app.log"

# Initialize variables
MAX_WAIT_TIME=120
START_TIME=$(date +%s)

echo "⏳ Waiting up to ${MAX_WAIT_TIME} seconds for startup..."

# Function to check application status
check_status() {
    local log_content=$1
    local marker=$2
    local message=$3
    
    if echo "$log_content" | grep -q "$marker" && ! echo "$STATUS_SHOWN" | grep -q "$marker"; then
        echo "$message"
        STATUS_SHOWN="$STATUS_SHOWN $marker"
    fi
}

# Monitor startup
while true; do
    CURRENT_TIME=$(date +%s)
    ELAPSED_TIME=$((CURRENT_TIME - START_TIME))
    
    if [ $ELAPSED_TIME -gt $MAX_WAIT_TIME ]; then
        echo "❌ Startup timed out after ${MAX_WAIT_TIME} seconds"
        echo "📋 Last 20 lines of log:"
        ssh -i $SSH_KEY ubuntu@$EC2_IP "tail -n 20 $REMOTE_DIR/app.log"
        ssh -i $SSH_KEY ubuntu@$EC2_IP "kill -9 $NEW_PID 2>/dev/null || true"
        exit 1
    fi
    
    LOG_CONTENT=$(ssh -i $SSH_KEY ubuntu@$EC2_IP "tail -n 50 $REMOTE_DIR/app.log 2>/dev/null")
    
    check_status "$LOG_CONTENT" "Starting AwsStarterApiApplication" "📡 Application starting..."
    check_status "$LOG_CONTENT" "Bootstrapping Spring Data MongoDB" "📚 Initializing MongoDB repositories..."
    check_status "$LOG_CONTENT" "Tomcat initialized" "🌐 Tomcat server initializing..."
    check_status "$LOG_CONTENT" "Successfully connected to server" "🔌 MongoDB connection established"
    
    if echo "$LOG_CONTENT" | grep -q "Started AwsStarterApiApplication"; then
        echo "✨ Application startup completed!"
        
        # Verify health
        echo "🔍 Verifying application health..."
        for i in {1..6}; do
            if curl -s http://$EC2_IP:8080/actuator/health 2>&1 | grep -q '"status":"UP"'; then
                echo "✅ Application is healthy and ready to serve requests!"
                exit 0
            fi
            sleep 5
        done
        
        echo "❌ Health check failed"
        ssh -i $SSH_KEY ubuntu@$EC2_IP "kill -9 $NEW_PID 2>/dev/null || true"
        exit 1
    fi
    
    sleep 2
done
                -jar ${APP_NAME}-0.0.1-SNAPSHOT.jar > app.log 2>&1 &
        "
        echo "❌ Deployment failed. Rolled back to previous version. Check logs:"
        ssh -i $SSH_KEY ubuntu@$EC2_IP "tail -n 20 $REMOTE_DIR/app.log"
        exit 1
    fi
    echo "   Waiting for application to start (attempt $RETRY/$MAX_RETRIES)..."
    sleep 5
done

echo "✅ Deployment completed successfully!"
echo "📖 View logs with: ssh -i $SSH_KEY ubuntu@$EC2_IP 'tail -f $REMOTE_DIR/app.log'"
echo "🌐 API Gateway endpoint: https://api.sloandev.net"
