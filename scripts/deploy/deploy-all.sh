#!/bin/bash

# Script to deploy all components of the AWS Starter application
# Usage: ./deploy-all.sh
#
# This script deploys the following components:
# 1. SES email service
# 2. API Gateway
# 3. Spring Boot application
# 4. Eureka Service Discovery (if --with-microservices flag is provided)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
INFRA_SCRIPTS="$PROJECT_ROOT/infrastructure/scripts"

# Default values
DEPLOY_MICROSERVICES=false

# Parse arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --with-microservices) DEPLOY_MICROSERVICES=true ;;
        *) echo "Unknown parameter: $1"; exit 1 ;;
    esac
    shift
done

echo "Deploying AWS Starter application..."

# 1. Deploy SES for email notifications
echo "1. Deploying SES email service..."
cd "$INFRA_SCRIPTS/deploy"
./deploy-ses.sh

# 2. Deploy API Gateway
echo "2. Deploying API Gateway..."
./deploy-api-gateway.sh

# 3. Deploy Spring Boot application with monitoring
echo "3. Deploying Spring Boot application..."
cd "$PROJECT_ROOT"
./infrastructure/scripts/deploy/deploy-springboot.sh

# 4. Deploy Eureka Service Discovery if requested
if [ "$DEPLOY_MICROSERVICES" = true ]; then
    echo "4. Deploying Eureka Service Discovery..."
    cd "$INFRA_SCRIPTS/deploy"
    ./deploy-eureka.sh
    
    echo "Microservices infrastructure has been deployed!"
    echo "Eureka Dashboard is available at: http://<eureka-ip>:8761/"
fi

echo "Deployment complete! The API is available at: https://api.sloandev.net/"
