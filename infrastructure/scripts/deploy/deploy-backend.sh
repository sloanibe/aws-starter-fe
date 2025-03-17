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

# Create backup directory for this deployment
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="$REMOTE_DIR/backups/$TIMESTAMP"

echo "📂 Creating backup directory..."
ssh -i $SSH_KEY ubuntu@$EC2_IP "mkdir -p $BACKUP_DIR"

# Backup current deployment
if ssh -i $SSH_KEY ubuntu@$EC2_IP "test -f $REMOTE_DIR/${APP_NAME}-0.0.1-SNAPSHOT.jar"; then
    echo "📁 Backing up current deployment..."
    ssh -i $SSH_KEY ubuntu@$EC2_IP "
        cp $REMOTE_DIR/${APP_NAME}-0.0.1-SNAPSHOT.jar $BACKUP_DIR/ 2>/dev/null || true
        cp $REMOTE_DIR/.env $BACKUP_DIR/ 2>/dev/null || true
        cp $REMOTE_DIR/app.log $BACKUP_DIR/ 2>/dev/null || true
    "
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

# Start the application with environment variables
echo "▶️ Starting the application..."
ssh -i $SSH_KEY ubuntu@$EC2_IP "cd $REMOTE_DIR && \
    # Start the application with environment variables
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

# Start monitoring the log file for startup progress
echo "🔍 Starting deployment status monitor..."

# Clear the log file to ensure clean monitoring
ssh -i $SSH_KEY ubuntu@$EC2_IP "truncate -s 0 $REMOTE_DIR/app.log"

# Monitor the log file in real-time with a timeout
timeout 60 ssh -i $SSH_KEY ubuntu@$EC2_IP "tail -f $REMOTE_DIR/app.log" | {
    while IFS= read -r line; do
        if [[ $line == *"Starting AwsStarterApiApplication"* ]]; then
            echo "📡 Application starting..."
        elif [[ $line == *"Bootstrapping Spring Data MongoDB"* ]]; then
            echo "📚 Initializing MongoDB repositories..."
        elif [[ $line == *"Tomcat initialized"* ]]; then
            echo "🌐 Tomcat server initializing..."
        elif [[ $line == *"Successfully connected to server"* ]] || [[ $line == *"Monitor thread successfully connected"* ]]; then
            echo "🔌 MongoDB connection established"
        elif [[ $line == *"Started AwsStarterApiApplication"* ]]; then
            echo "✨ Application startup completed!"
            pkill -P $$ tail
            exit 0
        fi
    done
    echo "⚠️ Startup monitoring timed out after 60 seconds"
    exit 1
}
        fi
    done
} &

# Wait for application to start
echo "Waiting for application to start..."
MAX_RETRIES=24
RETRY=0
APP_STARTED=false

while [ $RETRY -lt $MAX_RETRIES ]; do
    if ssh -i $SSH_KEY ubuntu@$EC2_IP "grep 'Started AwsStarterApiApplication' $REMOTE_DIR/app.log 2>/dev/null"; then
        APP_STARTED=true
        break
    fi
    
    RETRY=$((RETRY+1))
    sleep 5
done

if [ "$APP_STARTED" = true ]; then
    echo "🔍 Verifying application health..."
    MAX_HEALTH_RETRIES=6
    HEALTH_RETRY=0
    
    while [ $HEALTH_RETRY -lt $MAX_HEALTH_RETRIES ]; do
        if curl -s http://$EC2_IP:8080/actuator/health 2>&1 | grep -q '"status":"UP"'; then
            echo "✅ Application is healthy and ready to serve requests!"
            break
        fi
        HEALTH_RETRY=$((HEALTH_RETRY+1))
        if [ $HEALTH_RETRY -eq $MAX_HEALTH_RETRIES ]; then
        echo "❌ Application failed to start. Rolling back to previous version..."
        ssh -i $SSH_KEY ubuntu@$EC2_IP "
            kill -9 $NEW_PID 2>/dev/null || true
            cp $BACKUP_DIR/${APP_NAME}-0.0.1-SNAPSHOT.jar $REMOTE_DIR/ 2>/dev/null || true
            cp $BACKUP_DIR/.env $REMOTE_DIR/ 2>/dev/null || true
            cd $REMOTE_DIR && \
            nohup java -Xmx512m -Xms256m \
                -DSERVER_PORT=8080 \
                -DSPRING_PROFILES_ACTIVE=prod \
                -DAPP_NAME=aws-starter-api \
                -DMONGODB_URI=\$(grep MONGODB_URI .env | cut -d'=' -f2-) \
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
