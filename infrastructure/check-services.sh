#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Get instance IPs from CloudFormation stack
get_instance_ips() {
    local stack_name="aws-starter-stack"
    local region="us-west-1"
    
    MONGO_IP=$(aws cloudformation describe-stacks \
        --stack-name $stack_name \
        --region $region \
        --query 'Stacks[0].Outputs[?OutputKey==`MongoDBPublicIP`].OutputValue' \
        --output text)
    
    SPRING_IP=$(aws cloudformation describe-stacks \
        --stack-name $stack_name \
        --region $region \
        --query 'Stacks[0].Outputs[?OutputKey==`SpringBootPublicIP`].OutputValue' \
        --output text)
}

# Check MongoDB Status
check_mongodb() {
    echo -e "\n${YELLOW}Checking MongoDB Status...${NC}"
    
    # Check if MongoDB process is running
    echo -e "\n${YELLOW}MongoDB Process Status:${NC}"
    ssh -i ~/.ssh/aws-starter-key.pem -o StrictHostKeyChecking=no -o ConnectTimeout=5 ubuntu@$MONGO_IP "sudo systemctl status mongod" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ MongoDB process is running${NC}"
        
        # Check if MongoDB responds to queries
        echo -e "\n${YELLOW}MongoDB Connection Test:${NC}"
        ssh -i ~/.ssh/aws-starter-key.pem -o StrictHostKeyChecking=no ubuntu@$MONGO_IP "mongosh --quiet --eval 'db.runCommand({ ping: 1 }).ok'" 2>/dev/null
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓ MongoDB is accepting connections${NC}"
            
            # Check database and collection
            echo -e "\n${YELLOW}Database Check:${NC}"
            ssh -i ~/.ssh/aws-starter-key.pem -o StrictHostKeyChecking=no ubuntu@$MONGO_IP \
                "mongosh --quiet --eval 'db.getSiblingDB(\"aws_starter_db\").messages.stats()'" 2>/dev/null
            
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}✓ Messages collection is accessible${NC}"
            else
                echo -e "${RED}✗ Cannot access messages collection${NC}"
            fi
        else
            echo -e "${RED}✗ MongoDB is not responding to queries${NC}"
        fi
    else
        echo -e "${RED}✗ MongoDB process is not running${NC}"
    fi
}

# Check Spring Boot Status
check_springboot() {
    echo -e "\n${YELLOW}Checking Spring Boot Status...${NC}"
    
    # Check if Spring Boot process is running
    echo -e "\n${YELLOW}Spring Boot Process Status:${NC}"
    ssh -i ~/.ssh/aws-starter-key.pem -o StrictHostKeyChecking=no -o ConnectTimeout=5 ubuntu@$SPRING_IP "sudo systemctl status spring-boot-app" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Spring Boot process is running${NC}"
        
        # Check if API endpoint responds
        echo -e "\n${YELLOW}API Health Check:${NC}"
        curl -s -o /dev/null -w "%{http_code}" http://$SPRING_IP:8080/api/test 2>/dev/null
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓ API endpoint is responding${NC}"
        else
            echo -e "${RED}✗ API endpoint is not responding${NC}"
        fi
    else
        echo -e "${RED}✗ Spring Boot process is not running${NC}"
    fi
}

# Check System Resources
check_resources() {
    local instance_ip=$1
    local name=$2
    
    echo -e "\n${YELLOW}Checking $name System Resources...${NC}"
    
    echo -e "\n${YELLOW}Memory Usage:${NC}"
    ssh -i ~/.ssh/aws-starter-key.pem -o StrictHostKeyChecking=no ubuntu@$instance_ip "free -h" 2>/dev/null
    
    echo -e "\n${YELLOW}Disk Usage:${NC}"
    ssh -i ~/.ssh/aws-starter-key.pem -o StrictHostKeyChecking=no ubuntu@$instance_ip "df -h /" 2>/dev/null
    
    echo -e "\n${YELLOW}CPU Load:${NC}"
    ssh -i ~/.ssh/aws-starter-key.pem -o StrictHostKeyChecking=no ubuntu@$instance_ip "uptime" 2>/dev/null
}

# Main execution
echo -e "${YELLOW}Starting Service Health Checks...${NC}"

# Get instance IPs
get_instance_ips

if [ -z "$MONGO_IP" ] || [ -z "$SPRING_IP" ]; then
    echo -e "${RED}Could not get instance IPs from CloudFormation stack${NC}"
    exit 1
fi

# Run all checks
check_mongodb
check_springboot
check_resources $MONGO_IP "MongoDB"
check_resources $SPRING_IP "Spring Boot"

echo -e "\n${GREEN}Health check complete!${NC}"
