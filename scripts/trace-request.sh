#!/bin/bash

# Script to trace a request through the dual-gateway architecture
# This will help diagnose where the request is failing

echo "=== Testing Direct Spring Cloud Gateway ==="
curl -X POST -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User","organization":"Test Company"}' \
  http://13.52.157.48:8090/api/login -v

echo -e "\n\n=== Testing AWS API Gateway ==="
curl -X POST -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User","organization":"Test Company"}' \
  https://vab90wx4u0.execute-api.us-west-1.amazonaws.com/prod/api/login -v

# Add a test for a different endpoint to see if it's specific to the login endpoint
echo -e "\n\n=== Testing AWS API Gateway with a different endpoint ==="
curl -X GET https://vab90wx4u0.execute-api.us-west-1.amazonaws.com/prod/api/test -v
