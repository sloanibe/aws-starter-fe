#!/bin/bash

# Script to manage AWS infrastructure and services
# Usage: ./manage-aws.sh [deploy|update|status|delete] [--service=all|api-gateway|ses|ec2] [--force] [--env=dev|prod]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
CLOUDFORMATION_DIR="$PROJECT_ROOT/infrastructure/cloudformation"

# Default values
ACTION=""
SERVICE="all"
FORCE=false
ENV="dev"
SENDER_EMAIL="sloanibe@gmail.com"

# Parse arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        deploy|update|status|delete) ACTION="$1" ;;
        --service=*) SERVICE="${1#*=}" ;;
        --force) FORCE=true ;;
        --env=*) ENV="${1#*=}" ;;
        *) echo "Unknown parameter: $1"; exit 1 ;;
    esac
    shift
done

# Validate arguments
if [ -z "$ACTION" ]; then
    echo "Error: Action required (deploy|update|status|delete)"
    echo "Usage: ./manage-aws.sh [deploy|update|status|delete] [--service=all|api-gateway|ses|ec2] [--force] [--env=dev|prod]"
    exit 1
fi

if [[ ! "$SERVICE" =~ ^(all|api-gateway|ses|ec2)$ ]]; then
    echo "Error: Invalid service. Must be 'all', 'api-gateway', 'ses', or 'ec2'"
    exit 1
fi

# Function to check stack status
check_stack_status() {
    local stack_name="$1"
    aws cloudformation describe-stacks --stack-name "$stack_name" --query 'Stacks[0].{Status:StackStatus,StatusReason:StackStatusReason}' 2>/dev/null || echo "DOES_NOT_EXIST"
}

# Function to wait for stack operation
wait_for_stack() {
    local stack_name="$1"
    local operation="$2"
    echo "Waiting for $stack_name $operation to complete..."
    aws cloudformation wait "stack-$operation-complete" --stack-name "$stack_name"
}

# Function to delete stack if it exists
delete_stack_if_exists() {
    local stack_name="$1"
    local status=$(check_stack_status "$stack_name")
    
    if [[ "$status" != "DOES_NOT_EXIST" ]]; then
        echo "Deleting existing stack: $stack_name"
        aws cloudformation delete-stack --stack-name "$stack_name"
        wait_for_stack "$stack_name" "delete"
    fi
}

# Function to deploy/update SES
manage_ses() {
    local stack_name="aws-starter-ses-${ENV}"
    local template="$CLOUDFORMATION_DIR/ses-email.yml"
    
    case $ACTION in
        deploy|update)
            if [[ "$ACTION" == "deploy" ]] && [[ "$FORCE" == "true" ]]; then
                delete_stack_if_exists "$stack_name"
            fi
            
            echo "Deploying/updating SES configuration..."
            aws cloudformation deploy \
                --template-file "$template" \
                --stack-name "$stack_name" \
                --parameter-overrides \
                    Environment="$ENV" \
                    SenderEmail="$SENDER_EMAIL" \
                    NotificationEmail="$SENDER_EMAIL" \
                --capabilities CAPABILITY_IAM || {
                    echo "⚠️ SES deployment failed. Checking stack status..."
                    check_stack_status "$stack_name"
                    exit 1
                }
            echo "✅ SES configuration updated successfully"
            ;;
            
        status)
            echo "=== SES Stack Status ==="
            check_stack_status "$stack_name"
            
            echo -e "\n=== SES Email Verification Status ==="
            aws ses get-identity-verification-attributes --identities "$SENDER_EMAIL" \
                --query 'VerificationAttributes.*.[VerificationStatus]' --output text
            
            echo -e "\n=== SES Sending Statistics ==="
            aws ses get-send-statistics --query 'SendDataPoints[0]'
            ;;
            
        delete)
            echo "Deleting SES configuration..."
            delete_stack_if_exists "$stack_name"
            echo "✅ SES configuration deleted"
            ;;
    esac
}

# Function to deploy/update API Gateway
manage_api_gateway() {
    local stack_name="aws-starter-api-gateway"
    local template="$CLOUDFORMATION_DIR/api-gateway.yml"
    
    case $ACTION in
        deploy|update)
            if [[ "$ACTION" == "deploy" ]] && [[ "$FORCE" == "true" ]]; then
                delete_stack_if_exists "$stack_name"
            fi
            
            echo "Deploying/updating API Gateway configuration..."
            aws cloudformation deploy \
                --template-file "$template" \
                --stack-name "$stack_name" \
                --parameter-overrides Environment="$ENV" \
                --capabilities CAPABILITY_IAM || {
                    echo "⚠️ API Gateway deployment failed. Checking stack status..."
                    check_stack_status "$stack_name"
                    exit 1
                }
            echo "✅ API Gateway configuration updated successfully"
            
            # Get and display the API Gateway URL
            api_url=$(aws cloudformation describe-stacks --stack-name "$stack_name" \
                --query 'Stacks[0].Outputs[?OutputKey==`ApiGatewayUrl`].OutputValue' --output text)
            echo "API Gateway URL: $api_url"
            ;;
            
        status)
            echo "=== API Gateway Stack Status ==="
            check_stack_status "$stack_name"
            
            echo -e "\n=== API Gateway Endpoints ==="
            aws apigateway get-rest-apis --query 'items[?name==`aws-starter-api`].[name,id]' --output text
            ;;
            
        delete)
            echo "Deleting API Gateway configuration..."
            delete_stack_if_exists "$stack_name"
            echo "✅ API Gateway configuration deleted"
            ;;
    esac
}

# Function to deploy/update EC2
manage_ec2() {
    local stack_name="aws-starter-stack"
    local template="$CLOUDFORMATION_DIR/aws-infrastructure-combined.yml"
    
    case $ACTION in
        deploy|update)
            if [[ "$ACTION" == "deploy" ]] && [[ "$FORCE" == "true" ]]; then
                delete_stack_if_exists "$stack_name"
            fi
            
            echo "Deploying/updating EC2 infrastructure..."
            aws cloudformation deploy \
                --template-file "$template" \
                --stack-name "$stack_name" \
                --parameter-overrides Environment="$ENV" \
                --capabilities CAPABILITY_IAM || {
                    echo "⚠️ EC2 deployment failed. Checking stack status..."
                    check_stack_status "$stack_name"
                    exit 1
                }
            echo "✅ EC2 infrastructure updated successfully"
            
            # Get and display instance IPs
            spring_boot_ip=$(aws cloudformation describe-stacks --stack-name "$stack_name" \
                --query 'Stacks[0].Outputs[?OutputKey==`SpringBootPublicIP`].OutputValue' --output text)
            echo "Spring Boot Instance IP: $spring_boot_ip"
            ;;
            
        status)
            echo "=== EC2 Stack Status ==="
            check_stack_status "$stack_name"
            
            echo -e "\n=== EC2 Instances ==="
            aws ec2 describe-instances \
                --filters "Name=tag:Name,Values=aws-starter-*" \
                --query 'Reservations[].Instances[].[Tags[?Key==`Name`].Value|[0],State.Name,PublicIpAddress]' \
                --output table
            ;;
            
        delete)
            echo "Deleting EC2 infrastructure..."
            delete_stack_if_exists "$stack_name"
            echo "✅ EC2 infrastructure deleted"
            ;;
    esac
}

# Main logic
case $SERVICE in
    all)
        echo "Managing all AWS services..."
        manage_ec2
        manage_api_gateway
        manage_ses
        ;;
    api-gateway)
        manage_api_gateway
        ;;
    ses)
        manage_ses
        ;;
    ec2)
        manage_ec2
        ;;
esac
