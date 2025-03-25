#!/bin/bash

# Script to update and deploy all services to the EC2 instance
# This script handles both JAR deployment and systemd service file installation
# Usage: ./update-services.sh [--skip-build] [--skip-systemd]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# EC2 instance details
EC2_IP="13.52.157.48"
SSH_KEY="/home/msloan/.ssh/aws-starter-key.pem"

# Parse arguments
SKIP_BUILD=false
SKIP_SYSTEMD=false

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --skip-build) SKIP_BUILD=true ;;
        --skip-systemd) SKIP_SYSTEMD=true ;;
        *) echo "Unknown parameter: $1"; exit 1 ;;
    esac
    shift
done

# Step 1: Build all services (unless skipped)
if [ "$SKIP_BUILD" = false ]; then
    echo "🚀 Building all services..."
    
    # Build Service Discovery
    echo "📦 Building Service Discovery..."
    cd "$PROJECT_ROOT/service-discovery-service"
    ./mvnw clean package -DskipTests
    
    # Build Config Server
    echo "📦 Building Config Server..."
    cd "$PROJECT_ROOT/config-server-service"
    ./mvnw clean package -DskipTests
    
    # Build API Gateway
    echo "📦 Building API Gateway..."
    cd "$PROJECT_ROOT/api-gateway-service"
    ./mvnw clean package -DskipTests
    
    # Build AWS Starter API
    echo "📦 Building AWS Starter API..."
    cd "$PROJECT_ROOT/aws-starter-api"
    ./mvnw clean package -DskipTests
    
    cd "$PROJECT_ROOT"
fi

# Step 2: Deploy all JARs
echo "📦 Deploying all service JARs..."
"$PROJECT_ROOT/scripts/deploy/deploy-springboot.sh"

# Step 3: Install systemd service files (unless skipped)
if [ "$SKIP_SYSTEMD" = false ]; then
    echo "⚙️ Installing systemd service files..."
    "$PROJECT_ROOT/scripts/server/install-systemd-files.sh"
fi

# Step 4: Restart all services in the correct order
echo "🔄 Restarting all services in the correct order..."
"$PROJECT_ROOT/scripts/server/services.sh" restart --service=all

echo "✅ All services have been updated, deployed, and restarted!"
echo "🔍 You can check their status with: ./scripts/server/services.sh status --service=all"
