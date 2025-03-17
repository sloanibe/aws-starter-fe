#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Get MongoDB instance ID
MONGO_ID=$(aws ec2 describe-instances \
  --filters "Name=tag:Name,Values=aws-starter-mongodb" "Name=instance-state-name,Values=running" \
  --query 'Reservations[0].Instances[0].InstanceId' \
  --output text)

echo -e "${YELLOW}Checking MongoDB Metrics...${NC}"

# Check CPU Usage
echo -e "\n${YELLOW}CPU Usage (last hour):${NC}"
aws cloudwatch get-metric-statistics \
  --namespace AWS/EC2 \
  --metric-name CPUUtilization \
  --dimensions Name=InstanceId,Value=$MONGO_ID \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Average \
  --query 'Datapoints[*].[Timestamp,Average]' \
  --output table

# Check Memory Usage
echo -e "\n${YELLOW}Memory Usage (last hour):${NC}"
aws cloudwatch get-metric-statistics \
  --namespace CWAgent \
  --metric-name mem_used_percent \
  --dimensions Name=InstanceId,Value=$MONGO_ID \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Average \
  --query 'Datapoints[*].[Timestamp,Average]' \
  --output table

# Check Disk Usage
echo -e "\n${YELLOW}Disk Usage (last hour):${NC}"
aws cloudwatch get-metric-statistics \
  --namespace CWAgent \
  --metric-name disk_used_percent \
  --dimensions Name=InstanceId,Value=$MONGO_ID \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Average \
  --query 'Datapoints[*].[Timestamp,Average]' \
  --output table

# Check Alarms
echo -e "\n${YELLOW}CloudWatch Alarms:${NC}"
aws cloudwatch describe-alarms \
  --alarm-names MongoDBCPUAlarm MongoDBMemoryAlarm \
  --query 'MetricAlarms[*].[AlarmName,StateValue]' \
  --output table

echo -e "\n${GREEN}Metrics check complete!${NC}"
