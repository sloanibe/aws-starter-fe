#!/bin/bash

# Script to manage EC2 instances
# Usage: ./ec2-instances.sh [start|stop|status] [--instance=all|combined|springboot|mongodb]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Instance IDs
COMBINED_INSTANCE_ID="i-00c601082fcb6bec1"
SPRINGBOOT_INSTANCE_ID="i-0511968cdefa2a66b"
MONGODB_INSTANCE_ID="i-01e834b9543995678"

# Default values
ACTION=""
INSTANCE="all"

# Parse arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        start|stop|status) ACTION="$1" ;;
        --instance=*) INSTANCE="${1#*=}" ;;
        *) echo "Unknown parameter: $1"; exit 1 ;;
    esac
    shift
done

# Validate arguments
if [ -z "$ACTION" ]; then
    echo "Error: Action required (start|stop|status)"
    echo "Usage: ./ec2-instances.sh [start|stop|status] [--instance=all|combined|springboot|mongodb]"
    exit 1
fi

if [[ ! "$INSTANCE" =~ ^(all|combined|springboot|mongodb)$ ]]; then
    echo "Error: Invalid instance. Must be 'all', 'combined', 'springboot', or 'mongodb'"
    exit 1
fi

# Function to manage a single EC2 instance
manage_instance() {
    local instance_id=$1
    local instance_name=$2
    local action=$3

    echo "Managing $instance_name instance ($instance_id): $action"

    case $action in
        start)
            echo "Starting $instance_name instance..."
            aws ec2 start-instances --instance-ids $instance_id

            echo "Waiting for instance to be running..."
            aws ec2 wait instance-running --instance-ids $instance_id

            # Get the public IP address
            local public_ip=$(aws ec2 describe-instances --instance-ids $instance_id --query 'Reservations[0].Instances[0].PublicIpAddress' --output text)
            echo "✅ $instance_name instance started with IP: $public_ip"

            # Install systemd service files if this is the combined instance
            if [ "$instance_id" == "$COMBINED_INSTANCE_ID" ]; then
                echo "Installing systemd service files..."
                # Wait a bit for SSH to be available
                echo "Waiting for SSH to be available..."
                for i in {1..30}; do
                    if ssh -o StrictHostKeyChecking=no -o ConnectTimeout=5 -i /home/msloan/.ssh/aws-starter-key.pem ubuntu@$public_ip "echo 'SSH connection successful'" 2>/dev/null; then
                        echo "SSH connection established"
                        break
                    fi
                    echo "Waiting for SSH... ($i/30)"
                    sleep 5
                    if [ $i -eq 30 ]; then
                        echo "⚠️ Warning: Could not establish SSH connection. Systemd files not installed."
                        return
                    fi
                done

                # Run the install-systemd-files.sh script
                "$SCRIPT_DIR/install-systemd-files.sh"
                echo "✅ Systemd service files installed and services started"
            fi
            ;;

        stop)
            echo "Stopping $instance_name instance..."
            aws ec2 stop-instances --instance-ids $instance_id

            echo "Waiting for instance to stop..."
            aws ec2 wait instance-stopped --instance-ids $instance_id
            echo "✅ $instance_name instance stopped"
            ;;

        status)
            local status=$(aws ec2 describe-instances --instance-ids $instance_id --query 'Reservations[0].Instances[0].State.Name' --output text)
            local public_ip=$(aws ec2 describe-instances --instance-ids $instance_id --query 'Reservations[0].Instances[0].PublicIpAddress' --output text 2>/dev/null || echo "N/A")

            echo "Status: $status"
            echo "Public IP: $public_ip"

            if [ "$status" == "running" ]; then
                echo "✅ $instance_name instance is running"
            else
                echo "❌ $instance_name instance is not running"
            fi
            ;;
    esac
}

# Main instance management logic
case $INSTANCE in
    all)
        if [ "$ACTION" = "status" ]; then
            echo "=== Combined Instance Status ==="
            manage_instance $COMBINED_INSTANCE_ID "Combined" status
            echo -e "\n=== Spring Boot Instance Status ==="
            manage_instance $SPRINGBOOT_INSTANCE_ID "Spring Boot" status
            echo -e "\n=== MongoDB Instance Status ==="
            manage_instance $MONGODB_INSTANCE_ID "MongoDB" status
        else
            manage_instance $COMBINED_INSTANCE_ID "Combined" $ACTION
            manage_instance $SPRINGBOOT_INSTANCE_ID "Spring Boot" $ACTION
            manage_instance $MONGODB_INSTANCE_ID "MongoDB" $ACTION
        fi
        ;;
    combined)
        manage_instance $COMBINED_INSTANCE_ID "Combined" $ACTION
        ;;
    springboot)
        manage_instance $SPRINGBOOT_INSTANCE_ID "Spring Boot" $ACTION
        ;;
    mongodb)
        manage_instance $MONGODB_INSTANCE_ID "MongoDB" $ACTION
        ;;
esac

echo -e "\nNote: After starting instances, you may need to wait a minute or two for services to initialize."
echo "To manage services on the instances, use: ./services.sh [start|stop|restart|status] [--service=all|spring-boot|mongodb]"
