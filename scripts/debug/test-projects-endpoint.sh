#!/bin/bash

# Test script for projects endpoint through AWS API Gateway
echo "Testing projects endpoint through AWS API Gateway..."
curl -v https://vab90wx4u0.execute-api.us-west-1.amazonaws.com/prod/api/projects

echo -e "\n\nTesting projects endpoint directly through Spring Cloud Gateway..."
curl -v http://13.52.157.48:8090/api/projects

echo -e "\n\nTesting projects endpoint directly through AWS-STARTER-API service..."
curl -v http://13.52.157.48:8080/projects
