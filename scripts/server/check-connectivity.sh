#!/bin/bash

# Script to check if an EC2 instance is actually reachable
# Usage: ./check-connectivity.sh <ip_address>

IP_ADDRESS=$1

if [ -z "$IP_ADDRESS" ]; then
  echo "Error: IP address required"
  echo "Usage: ./check-connectivity.sh <ip_address>"
  exit 1
fi

# Try to ping the instance
echo "Checking connectivity to $IP_ADDRESS..."
ping -c 1 -W 2 "$IP_ADDRESS" > /dev/null 2>&1
PING_RESULT=$?

if [ $PING_RESULT -eq 0 ]; then
  echo "REACHABLE"
  exit 0
else
  echo "UNREACHABLE"
  exit 1
fi
