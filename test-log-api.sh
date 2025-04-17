#!/bin/bash

# Base URL for the API
BASE_URL="http://localhost:8080/api/logs"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test service to use
SERVICE="email-service"

echo -e "${YELLOW}Testing Log API for service: $SERVICE${NC}"

# 1. Start log collection
echo -e "\n${GREEN}Starting log collection...${NC}"
curl -X POST "$BASE_URL/start/$SERVICE" -H "Content-Type: application/json"

# 2. Wait a moment for logs to be collected
echo -e "\n\n${GREEN}Waiting for logs to be collected...${NC}"
sleep 5

# 3. Get logs
echo -e "\n${GREEN}Getting logs...${NC}"
curl -X GET "$BASE_URL/$SERVICE" -H "Accept: application/json" | jq '.'

# 4. Check status
echo -e "\n${GREEN}Checking status...${NC}"
curl -X GET "$BASE_URL/$SERVICE/status" -H "Accept: application/json" | jq '.'

# 5. Get logs with limit
echo -e "\n${GREEN}Getting logs with limit=5...${NC}"
curl -X GET "$BASE_URL/$SERVICE?limit=5" -H "Accept: application/json" | jq '.'

# 6. Get available services
echo -e "\n${GREEN}Getting available services...${NC}"
curl -X GET "$BASE_URL/services" -H "Accept: application/json" | jq '.'

# 7. Stop log collection
echo -e "\n${GREEN}Stopping log collection...${NC}"
curl -X POST "$BASE_URL/stop/$SERVICE" -H "Content-Type: application/json"

# 8. Check status again
echo -e "\n\n${GREEN}Checking status after stopping...${NC}"
curl -X GET "$BASE_URL/$SERVICE/status" -H "Accept: application/json" | jq '.'

echo -e "\n${YELLOW}Test completed${NC}"
