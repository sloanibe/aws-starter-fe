#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting AWS Development Environment...${NC}"

# Start the combined instance
echo -e "\n${YELLOW}Starting EC2 instance...${NC}"
aws ec2 start-instances \
    --region us-west-1 \
    --instance-ids i-00c601082fcb6bec1 \
    --output json

# Wait for instance to be running
echo -e "\n${YELLOW}Waiting for instance to be ready...${NC}"
aws ec2 wait instance-running \
    --region us-west-1 \
    --instance-ids i-00c601082fcb6bec1

# Get instance details
echo -e "\n${YELLOW}Getting instance details...${NC}"
aws ec2 describe-instances \
    --region us-west-1 \
    --instance-ids i-00c601082fcb6bec1 \
    --query 'Reservations[].Instances[].[Tags[?Key==`Name`].Value|[0],PublicIpAddress]' \
    --output table

echo -e "\n${GREEN}✓ Environment is ready!${NC}"
echo -e "${GREEN}✓ Spring Boot API, MongoDB, and Nginx are running on the combined instance${NC}"
echo -e "${GREEN}✓ Wait about 1-2 minutes for services to fully initialize${NC}"
echo -e "${GREEN}✓ Your API will be available at https://api.sloandev.net${NC}"
