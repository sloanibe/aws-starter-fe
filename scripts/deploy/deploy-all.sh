#!/bin/bash

# Script to deploy all components of the AWS Starter application
# Usage: ./deploy-all.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
INFRA_SCRIPTS="$PROJECT_ROOT/infrastructure/scripts"

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
./infrastructure/scripts/deploy/deploy-backend.sh

echo "Deployment complete! The API is available at: https://api.sloandev.net/"
