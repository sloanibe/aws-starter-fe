#!/bin/bash

# Script to SSH into the EC2 instance
# Usage: ./ssh.sh [--check-ip|-c]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

EC2_IP="13.52.157.48"
SSH_KEY="/home/msloan/.ssh/aws-starter-key.pem"
CHECK_IP=false

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --check-ip|-c) CHECK_IP=true ;;
        *) echo "Unknown parameter: $1"; exit 1 ;;
    esac
    shift
done

# Get current IP for verification
CURRENT_IP=$(curl -s https://checkip.amazonaws.com)

if [ "$CHECK_IP" = true ]; then
    echo "Your current IP address is: $CURRENT_IP"
    echo "To allow SSH access, ensure this IP is in the EC2 security group:"
    echo "   1. Go to AWS Console > EC2 > Security Groups"
    echo "   2. Find group: sg-04a28d3509034f21f"
    echo "   3. Edit inbound rules"
    echo "   4. Ensure port 22 (SSH) is allowed from: $CURRENT_IP/32"
    exit 0
fi

# Test SSH connection with 5 second timeout
echo "🔍 Testing SSH connection from IP: $CURRENT_IP..."
if ! ssh -i $SSH_KEY -o ConnectTimeout=5 ubuntu@$EC2_IP "echo 'SSH connection successful'" 2>/dev/null; then
    echo "❌ SSH connection failed"
    echo "ℹ️ Your current IP address is: $CURRENT_IP"
    echo "📝 Please verify this IP is allowed in the EC2 security group:"
    echo "   1. Go to AWS Console > EC2 > Security Groups"
    echo "   2. Find group: sg-04a28d3509034f21f"
    echo "   3. Edit inbound rules"
    echo "   4. Ensure port 22 (SSH) is allowed from: $CURRENT_IP/32"
    exit 1
fi

# Connect to the instance
echo "🔌 Connecting to EC2 instance..."
ssh -i $SSH_KEY ubuntu@$EC2_IP
