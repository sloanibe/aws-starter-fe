#!/bin/bash

# Load environment variables
if [ -f .env ]; then
    echo "📁 Loading environment variables..."
    source .env
else
    echo "❌ .env file not found. Please create one from .env.template"
    exit 1
fi

# Configuration
EC2_HOST="${EC2_HOST:-44.234.191.56}"
KEY_PATH="${KEY_PATH:-$HOME/spring-boot-key.pem}"
APP_NAME="${APP_NAME:-aws-starter-api}"
REMOTE_APP_PATH="/home/ec2-user/app.jar"
ENV_PATH="/home/ec2-user/.env"
LOG_PATH="/home/ec2-user/app.log"

echo "🚀 Starting deployment..."

# Build the application
echo "📦 Building application..."
./mvnw clean package -DskipTests

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

# Create remote environment file
echo "🔒 Setting up environment variables on EC2..."
ssh -i $KEY_PATH "ec2-user@$EC2_HOST" "cat > $ENV_PATH << 'EOL'
# MongoDB Configuration
export MONGODB_USER=$MONGODB_USER
export MONGODB_PASSWORD=$MONGODB_PASSWORD
export MONGODB_DATABASE=$MONGODB_DATABASE
export MONGODB_HOST=$MONGODB_HOST
export MONGODB_PORT=$MONGODB_PORT
export MONGODB_AUTH_DATABASE=$MONGODB_AUTH_DATABASE

# Server Configuration
export SERVER_PORT=$SERVER_PORT
export SPRING_PROFILES_ACTIVE=$SPRING_PROFILES_ACTIVE
export JAVA_OPTS='$JAVA_OPTS'
export SPRING_LOG_LEVEL=$SPRING_LOG_LEVEL
export SERVER_COMPRESSION_ENABLED=$SERVER_COMPRESSION_ENABLED
export SERVER_TOMCAT_MAX_THREADS=$SERVER_TOMCAT_MAX_THREADS
export SERVER_TOMCAT_MIN_SPARE_THREADS=$SERVER_TOMCAT_MIN_SPARE_THREADS

# Security Configuration
export JWT_SECRET=$JWT_SECRET
export JWT_EXPIRATION_MS=$JWT_EXPIRATION_MS

# Actuator Configuration
export MANAGEMENT_ENDPOINTS_WEB_EXPOSURE=$MANAGEMENT_ENDPOINTS_WEB_EXPOSURE
export MANAGEMENT_ENDPOINT_HEALTH_SHOW_DETAILS=$MANAGEMENT_ENDPOINT_HEALTH_SHOW_DETAILS

# Application Configuration
export APP_CORS_ALLOWED_ORIGINS=$APP_CORS_ALLOWED_ORIGINS
export APP_API_VERSION=$APP_API_VERSION
export APP_RATE_LIMIT_ENABLED=$APP_RATE_LIMIT_ENABLED
export APP_RATE_LIMIT_REQUESTS_PER_SECOND=$APP_RATE_LIMIT_REQUESTS_PER_SECOND
EOL"

if [ $? -ne 0 ]; then
    echo "❌ Failed to set up environment variables"
    exit 1
fi

# Verify environment variables
echo "🔍 Verifying environment variables on EC2..."
ssh -i $KEY_PATH "ec2-user@$EC2_HOST" "source $ENV_PATH && {
    echo '✓ MongoDB Configuration:';
    echo \"  - MONGODB_USER=\${MONGODB_USER}\";
    echo \"  - MONGODB_DATABASE=\${MONGODB_DATABASE}\";
    echo \"  - MONGODB_HOST=\${MONGODB_HOST}\";
    echo \"  - MONGODB_PORT=\${MONGODB_PORT}\";
    echo '✓ Server Configuration:';
    echo \"  - SERVER_PORT=\${SERVER_PORT}\";
    echo \"  - SPRING_PROFILES_ACTIVE=\${SPRING_PROFILES_ACTIVE}\";
    echo \"  - JAVA_OPTS=\${JAVA_OPTS}\";
    echo '✓ Application Configuration:';
    echo \"  - APP_NAME=\${APP_NAME}\";
    echo \"  - APP_API_VERSION=\${APP_API_VERSION}\";
    echo \"  - APP_RATE_LIMIT_ENABLED=\${APP_RATE_LIMIT_ENABLED}\";
    echo '✓ Sensitive variables present:';
    echo \"  - MONGODB_PASSWORD: \${MONGODB_PASSWORD:+✓}\";
    echo \"  - JWT_SECRET: \${JWT_SECRET:+✓}\";
}"

if [ $? -ne 0 ]; then
    echo "❌ Failed to verify environment variables"
    exit 1
fi

# Copy the jar file to EC2
echo "📤 Copying JAR to EC2..."
scp -i $KEY_PATH "target/$APP_NAME-0.0.1-SNAPSHOT.jar" "ec2-user@$EC2_HOST:$REMOTE_APP_PATH"

if [ $? -ne 0 ]; then
    echo "❌ Failed to copy JAR to EC2"
    exit 1
fi

# Restart the application on EC2
echo "🔄 Restarting application..."
ssh -i $KEY_PATH "ec2-user@$EC2_HOST" "
    # Create log file if it doesn't exist
    touch $LOG_PATH
    chmod 644 $LOG_PATH

    # Stop any existing Java processes
    echo 'Stopping existing Java processes...'
    pkill -f 'java -jar' || true
    sleep 5

    # Make sure port 8080 is free
    if netstat -tln | grep ':8080 '; then
        echo 'Force killing process on port 8080...'
        sudo fuser -k 8080/tcp || true
        sleep 2
    fi

    # Start application with proper logging
    echo 'Starting application...'
    source $ENV_PATH
    cd /home/ec2-user
    nohup java \$JAVA_OPTS -jar $REMOTE_APP_PATH > $LOG_PATH 2>&1 &

    # Wait for application to start and show logs
    echo 'Waiting for application to start...'
    sleep 20
    
    # Check if application is running and show logs
    if pgrep -f 'java -jar.*app\.jar' > /dev/null; then
        echo 'Application started successfully. Last 50 lines of log:'
        tail -n 50 $LOG_PATH
        
        # Monitor logs for any SSL/MongoDB errors
        echo -e '\nMonitoring logs for SSL/MongoDB errors...'
        grep -i 'ssl\|mongo\|error\|exception' $LOG_PATH || true
    else
        echo 'Failed to start application. Full log:'
        cat $LOG_PATH
        exit 1
    fi"

if [ $? -ne 0 ]; then
    echo "❌ Failed to restart application"
    exit 1
fi

echo "✅ Deployment completed successfully!"
echo "📝 Logs are available on EC2 at $LOG_PATH"
echo "🌐 Application should be accessible at http://$EC2_HOST:$SERVER_PORT"
echo "🔍 Health check endpoint: http://$EC2_HOST:$SERVER_PORT/actuator/health"
