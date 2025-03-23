#!/bin/bash

set -e

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

# First, ensure EC2 infrastructure is up-to-date
echo "🔍 Checking EC2 infrastructure..."
$PROJECT_ROOT/scripts/aws/manage-aws.sh status --service=ec2

# Call the infrastructure deployment script
echo "🚀 Deploying API Gateway using infrastructure deployment script..."
cd "$PROJECT_ROOT" && ./infrastructure/scripts/deploy/deploy-spring-cloud-gateway.sh
