#!/bin/bash

# Script to test AWS API Gateway endpoints directly using AWS CLI
# This helps debug routing issues by showing exactly what the API Gateway receives and returns

# API Gateway endpoint
API_ENDPOINT="https://vab90wx4u0.execute-api.us-west-1.amazonaws.com/prod"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== AWS API Gateway Testing Script ===${NC}"
echo "This script will test various endpoints on the AWS API Gateway"
echo "API Endpoint: $API_ENDPOINT"
echo ""

# Function to make a request and display results
test_endpoint() {
    local method=$1
    local path=$2
    local data=$3
    local description=$4
    
    echo -e "${YELLOW}Testing: $description${NC}"
    echo "Method: $method"
    echo "Path: $path"
    
    # Build the curl command
    CURL_CMD="curl -s -X $method"
    
    # Add data if provided
    if [ ! -z "$data" ]; then
        echo "Data: $data"
        CURL_CMD="$CURL_CMD -H 'Content-Type: application/json' -d '$data'"
    fi
    
    # Add the URL
    CURL_CMD="$CURL_CMD $API_ENDPOINT$path"
    
    echo "Command: $CURL_CMD"
    echo -e "${YELLOW}Response:${NC}"
    
    # Execute the command and capture output
    RESPONSE=$(eval $CURL_CMD)
    
    # Check if response is valid JSON
    if echo "$RESPONSE" | jq '.' &>/dev/null; then
        echo "$RESPONSE" | jq '.'
    else
        echo "$RESPONSE"
    fi
    
    # Check HTTP status code
    STATUS=$(eval $CURL_CMD -o /dev/null -w "%{http_code}" 2>/dev/null)
    if [ "$STATUS" -ge 200 ] && [ "$STATUS" -lt 300 ]; then
        echo -e "${GREEN}Status: $STATUS (Success)${NC}"
    else
        echo -e "${RED}Status: $STATUS (Error)${NC}"
    fi
    
    echo ""
    echo "---------------------------------------------"
    echo ""
}

# Test various endpoints
test_endpoint "GET" "/" "" "Root endpoint"
test_endpoint "GET" "/api" "" "API base endpoint"
test_endpoint "GET" "/api/" "" "API base endpoint with trailing slash"
test_endpoint "POST" "/api/login" '{"email":"test@example.com","password":"password","organization":"Test Company"}' "Login endpoint"
test_endpoint "GET" "/api/test" "" "Test endpoint"

# Test with different path variations to see how API Gateway handles them
test_endpoint "POST" "/login" '{"email":"test@example.com","password":"password","organization":"Test Company"}' "Login endpoint without /api prefix"
test_endpoint "POST" "/prod/api/login" '{"email":"test@example.com","password":"password","organization":"Test Company"}' "Login endpoint with stage name"

echo -e "${BLUE}=== Testing Complete ===${NC}"
