#!/bin/bash

# Script to set up automatic stopping of EC2 instances
# Usage: ./setup-auto-stop.sh [--stop-time=20:00] [--start-time=08:00]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
CONFIG_DIR="$PROJECT_ROOT/infrastructure/config"

# Default values
STOP_TIME="20:00"
START_TIME="08:00"
ROLE_NAME="EC2AutoStopRole"
STOP_RULE_NAME="StopEC2Instances"
START_RULE_NAME="StartEC2Instances"

# Parse arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --stop-time=*) STOP_TIME="${1#*=}" ;;
        --start-time=*) START_TIME="${1#*=}" ;;
        *) echo "Unknown parameter: $1"; exit 1 ;;
    esac
    shift
done

# Convert times to cron expressions (UTC)
# Note: AWS EventBridge uses UTC time, so adjust accordingly
STOP_HOUR=$(TZ=UTC date -d "$STOP_TIME" +"%H")
STOP_MINUTE=$(TZ=UTC date -d "$STOP_TIME" +"%M")
START_HOUR=$(TZ=UTC date -d "$START_TIME" +"%H")
START_MINUTE=$(TZ=UTC date -d "$START_TIME" +"%M")

STOP_CRON="cron($STOP_MINUTE $STOP_HOUR * * ? *)"
START_CRON="cron($START_MINUTE $START_HOUR * * ? *)"

echo "Setting up EC2 auto-stop functionality..."

# Check if role exists, create if it doesn't
ROLE_ARN=$(aws iam list-roles --query "Roles[?RoleName=='$ROLE_NAME'].Arn" --output text)

if [ -z "$ROLE_ARN" ]; then
    echo "Creating IAM role for EC2 auto-stop..."
    
    # Create role using the trust policy
    aws iam create-role \
        --role-name "$ROLE_NAME" \
        --assume-role-policy-document file://"$CONFIG_DIR/auto-stop-role.json"
    
    # Attach policy to allow stopping/starting EC2 instances
    aws iam put-role-policy \
        --role-name "$ROLE_NAME" \
        --policy-name "EC2StopStartPolicy" \
        --policy-document '{
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Effect": "Allow",
                    "Action": [
                        "ec2:StopInstances",
                        "ec2:StartInstances",
                        "ec2:DescribeInstances"
                    ],
                    "Resource": "*"
                }
            ]
        }'
    
    ROLE_ARN=$(aws iam get-role --role-name "$ROLE_NAME" --query "Role.Arn" --output text)
    echo "Created role with ARN: $ROLE_ARN"
else
    echo "Using existing role with ARN: $ROLE_ARN"
fi

# Create/update stop rule
echo "Setting up EventBridge rule to stop instances at $STOP_TIME..."
aws events put-rule \
    --name "$STOP_RULE_NAME" \
    --schedule-expression "$STOP_CRON" \
    --state ENABLED \
    --description "Automatically stop EC2 instances tagged with AutoStop=true"

# Create/update start rule
echo "Setting up EventBridge rule to start instances at $START_TIME..."
aws events put-rule \
    --name "$START_RULE_NAME" \
    --schedule-expression "$START_CRON" \
    --state ENABLED \
    --description "Automatically start EC2 instances tagged with AutoStop=true"

# Create target for stop rule
echo "Setting up target for stop rule..."
aws events put-targets \
    --rule "$STOP_RULE_NAME" \
    --targets '[
        {
            "Id": "1",
            "Arn": "arn:aws:lambda:us-west-1:076034795794:function:StopEC2Instances",
            "RoleArn": "'"$ROLE_ARN"'"
        }
    ]'

# Create target for start rule
echo "Setting up target for start rule..."
aws events put-targets \
    --rule "$START_RULE_NAME" \
    --targets '[
        {
            "Id": "1",
            "Arn": "arn:aws:lambda:us-west-1:076034795794:function:StartEC2Instances",
            "RoleArn": "'"$ROLE_ARN"'"
        }
    ]'

echo "✅ Auto-stop functionality set up successfully!"
echo "EC2 instances tagged with AutoStop=true will:"
echo "  - Stop automatically at $STOP_TIME local time"
echo "  - Start automatically at $START_TIME local time"
echo ""
echo "To test this functionality:"
echo "  aws events test-event-pattern --event-pattern '{\"source\":[\"aws.ec2\"]}' --event '{\"source\":\"aws.ec2\"}'"
