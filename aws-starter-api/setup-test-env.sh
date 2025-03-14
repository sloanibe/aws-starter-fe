#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "Setting up test environment for AWS Starter API..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Error: Docker is not running. Please start Docker and try again.${NC}"
    exit 1
fi

# Check if MongoDB container is already running
if docker ps | grep -q "mongodb"; then
    CONTAINER_ID=$(docker ps | grep mongodb | awk '{print $1}')
    echo -e "${GREEN}MongoDB container is already running with ID: ${CONTAINER_ID}${NC}"
    
    # Check if it's running on the correct port
    if docker port $CONTAINER_ID | grep -q "27017/tcp -> 0.0.0.0:27017"; then
        echo -e "${GREEN}MongoDB is correctly mapped to port 27017${NC}"
    else
        echo -e "${YELLOW}Warning: MongoDB container is running but may not be mapped to port 27017${NC}"
        echo -e "${YELLOW}Current port mapping:${NC}"
        docker port $CONTAINER_ID
    fi
else
    echo "MongoDB container is not running. Starting a new container..."
    
    # Check if a stopped container with the name 'mongodb' exists
    if docker ps -a | grep -q "mongodb"; then
        echo -e "${YELLOW}Found stopped MongoDB container. Removing it...${NC}"
        docker rm mongodb > /dev/null
    fi
    
    # Start a new MongoDB container
    echo "Starting MongoDB container..."
    CONTAINER_ID=$(docker run -d \
        --name mongodb \
        -p 27017:27017 \
        -e MONGO_INITDB_ROOT_USERNAME=admin \
        -e MONGO_INITDB_ROOT_PASSWORD=admin123 \
        mongo:6.0)
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}MongoDB container started successfully with ID: ${CONTAINER_ID}${NC}"
    else
        echo -e "${RED}Failed to start MongoDB container${NC}"
        exit 1
    fi
fi

# Wait for MongoDB to be ready
echo "Waiting for MongoDB to be ready..."
MAX_RETRIES=30
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if docker logs mongodb 2>&1 | grep -q "Waiting for connections"; then
        echo -e "${GREEN}MongoDB is ready and waiting for connections!${NC}"
        break
    fi
    
    echo "Waiting for MongoDB to initialize... ($(($RETRY_COUNT + 1))/$MAX_RETRIES)"
    sleep 1
    RETRY_COUNT=$((RETRY_COUNT + 1))
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo -e "${RED}Timed out waiting for MongoDB to be ready${NC}"
    echo -e "${YELLOW}Container logs:${NC}"
    docker logs mongodb | tail -n 20
    exit 1
fi

echo -e "${GREEN}Test environment is ready!${NC}"
echo -e "MongoDB container is running on port 27017"
echo -e "Username: admin"
echo -e "Password: admin123"
echo -e "\nYou can now run tests with: ./mvnw clean verify"
