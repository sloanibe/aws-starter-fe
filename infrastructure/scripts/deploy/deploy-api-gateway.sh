#!/bin/bash

# Script to deploy API Gateway for AWS Starter API
# This script sets up an API Gateway with HTTPS and rate limiting

set -e

# Configuration
STACK_NAME="aws-starter-api-gateway"
TEMPLATE_FILE="api-gateway.yml"
REGION="us-west-1"  # Keep all resources in the same region
DOMAIN_NAME="api.sloandev.net"

# Set EC2 instance IP manually
# Normally we would get this from the EC2 metadata service, but since we're not running on EC2
# we'll set it manually
EC2_IP="13.52.157.48"  # Updated to match the current api.sloandev.net DNS resolution
EC2_PORT=8080

# Use the certificate ARN we just created in us-west-1
CERT_ARN="arn:aws:acm:us-west-1:076034795794:certificate/6aee3b95-d747-4f5a-b9ec-2581e217bbf0"
echo "Using certificate ARN: $CERT_ARN"

echo "Using certificate: $CERT_ARN"

# Deploy CloudFormation stack
echo "Deploying API Gateway CloudFormation stack..."
aws cloudformation deploy \
    --template-file "$TEMPLATE_FILE" \
    --stack-name "$STACK_NAME" \
    --parameter-overrides \
        DomainName="$DOMAIN_NAME" \
        EC2InstanceIP="$EC2_IP" \
        EC2Port="$EC2_PORT" \
        CertificateArn="$CERT_ARN" \
    --capabilities CAPABILITY_IAM \
    --region "$REGION"

# Get outputs from the stack
echo "Fetching stack outputs..."
REGIONAL_DOMAIN_NAME=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --region "$REGION" \
    --query "Stacks[0].Outputs[?OutputKey=='RegionalDomainName'].OutputValue" \
    --output text)

echo ""
echo "API Gateway deployed successfully!"
echo ""
echo "To complete setup, create the following DNS record in Route 53:"
echo "  - Record type: A"
echo "  - Name: api.sloandev.net"
echo "  - Type: A - IPv4 address"
echo "  - Alias: Yes"
echo "  - Alias target: $REGIONAL_DOMAIN_NAME"
echo ""
echo "Your API will be available at: https://$DOMAIN_NAME/"
echo "Rate limiting is set to 20 requests per second with a burst limit of 40"
