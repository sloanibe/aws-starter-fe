#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Setting up Spring Boot service...${NC}"

# Create app directory if it doesn't exist
echo -e "\n${YELLOW}Creating application directory...${NC}"
ssh -i ~/.ssh/aws-starter.pem ec2-user@54.215.190.170 'mkdir -p ~/aws-starter-api'

# Copy the JAR file to the EC2 instance
echo -e "\n${YELLOW}Copying JAR file to EC2...${NC}"
scp -i ~/.ssh/aws-starter.pem ../aws-starter-api/target/aws-starter-api.jar ec2-user@54.215.190.170:~/aws-starter-api/

# Copy the service file to EC2
echo -e "\n${YELLOW}Copying service file to EC2...${NC}"
scp -i ~/.ssh/aws-starter.pem spring-boot-app.service ec2-user@54.215.190.170:~/aws-starter-api/

# Set up the service
echo -e "\n${YELLOW}Setting up systemd service...${NC}"
ssh -i ~/.ssh/aws-starter.pem ec2-user@54.215.190.170 'sudo mv ~/aws-starter-api/spring-boot-app.service /etc/systemd/system/ && \
    sudo systemctl daemon-reload && \
    sudo systemctl enable spring-boot-app && \
    sudo systemctl start spring-boot-app'

# Check service status
echo -e "\n${YELLOW}Checking service status...${NC}"
ssh -i ~/.ssh/aws-starter.pem ec2-user@54.215.190.170 'sudo systemctl status spring-boot-app'

echo -e "\n${GREEN}✓ Spring Boot service setup complete!${NC}"
