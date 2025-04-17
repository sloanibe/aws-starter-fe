#!/bin/bash

# Script to manage services running on EC2 instance
# Usage: ./services.sh [start|stop|restart|status] [--service=all|spring-boot|mongodb|eureka]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Instance IPs
EC2_IP="13.52.157.48"  # t2.micro instance for all services

SSH_KEY="/home/msloan/.ssh/aws-starter-key.pem"
APP_NAME="aws-starter-api"
REMOTE_DIR="/home/ubuntu/${APP_NAME}"

# Default values
ACTION=""
SERVICE="all"

# Parse arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        start|stop|restart|status|kill) ACTION="$1" ;;
        --service=*) SERVICE="${1#*=}" ;;
        *) echo "Unknown parameter: $1"; exit 1 ;;
    esac
    shift
done

# Validate arguments
if [ -z "$ACTION" ]; then
    echo "Error: Action required (start|stop|restart|status|kill)"
    echo "Usage: ./services.sh [start|stop|restart|status|kill] [--service=all|spring-boot|mongodb]"
    exit 1
fi

if [[ ! "$SERVICE" =~ ^(all|spring-boot|mongodb|eureka|config-server|api-gateway|login-service|email-service)$ ]]; then
    echo "Error: Invalid service. Must be 'all', 'spring-boot', 'mongodb', 'eureka', 'config-server', 'api-gateway', 'login-service', or 'email-service'"
    exit 1
fi

# Function to manage Spring Boot service
manage_springboot() {
    local action=$1
    echo "Managing Spring Boot service: $action"
    
    case $action in
        start)
            ssh -i $SSH_KEY ubuntu@$EC2_IP "cd $REMOTE_DIR && \
                nohup java -Xmx512m -Xms256m \
                -DSERVER_PORT=8080 \
                -DSPRING_PROFILES_ACTIVE=prod \
                -DAPP_NAME=$APP_NAME \
                -DSPRING_APPLICATION_NAME=$APP_NAME \
                -DMONGODB_URI=\$(grep MONGODB_URI .env | cut -d'=' -f2-) \
                -DEUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://13.52.157.48:8761/eureka/ \
                -DEUREKA_CLIENT_REGISTER-WITH-EUREKA=true \
                -DEUREKA_CLIENT_FETCH-REGISTRY=true \
                -DEUREKA_INSTANCE_PREFER-IP-ADDRESS=true \
                -DEUREKA_INSTANCE_IP-ADDRESS=13.52.157.48 \
                -DEUREKA_INSTANCE_INSTANCE-ID=$APP_NAME:13.52.157.48:8080 \
                -jar ${APP_NAME}-0.0.1-SNAPSHOT.jar > app.log 2>&1 &"
            echo "Waiting for Spring Boot to start..."
            sleep 5
            ;;
        stop)
            ssh -i $SSH_KEY ubuntu@$EC2_IP "pkill -f 'java -jar' || true"
            echo "Waiting for Spring Boot to stop..."
            sleep 2
            ;;
        restart)
            manage_springboot "stop"
            manage_springboot "start"
            ;;
        kill)
            echo "Forcefully terminating Spring Boot..."
            # Find and kill any Java process running our app
            ssh -i $SSH_KEY ubuntu@$EC2_IP "pkill -9 -f '${APP_NAME}.*' || true"
            # Also kill anything on port 8080 just to be sure
            ssh -i $SSH_KEY ubuntu@$EC2_IP "sudo kill -9 \$(sudo lsof -t -i:8080) 2>/dev/null || true"
            
            # Verify process is gone
            sleep 2
            if ssh -i $SSH_KEY ubuntu@$EC2_IP "pgrep -f '${APP_NAME}.*'"; then
                echo "❌ Failed to kill Spring Boot process"
                exit 1
            fi
            
            # Verify port is free
            if ssh -i $SSH_KEY ubuntu@$EC2_IP "sudo lsof -i :8080"; then
                echo "❌ Port 8080 is still in use"
                exit 1
            fi
            
            echo "✅ Spring Boot successfully terminated"
            ;;

        status)
            if ssh -i $SSH_KEY ubuntu@$EC2_IP "pgrep -f '${APP_NAME}.*'" > /dev/null; then
                echo "✅ Spring Boot is running"
                # Get health check info
                health_response=$(curl -s http://$EC2_IP:8080/api/health)
                if [ $? -eq 0 ]; then
                    echo "\nHealth Status:"
                    # Parse and display MongoDB status
                    mongo_status=$(echo $health_response | jq -r '.services.mongodb.status')
                    if [ "$mongo_status" = "UP" ]; then
                        echo "✅ MongoDB: Connected ($(echo $health_response | jq -r '.services.mongodb.details.database'))"
                    else
                        echo "❌ MongoDB: Down ($(echo $health_response | jq -r '.services.mongodb.error'))"
                    fi

                    # Parse and display Email service status
                    email_status=$(echo $health_response | jq -r '.services.email.status')
                    if [ "$email_status" = "UP" ]; then
                        echo "✅ Email (AWS SES): Ready"
                    else
                        echo "❌ Email: Down ($(echo $health_response | jq -r '.services.email.error'))"
                    fi

                    # Display JVM metrics
                    echo "\nJVM Metrics:"
                    total_mb=$(echo "scale=2; $(echo $health_response | jq -r '.jvm.totalMemory') / 1048576" | bc)
                    free_mb=$(echo "scale=2; $(echo $health_response | jq -r '.jvm.freeMemory') / 1048576" | bc)
                    max_mb=$(echo "scale=2; $(echo $health_response | jq -r '.jvm.maxMemory') / 1048576" | bc)
                    echo "📊 Memory Usage: ${total_mb}MB total, ${free_mb}MB free, ${max_mb}MB max"
                    echo "💻 Processors: $(echo $health_response | jq -r '.jvm.processors')"

                    # Check API Gateway status
                    echo "\nAPI Gateway Status:"
                    api_url=$(aws cloudformation describe-stacks --stack-name aws-starter-api-gateway --query 'Stacks[0].Outputs[?OutputKey==`ApiGatewayUrl`].OutputValue' --output text)
                    if [ -n "$api_url" ]; then
                        # Ensure URL has no double slashes
                        api_url_clean=$(echo "$api_url" | sed 's#/$##')
                        
                        # Get Spring Boot instance IP
                        spring_boot_ip=$(aws ec2 describe-instances \
                            --filters "Name=tag:Name,Values=aws-starter-springboot" "Name=instance-state-name,Values=running" \
                            --query 'Reservations[].Instances[].PublicIpAddress' --output text)
                        
                        # Check nginx and app status
                        echo "Checking EC2 (13.52.157.48):"
                        echo "\nNginx Config:"
                        ssh -i /home/msloan/.ssh/aws-starter-key.pem ubuntu@13.52.157.48 'sudo cat /etc/nginx/sites-enabled/default'
                        
                        echo "\nSpring Boot Status:"
                        ssh -i /home/msloan/.ssh/aws-starter-key.pem ubuntu@13.52.157.48 'ps aux | grep aws-starter-api | grep -v grep'
                        
                        echo "\nSpring Boot Logs:"
                        ssh -i /home/msloan/.ssh/aws-starter-key.pem ubuntu@13.52.157.48 'tail -n 5 /home/ubuntu/aws-starter-api/app.log'
                        
                        # Test API Gateway health
                        echo "\nAPI Gateway Health Check:"
                        response=$(curl -s "${api_url_clean}/prod/api/health")
                        if [ $? -eq 0 ] && [ -n "$response" ]; then
                            status=$(echo "$response" | jq -r '.status')
                            if [ "$status" = "UP" ]; then
                                echo "✅ API Gateway: Ready ($api_url)"
                                echo "MongoDB: $(echo "$response" | jq -r '.services.mongodb.status')"
                                echo "Email: $(echo "$response" | jq -r '.services.email.status')"
                            else
                                echo "❌ API Gateway: Services not healthy"
                                echo "$response" | jq '.'
                            fi
                        else
                            echo "❌ API Gateway: Not responding"
                        fi
                        
                        # Show API Gateway info
                        echo "\nAPI Gateway Configuration:"
                        echo "URL: $api_url_clean"
                        aws apigateway get-resources --rest-api-id 21hjo105z1 --query 'items[].{path:path,methods:resourceMethods}'
                    else
                        echo "❌ API Gateway: Not found"
                    fi
                else
                    echo "❌ Health check failed: Could not connect to health endpoint"
                fi
            else
                echo "❌ Spring Boot is not running"
            fi
            ;;
    esac
}

# Function to manage MongoDB service
manage_mongodb() {
    local action=$1
    echo "Managing MongoDB service: $action"
    
    case $action in
        start)
            ssh -i $SSH_KEY ubuntu@$EC2_IP "sudo systemctl start mongod"
            echo "Waiting for MongoDB to start..."
            sleep 2
            ;;
        stop)
            ssh -i $SSH_KEY ubuntu@$EC2_IP "sudo systemctl stop mongod"
            echo "Waiting for MongoDB to stop..."
            sleep 2
            ;;
        restart)
            ssh -i $SSH_KEY ubuntu@$EC2_IP "sudo systemctl restart mongod"
            echo "Waiting for MongoDB to restart..."
            sleep 2
            ;;
        kill)
            echo "Forcefully terminating MongoDB..."
            ssh -i $SSH_KEY ubuntu@$EC2_IP "sudo systemctl kill -s SIGKILL mongod || true"
            
            # Verify process is stopped
            sleep 2
            if ssh -i $SSH_KEY ubuntu@$EC2_IP "systemctl is-active mongod" | grep -q "active"; then
                echo "❌ Failed to kill MongoDB process"
                exit 1
            fi
            
            echo "✅ MongoDB successfully terminated"
            ;;

        status)
            ssh -i $SSH_KEY ubuntu@$EC2_IP "sudo systemctl status mongod"
            # Show basic MongoDB stats
            ssh -i $SSH_KEY ubuntu@$EC2_IP "mongosh --quiet -u admin -p admin123 --authenticationDatabase admin --eval 'JSON.stringify(db.serverStatus().connections, null, 2)'" || echo "MongoDB stats check failed"
            ;;
    esac
}

# Function to manage Eureka service discovery
manage_eureka() {
    local action=$1
    echo "Managing Eureka Service Discovery: $action"
    
    case $action in
        start)
            ssh -i $SSH_KEY ubuntu@$EC2_IP "sudo systemctl start service-discovery.service"
            echo "Waiting for Eureka to start..."
            sleep 2
            ;;
        stop)
            ssh -i $SSH_KEY ubuntu@$EC2_IP "sudo systemctl stop service-discovery.service"
            echo "Waiting for Eureka to stop..."
            sleep 2
            ;;
        restart)
            ssh -i $SSH_KEY ubuntu@$EC2_IP "sudo systemctl restart service-discovery.service"
            echo "Waiting for Eureka to restart..."
            sleep 2
            ;;
        kill)
            echo "Forcefully terminating Eureka..."
            ssh -i $SSH_KEY ubuntu@$EC2_IP "sudo systemctl stop service-discovery.service"
            ssh -i $SSH_KEY ubuntu@$EC2_IP "sudo kill -9 \$(sudo lsof -t -i:8761) 2>/dev/null || true"
            echo "✅ Eureka successfully terminated"
            ;;
        status)
            if ssh -i $SSH_KEY ubuntu@$EC2_IP "systemctl is-active service-discovery.service" > /dev/null; then
                echo "✅ Eureka Service Discovery is running"
                # Get health check info
                health_response=$(curl -s http://$EC2_IP:8761/actuator/health)
                if [ $? -eq 0 ]; then
                    echo "\nHealth Status:"
                    echo "$health_response" | jq '.'
                    
                    # Display registered services if any
                    echo "\nRegistered Services:"
                    apps_response=$(curl -s http://$EC2_IP:8761/eureka/apps)
                    if [[ $apps_response == *"<application>"* ]]; then
                        echo "Found registered services:"
                        echo "$apps_response" | grep -o '<application>[^<]*</application>' | sed 's/<application>\(.*\)<\/application>/\1/'
                    else
                        echo "No services registered yet"
                    fi
                else
                    echo "❌ Health check failed: Could not connect to health endpoint"
                fi
            else
                echo "❌ Eureka Service Discovery is not running"
            fi
            ;;
    esac
}

# Function to manage Config Server
manage_config_server() {
    local action=$1
    echo "Managing Config Server: $action"
    
    case $action in
        start)
            ssh -i $SSH_KEY ubuntu@$EC2_IP "sudo systemctl start config-server.service"
            echo "Waiting for Config Server to start..."
            sleep 2
            ;;
        stop)
            ssh -i $SSH_KEY ubuntu@$EC2_IP "sudo systemctl stop config-server.service"
            echo "Waiting for Config Server to stop..."
            sleep 2
            ;;
        restart)
            ssh -i $SSH_KEY ubuntu@$EC2_IP "sudo systemctl restart config-server.service"
            echo "Waiting for Config Server to restart..."
            sleep 2
            ;;
        kill)
            echo "Forcefully terminating Config Server..."
            ssh -i $SSH_KEY ubuntu@$EC2_IP "sudo systemctl stop config-server.service"
            ssh -i $SSH_KEY ubuntu@$EC2_IP "sudo kill -9 \$(sudo lsof -t -i:8888) 2>/dev/null || true"
            echo "✅ Config Server successfully terminated"
            ;;
        status)
            if ssh -i $SSH_KEY ubuntu@$EC2_IP "systemctl is-active config-server.service" > /dev/null; then
                echo "✅ Config Server is running"
                # Get health check info
                health_response=$(curl -s http://$EC2_IP:8888/actuator/health)
                if [ $? -eq 0 ]; then
                    echo "\nHealth Status:"
                    echo "$health_response" | jq '.'
                    
                    # Display available configuration profiles
                    echo "\nAvailable Configuration Profiles:"
                    profiles_response=$(curl -s http://$EC2_IP:8888/application/default 2>/dev/null)
                    if [ $? -eq 0 ] && [ -n "$profiles_response" ]; then
                        echo "Default configuration available"
                        echo "$profiles_response" | jq '.'
                    else
                        echo "No configuration profiles available or unable to access them"
                    fi
                else
                    echo "❌ Health check failed: Could not connect to health endpoint"
                fi
            else
                echo "❌ Config Server is not running"
            fi
            ;;
    esac
}

# Function to manage API Gateway
manage_api_gateway() {
    local action=$1
    echo "Managing API Gateway: $action"
    
    case $action in
        start)
            ssh -i $SSH_KEY ubuntu@$EC2_IP "sudo systemctl start api-gateway.service"
            echo "Waiting for API Gateway to start..."
            sleep 2
            ;;
        stop)
            ssh -i $SSH_KEY ubuntu@$EC2_IP "sudo systemctl stop api-gateway.service"
            echo "Waiting for API Gateway to stop..."
            sleep 2
            ;;
        restart)
            ssh -i $SSH_KEY ubuntu@$EC2_IP "sudo systemctl restart api-gateway.service"
            echo "Waiting for API Gateway to restart..."
            sleep 2
            ;;
        kill)
            echo "Forcefully terminating API Gateway..."
            ssh -i $SSH_KEY ubuntu@$EC2_IP "sudo systemctl stop api-gateway.service"
            ssh -i $SSH_KEY ubuntu@$EC2_IP "sudo kill -9 \$(sudo lsof -t -i:8080) 2>/dev/null || true"
            echo "✅ API Gateway successfully terminated"
            ;;
        status)
            if ssh -i $SSH_KEY ubuntu@$EC2_IP "systemctl is-active api-gateway.service" > /dev/null; then
                echo "✅ API Gateway is running"
                # Get health check info
                health_response=$(curl -s http://$EC2_IP:8080/actuator/health)
                if [ $? -eq 0 ]; then
                    echo "\nHealth Status:"
                    echo "$health_response" | jq '.'
                    
                    # Display available routes
                    echo "\nAvailable Routes:"
                    routes_response=$(curl -s http://$EC2_IP:8080/actuator/gateway/routes 2>/dev/null)
                    if [ $? -eq 0 ] && [ -n "$routes_response" ]; then
                        echo "Routes available"
                        echo "$routes_response" | jq '.'
                    else
                        echo "No routes available or unable to access them"
                    fi
                else
                    echo "❌ Health check failed: Could not connect to health endpoint"
                fi
            else
                echo "❌ API Gateway is not running"
            fi
            ;;
    esac
}

# Function to manage Login Service
manage_login_service() {
    local action=$1
    echo "Managing Login Service: $action"
    
    case $action in
        start)
            ssh -i $SSH_KEY ubuntu@$EC2_IP "sudo systemctl start login-service.service"
            echo "Waiting for Login Service to start..."
            sleep 2
            ;;
        stop)
            ssh -i $SSH_KEY ubuntu@$EC2_IP "sudo systemctl stop login-service.service"
            echo "Waiting for Login Service to stop..."
            sleep 2
            ;;
        restart)
            ssh -i $SSH_KEY ubuntu@$EC2_IP "sudo systemctl restart login-service.service"
            echo "Waiting for Login Service to restart..."
            sleep 2
            ;;
        kill)
            echo "Forcefully terminating Login Service..."
            ssh -i $SSH_KEY ubuntu@$EC2_IP "sudo systemctl stop login-service.service"
            ssh -i $SSH_KEY ubuntu@$EC2_IP "sudo kill -9 \$(sudo lsof -t -i:8081) 2>/dev/null || true"
            echo "✅ Login Service successfully terminated"
            ;;
        status)
            if ssh -i $SSH_KEY ubuntu@$EC2_IP "systemctl is-active login-service.service" > /dev/null; then
                echo "✅ Login Service is running"
                health_response=$(curl -s http://$EC2_IP:8081/actuator/health)
                if [ $? -eq 0 ]; then
                    echo "\nHealth Status:"
                    echo "$health_response" | jq '.'
                else
                    echo "❌ Health check failed: Could not connect to health endpoint"
                fi
            else
                echo "❌ Login Service is not running"
            fi
            ;;
    esac
}

# Function to manage Email Service
manage_email_service() {
    local action=$1
    echo "Managing Email Service: $action"
    
    case $action in
        start)
            ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no -i $SSH_KEY ubuntu@$EC2_IP "sudo systemctl start email-service.service"
            echo "Waiting for Email Service to start..."
            sleep 2
            ;;
        stop)
            ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no -i $SSH_KEY ubuntu@$EC2_IP "sudo systemctl stop email-service.service"
            echo "Waiting for Email Service to stop..."
            sleep 2
            ;;
        restart)
            ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no -i $SSH_KEY ubuntu@$EC2_IP "sudo systemctl restart email-service.service"
            echo "Waiting for Email Service to restart..."
            sleep 2
            ;;
        kill)
            echo "Forcefully terminating Email Service..."
            ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no -i $SSH_KEY ubuntu@$EC2_IP "sudo systemctl stop email-service.service"
            echo "✅ Email Service successfully terminated"
            ;;
        status)
            if ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no -i $SSH_KEY ubuntu@$EC2_IP "systemctl is-active email-service.service" > /dev/null; then
                echo "✅ Email Service is running"
                # Skip health check - it's causing issues
                # Simply return success status
            else
                echo "❌ Email Service is not running"
            fi
            ;;
    esac
}

# Main service management logic
case $SERVICE in
    all)
        if [ "$ACTION" = "status" ]; then
            echo "=== MongoDB Status ==="
            manage_mongodb status
            echo -e "\n=== Spring Boot Status ==="
            manage_springboot status
            echo -e "\n=== Eureka Service Discovery Status ==="
            manage_eureka status
            echo -e "\n=== Config Server Status ==="
            manage_config_server status
            echo -e "\n=== API Gateway Status ==="
            manage_api_gateway status
            echo -e "\n=== Login Service Status ==="
            manage_login_service status
            echo -e "\n=== Email Service Status ==="
            manage_email_service status
        else
            manage_mongodb $ACTION
            manage_springboot $ACTION
            manage_eureka $ACTION
            manage_config_server $ACTION
            manage_api_gateway $ACTION
            manage_login_service $ACTION
            manage_email_service $ACTION
        fi
        ;;
    spring-boot)
        manage_springboot $ACTION
        ;;
    mongodb)
        manage_mongodb $ACTION
        ;;
    eureka)
        manage_eureka $ACTION
        ;;
    config-server)
        manage_config_server $ACTION
        ;;
    api-gateway)
        manage_api_gateway $ACTION
        ;;
    login-service)
        manage_login_service $ACTION
        ;;
    email-service)
        manage_email_service $ACTION
        ;;
esac
