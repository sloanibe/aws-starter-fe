#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

STACK_NAME="aws-starter-stack"
REGION="us-west-1"

# Function to check if stack exists
check_stack() {
    aws cloudformation describe-stacks \
        --region $REGION \
        --stack-name $STACK_NAME 2>/dev/null
    return $?
}

# Function to wait for stack operation to complete
wait_for_stack() {
    local operation=$1
    echo -e "${YELLOW}Waiting for stack $operation to complete...${NC}"
    aws cloudformation wait stack-$operation-complete \
        --region $REGION \
        --stack-name $STACK_NAME
}

case "$1" in
    "deploy")
        echo -e "${YELLOW}Deploying AWS infrastructure...${NC}"
        
        if check_stack; then
            echo -e "${YELLOW}Stack already exists, updating...${NC}"
            aws cloudformation update-stack \
                --region $REGION \
                --stack-name $STACK_NAME \
                --template-body file://aws-infrastructure-combined.yml \
                --capabilities CAPABILITY_IAM \
                --parameters \
                    ParameterKey=KeyName,ParameterValue=aws-starter-key \
                    ParameterKey=LocalIpAddress,ParameterValue=$(curl -s https://api.ipify.org)/32
            
            wait_for_stack "update"
        else
            echo -e "${YELLOW}Creating new stack...${NC}"
            aws cloudformation create-stack \
                --region $REGION \
                --stack-name $STACK_NAME \
                --template-body file://aws-infrastructure-combined.yml \
                --capabilities CAPABILITY_IAM \
                --parameters \
                    ParameterKey=KeyName,ParameterValue=aws-starter-key \
                    ParameterKey=LocalIpAddress,ParameterValue=$(curl -s https://api.ipify.org)/32
            
            wait_for_stack "create"
        fi
        
        # Show stack outputs
        echo -e "${GREEN}Stack deployment complete! Instance details:${NC}"
        aws cloudformation describe-stacks \
            --region $REGION \
            --stack-name $STACK_NAME \
            --query 'Stacks[0].Outputs' \
            --output table
        ;;
        
    "teardown")
        echo -e "${YELLOW}Tearing down AWS infrastructure...${NC}"
        
        if check_stack; then
            echo -e "${RED}Deleting stack $STACK_NAME...${NC}"
            aws cloudformation delete-stack \
                --region $REGION \
                --stack-name $STACK_NAME
            
            wait_for_stack "delete"
            echo -e "${GREEN}Stack deleted successfully!${NC}"
        else
            echo -e "${YELLOW}No stack found, nothing to teardown.${NC}"
        fi
        ;;
        
    "status")
        echo -e "${YELLOW}Checking stack status...${NC}"
        
        if check_stack; then
            aws cloudformation describe-stacks \
                --region $REGION \
                --stack-name $STACK_NAME \
                --query 'Stacks[0].[StackName,StackStatus,Description]' \
                --output table
            
            echo -e "\n${YELLOW}Stack resources:${NC}"
            aws cloudformation list-stack-resources \
                --region $REGION \
                --stack-name $STACK_NAME \
                --query 'StackResourceSummaries[].[LogicalResourceId,ResourceType,ResourceStatus]' \
                --output table
        else
            echo -e "${YELLOW}No stack found.${NC}"
        fi
        ;;
        
    *)
        echo "Usage: $0 {deploy|teardown|status}"
        echo "  deploy   - Deploy or update the AWS infrastructure"
        echo "  teardown - Delete all AWS resources"
        echo "  status   - Show current stack status"
        exit 1
        ;;
esac
