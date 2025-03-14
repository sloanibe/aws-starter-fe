#!/bin/bash

# Set variables
EC2_IP="13.52.157.48"
SSH_KEY="/home/msloan/.ssh/aws-starter-key.pem"
APP_JAR="target/aws-starter-api-0.0.1-SNAPSHOT.jar"
REMOTE_DIR="/home/ubuntu/aws-starter-api"

# Build the application
echo "Building Spring Boot application..."
./mvnw clean package -DskipTests

# Check if build was successful
if [ $? -ne 0 ]; then
    echo "Build failed. Exiting."
    exit 1
fi

echo "Build successful. Deploying to EC2 instance at $EC2_IP..."

# Create remote directory if it doesn't exist
ssh -i $SSH_KEY ubuntu@$EC2_IP "mkdir -p $REMOTE_DIR"

# Copy JAR file to EC2
scp -i $SSH_KEY $APP_JAR ubuntu@$EC2_IP:$REMOTE_DIR/

# Check if the application is already running
ssh -i $SSH_KEY ubuntu@$EC2_IP "ps -ef | grep aws-starter-api | grep -v grep || echo 'Not running'" > /tmp/app_status

# Kill the existing process if it's running
if ! grep -q "Not running" /tmp/app_status; then
  echo "Stopping existing application..."
  ssh -i $SSH_KEY ubuntu@$EC2_IP "ps -ef | grep aws-starter-api | grep -v grep | awk '{print \$2}' | xargs kill -9 || echo 'No process to kill'"
  sleep 2
fi

# Start the application
echo "Starting the application..."
ssh -i $SSH_KEY ubuntu@$EC2_IP "cd $REMOTE_DIR && nohup java -jar aws-starter-api-0.0.1-SNAPSHOT.jar > app.log 2>&1 &"

echo "Deployment completed. The application should be starting now."
echo "You can check the logs with: ssh -i $SSH_KEY ubuntu@$EC2_IP 'tail -f $REMOTE_DIR/app.log'"
