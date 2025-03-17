#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

REGION="us-west-1"

# Known Instance IDs
SPRING_BOOT_ID="i-0016ff996ce1dd7ea"
MONGODB_ID="i-01d80332e1a5ef33f"

echo -e "${YELLOW}Starting manual teardown of AWS resources...${NC}"

# 1. Stop EC2 instances
echo -e "\n${YELLOW}Stopping EC2 instances...${NC}"
aws ec2 stop-instances \
    --region $REGION \
    --instance-ids $SPRING_BOOT_ID $MONGODB_ID

echo -e "${YELLOW}Waiting for instances to stop...${NC}"
aws ec2 wait instance-stopped \
    --region $REGION \
    --instance-ids $SPRING_BOOT_ID $MONGODB_ID

# 2. Terminate EC2 instances
echo -e "\n${YELLOW}Terminating EC2 instances...${NC}"
aws ec2 terminate-instances \
    --region $REGION \
    --instance-ids $SPRING_BOOT_ID $MONGODB_ID

echo -e "${YELLOW}Waiting for instances to terminate...${NC}"
aws ec2 wait instance-terminated \
    --region $REGION \
    --instance-ids $SPRING_BOOT_ID $MONGODB_ID

# 3. Delete security groups
echo -e "\n${YELLOW}Deleting security groups...${NC}"
SG_IDS=$(aws ec2 describe-security-groups \
    --region $REGION \
    --filters "Name=group-name,Values=CoreStack-TaskerSecurityGroup-*" \
    --query 'SecurityGroups[*].GroupId' \
    --output text)

for sg in $SG_IDS; do
    echo -e "${YELLOW}Deleting security group: $sg${NC}"
    aws ec2 delete-security-group \
        --region $REGION \
        --group-id $sg
done

# 4. Delete VPC and related resources
VPC_ID=$(aws ec2 describe-vpcs \
    --region $REGION \
    --filters "Name=tag:Name,Values=tasker-vpc" \
    --query 'Vpcs[0].VpcId' \
    --output text)

if [ "$VPC_ID" != "None" ] && [ "$VPC_ID" != "null" ]; then
    echo -e "\n${YELLOW}Cleaning up VPC: $VPC_ID${NC}"
    
    # Delete subnets
    SUBNET_IDS=$(aws ec2 describe-subnets \
        --region $REGION \
        --filters "Name=vpc-id,Values=$VPC_ID" \
        --query 'Subnets[*].SubnetId' \
        --output text)
    
    for subnet in $SUBNET_IDS; do
        echo -e "${YELLOW}Deleting subnet: $subnet${NC}"
        aws ec2 delete-subnet \
            --region $REGION \
            --subnet-id $subnet
    done
    
    # Detach and delete internet gateway
    IGW_ID=$(aws ec2 describe-internet-gateways \
        --region $REGION \
        --filters "Name=attachment.vpc-id,Values=$VPC_ID" \
        --query 'InternetGateways[0].InternetGatewayId' \
        --output text)
    
    if [ "$IGW_ID" != "None" ] && [ "$IGW_ID" != "null" ]; then
        echo -e "${YELLOW}Detaching and deleting internet gateway: $IGW_ID${NC}"
        aws ec2 detach-internet-gateway \
            --region $REGION \
            --internet-gateway-id $IGW_ID \
            --vpc-id $VPC_ID
        
        aws ec2 delete-internet-gateway \
            --region $REGION \
            --internet-gateway-id $IGW_ID
    fi
    
    # Delete VPC
    echo -e "${YELLOW}Deleting VPC: $VPC_ID${NC}"
    aws ec2 delete-vpc \
        --region $REGION \
        --vpc-id $VPC_ID
fi

# 5. Clean up elastic IPs if any
echo -e "\n${YELLOW}Cleaning up any unassociated Elastic IPs...${NC}"
aws ec2 describe-addresses \
    --region $REGION \
    --query 'Addresses[?AssociationId==`null`].AllocationId' \
    --output text | \
while read -r eip; do
    if [ ! -z "$eip" ]; then
        echo -e "${YELLOW}Releasing Elastic IP: $eip${NC}"
        aws ec2 release-address --allocation-id $eip --region $REGION
    fi
done

echo -e "\n${GREEN}✓ Teardown complete!${NC}"
