#!/bin/bash

# This script sets up a simple HTTP server on port 8099 to capture and log
# incoming requests from the AWS API Gateway for debugging purposes

echo "Starting debug HTTP server on port 8099..."
echo "This will log all incoming requests from AWS API Gateway"
echo "Press Ctrl+C to stop"

# Create a temporary file to store the logs
LOG_FILE="/tmp/aws-gateway-debug.log"
echo "Logs will be written to $LOG_FILE"
echo "" > $LOG_FILE

# Function to handle incoming requests
handle_request() {
  echo -e "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n{\"status\":\"debug-success\"}" | nc -l -p 8099 > /tmp/request.tmp
  
  # Extract and log request details
  REQUEST=$(cat /tmp/request.tmp)
  TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
  
  echo "=== REQUEST RECEIVED AT $TIMESTAMP ===" >> $LOG_FILE
  echo "$REQUEST" >> $LOG_FILE
  echo "" >> $LOG_FILE
  
  # Also print to console
  echo "=== REQUEST RECEIVED AT $TIMESTAMP ==="
  echo "$REQUEST"
  echo ""
}

# Start the server loop
while true; do
  handle_request
done
