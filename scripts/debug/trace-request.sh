#!/bin/bash

# Set variables
AWS_API_GATEWAY="https://vab90wx4u0.execute-api.us-west-1.amazonaws.com/prod/api/login"
SPRING_GATEWAY="http://13.52.157.48:8090/api/login"
LOGIN_SERVICE="http://13.52.157.48:8081/api/login"

# Test data
TEST_DATA='{"email":"test@example.com","name":"Test User","organization":"Test Company"}'

echo "=== Testing AWS API Gateway ==="
echo "Endpoint: $AWS_API_GATEWAY"
curl -X POST -H "Content-Type: application/json" -d "$TEST_DATA" "$AWS_API_GATEWAY" -v

echo -e "\n\n=== Testing Spring Cloud Gateway ==="
echo "Endpoint: $SPRING_GATEWAY"
curl -X POST -H "Content-Type: application/json" -d "$TEST_DATA" "$SPRING_GATEWAY" -v

echo -e "\n\n=== Testing Login Service directly ==="
echo "Endpoint: $LOGIN_SERVICE"
curl -X POST -H "Content-Type: application/json" -d "$TEST_DATA" "$LOGIN_SERVICE" -v
