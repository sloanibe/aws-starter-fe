#!/bin/bash

# Request Tracing Script for AWS Starter Architecture
# This script traces a request through the dual-gateway architecture
# from AWS API Gateway -> Spring Cloud Gateway -> Microservice

echo "=== AWS Starter Request Tracing Tool ==="
echo "Tracing request flow through the system..."
echo ""

# Default values
METHOD="POST"
ENDPOINT="login"
PATH="/api/login"
PAYLOAD='{"username":"test@example.com","password":"password"}'
CONTENT_TYPE="application/json"
TIMEOUT=5

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    -m|--method)
      METHOD="$2"
      shift 2
      ;;
    -e|--endpoint)
      ENDPOINT="$2"
      shift 2
      ;;
    -p|--path)
      PATH="$2"
      shift 2
      ;;
    -c|--content-type)
      CONTENT_TYPE="$2"
      shift 2
      ;;
    -t|--timeout)
      TIMEOUT="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Configuration
AWS_API_GATEWAY="https://vab90wx4u0.execute-api.us-west-1.amazonaws.com/prod/api"
SPRING_CLOUD_GATEWAY="http://13.52.157.48:8090/api"
LOGIN_SERVICE="http://13.52.157.48:8081"

# Function to make a request and capture details
make_request() {
  local name="$1"
  local url="$2"
  local path="$3"
  local method="$4"
  local payload="$5"
  local content_type="$6"
  
  # Remove leading slash if present in path to avoid double slash
  path=${path#/}
  
  echo "=== Testing $name ==="
  echo "URL: $url/$path"
  echo "Method: $method"
  echo "Payload: $payload"
  echo "Content-Type: $content_type"
  echo ""
  echo "Response (timeout: ${TIMEOUT}s):"
  
  # Make the request with timeout and capture status code and response body
  response=$(curl -s -w "\nStatus Code: %{http_code}" \
    --connect-timeout $TIMEOUT \
    --max-time $TIMEOUT \
    -X "$method" \
    -H "Content-Type: $content_type" \
    -d "$payload" \
    "$url/$path" 2>&1)
  
  # Check if curl timed out
  if [[ $? -ne 0 ]]; then
    echo "ERROR: Request timed out or failed to connect"
  else
    echo "$response"
  fi
  
  echo ""
  echo "=== End of $name Test ==="
  echo ""
}

# Step 1: Test AWS API Gateway with different path combinations
echo "STEP 1: Testing AWS API Gateway (with /api prefix)"
make_request "AWS API Gateway (with /api)" "https://vab90wx4u0.execute-api.us-west-1.amazonaws.com/prod" "$PATH" "$METHOD" "$PAYLOAD" "$CONTENT_TYPE"

echo "STEP 1b: Testing AWS API Gateway without /api prefix"
make_request "AWS API Gateway (no /api)" "https://vab90wx4u0.execute-api.us-west-1.amazonaws.com/prod" "${PATH#/api}" "$METHOD" "$PAYLOAD" "$CONTENT_TYPE"

# Step 2: Test Spring Cloud Gateway directly
echo "STEP 2: Testing Spring Cloud Gateway directly"
make_request "Spring Cloud Gateway (direct)" "http://13.52.157.48:8090" "$PATH" "$METHOD" "$PAYLOAD" "$CONTENT_TYPE"

echo "STEP 2b: Testing Spring Cloud Gateway without /api prefix"
make_request "Spring Cloud Gateway (no /api)" "http://13.52.157.48:8090" "${PATH#/api}" "$METHOD" "$PAYLOAD" "$CONTENT_TYPE"

# Step 3: Test Login Service directly with different path combinations
if [[ "$PATH" == "/api/login" || "$PATH" == "api/login" || "$PATH" == "login" ]]; then
  echo "STEP 3: Testing Login Service directly"
  make_request "Login Service (direct)" "$LOGIN_SERVICE" "login" "$METHOD" "$PAYLOAD" "$CONTENT_TYPE"
  
  echo "STEP 3b: Testing Login Service with /api prefix"
  make_request "Login Service (with /api)" "$LOGIN_SERVICE" "api/login" "$METHOD" "$PAYLOAD" "$CONTENT_TYPE"
fi

# Step 4: Check Eureka registration status
echo "STEP 4: Checking Eureka Service Registration"
echo "Checking if LOGIN-SERVICE is registered with Eureka..."
eureka_response=$(curl -s --connect-timeout $TIMEOUT --max-time $TIMEOUT http://13.52.157.48:8761/eureka/apps)
echo "Registered services:"
echo "$eureka_response" | grep -o '<app>.*</app>' | sed 's/<app>\(.*\)<\/app>/\1/'
echo ""

# Step 5: Check service health
echo "STEP 5: Checking Service Health"
echo "Spring Cloud Gateway health:"
curl -s --connect-timeout $TIMEOUT --max-time $TIMEOUT http://13.52.157.48:8090/actuator/health | grep -o '"status":"[^"]*"'
echo ""
echo "Login Service health:"
curl -s --connect-timeout $TIMEOUT --max-time $TIMEOUT http://13.52.157.48:8081/actuator/health | grep -o '"status":"[^"]*"'
echo ""

echo "=== Trace Complete ==="
echo "If you see different responses at different levels, check the configuration at each level."
echo "If a service returns an error, check the logs for that specific service."
