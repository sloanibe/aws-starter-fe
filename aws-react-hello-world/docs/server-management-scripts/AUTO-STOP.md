# EC2 Auto-Stop Functionality

This document explains the auto-stop functionality that automatically starts and stops EC2 instances based on a schedule to save costs.

## Overview

The auto-stop functionality uses AWS EventBridge and Lambda functions to automatically:
- **Stop** EC2 instances tagged with `AutoStop: true` at 11:30 PM PST
- **Start** these instances at 7:30 AM PST

This helps reduce costs by ensuring instances aren't running when they're not needed.

## Components

The auto-stop functionality consists of:

1. **IAM Role**: Allows EventBridge to invoke Lambda functions
2. **Lambda Functions**:
   - `StopEC2Instances`: Stops EC2 instances tagged with `AutoStop: true`
   - `StartEC2Instances`: Starts EC2 instances tagged with `AutoStop: true`
3. **EventBridge Rules**:
   - Rule to trigger the stop function at 11:30 PM PST
   - Rule to trigger the start function at 7:30 AM PST

## Setup and Management

### Deploying Auto-Stop Functionality

Using `manage-aws.sh`:
```bash
./scripts/aws/manage-aws.sh deploy --service=auto-stop
```

Using the dedicated setup script:
```bash
./scripts/aws/setup-auto-stop.sh
```

### Checking Status

```bash
./scripts/aws/manage-aws.sh status --service=auto-stop
```

This will show:
- CloudFormation stack status
- EventBridge rules and their schedules

### Updating Schedule

To change the schedule, you can:

1. Edit the CloudFormation template at `/infrastructure/cloudformation/auto-stop-lambda.yml`
2. Update the `ScheduleExpression` parameters for both rules
3. Deploy the changes:
   ```bash
   ./scripts/aws/manage-aws.sh update --service=auto-stop
   ```

Alternatively, use the setup script with custom times:
```bash
./scripts/aws/setup-auto-stop.sh --stop-time=22:00 --start-time=08:00
```

### Disabling Auto-Stop

To temporarily disable auto-stop without deleting it:

```bash
# Get the rule ARNs
STOP_RULE=$(aws events list-rules --name-prefix "StopEC2" --query "Rules[0].Name" --output text)
START_RULE=$(aws events list-rules --name-prefix "StartEC2" --query "Rules[0].Name" --output text)

# Disable the rules
aws events disable-rule --name "$STOP_RULE"
aws events disable-rule --name "$START_RULE"
```

To re-enable:
```bash
aws events enable-rule --name "$STOP_RULE"
aws events enable-rule --name "$START_RULE"
```

### Removing Auto-Stop

```bash
./scripts/aws/manage-aws.sh delete --service=auto-stop
```

## Tagging Instances

For an EC2 instance to be managed by the auto-stop functionality, it must have the tag:
```
AutoStop: true
```

The CloudFormation template in `aws-infrastructure-combined.yml` already adds this tag to your instances.

## Manual Override

If you need to start or stop instances outside the scheduled times, use:

```bash
# Start instances manually
./scripts/server/ec2-instances.sh start

# Stop instances manually
./scripts/server/ec2-instances.sh stop
```

This won't affect the scheduled auto-stop functionality.
