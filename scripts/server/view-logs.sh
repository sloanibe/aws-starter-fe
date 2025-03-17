#!/bin/bash

# Script to view logs from various services
# Usage: ./view-logs.sh [--service spring-boot|mongodb] [--tail|-t N] [--follow|-f] [--error|-e] [--health|-h]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
INFRA_SCRIPTS="$PROJECT_ROOT/infrastructure/scripts"

# Default values
SERVICE="spring-boot"
TAIL=50
FOLLOW=false
CHECK_HEALTH=false
ERROR_ONLY=false
EC2_IP="13.52.157.48"
SSH_KEY="/home/msloan/.ssh/aws-starter-key.pem"

# Parse arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --service=*) SERVICE="${1#*=}" ;;
        --tail=*|-t=*) TAIL="${1#*=}" ;;
        --tail|-t) TAIL="$2"; shift ;;
        --follow|-f) FOLLOW=true ;;
        --error|-e) ERROR_ONLY=true ;;
        --health|-h) CHECK_HEALTH=true ;;
        *) echo "Unknown parameter: $1"; exit 1 ;;
    esac
    shift
done

# Validate service
if [[ ! "$SERVICE" =~ ^(spring-boot|mongodb)$ ]]; then
    echo "Error: Invalid service. Must be 'spring-boot' or 'mongodb'"
    exit 1
fi

# Function to view Spring Boot logs
view_springboot_logs() {
    local log_file="/home/ubuntu/aws-starter-api/app.log"
    local cmd="tail"
    
    if [ "$ERROR_ONLY" = true ]; then
        echo "Showing Spring Boot errors..."
        if [ "$FOLLOW" = true ]; then
            ssh -i $SSH_KEY ubuntu@$EC2_IP "$cmd -f -n $TAIL $log_file | grep -i 'error\|exception\|failed'"
        else
            ssh -i $SSH_KEY ubuntu@$EC2_IP "$cmd -n $TAIL $log_file | grep -i 'error\|exception\|failed'"
        fi
    else
        echo "Showing Spring Boot logs..."
        if [ "$FOLLOW" = true ]; then
            ssh -i $SSH_KEY ubuntu@$EC2_IP "$cmd -f -n $TAIL $log_file"
        else
            ssh -i $SSH_KEY ubuntu@$EC2_IP "$cmd -n $TAIL $log_file"
        fi
    fi
}

# Function to view MongoDB logs
view_mongodb_logs() {
    local log_file="/var/log/mongodb/mongod.log"
    local cmd="sudo tail"
    
    if [ "$ERROR_ONLY" = true ]; then
        echo "Showing MongoDB errors..."
        if [ "$FOLLOW" = true ]; then
            ssh -i $SSH_KEY ubuntu@$EC2_IP "$cmd -f -n $TAIL $log_file | grep -i 'error\|exception\|failed\|E  \|F  '"
        else
            ssh -i $SSH_KEY ubuntu@$EC2_IP "$cmd -n $TAIL $log_file | grep -i 'error\|exception\|failed\|E  \|F  '"
        fi
    else
        echo "Showing MongoDB logs..."
        if [ "$FOLLOW" = true ]; then
            ssh -i $SSH_KEY ubuntu@$EC2_IP "$cmd -f -n $TAIL $log_file"
        else
            ssh -i $SSH_KEY ubuntu@$EC2_IP "$cmd -n $TAIL $log_file"
        fi
    fi
}

# Check health if requested
if [ "$CHECK_HEALTH" = true ]; then
    echo "Checking server health..."
    ./services.sh status --service=$SERVICE
    exit 0
fi

# View logs based on service
case $SERVICE in
    spring-boot)
        view_springboot_logs
        ;;
    mongodb)
        view_mongodb_logs
        ;;
esac
