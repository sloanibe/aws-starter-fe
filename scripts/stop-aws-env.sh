#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Stopping AWS Development Environment...${NC}"

# Stop both instances
echo -e "\n${YELLOW}Stopping EC2 instances...${NC}"
aws ec2 stop-instances \
    --region us-west-1 \
    --instance-ids i-0016ff996ce1dd7ea i-01d80332e1a5ef33f \
    --output json

# Wait for instances to be stopped
echo -e "\n${YELLOW}Waiting for instances to stop...${NC}"
aws ec2 wait instance-stopped \
    --region us-west-1 \
    --instance-ids i-0016ff996ce1dd7ea i-01d80332e1a5ef33f

echo -e "\n${GREEN}✓ All instances have been stopped${NC}"
