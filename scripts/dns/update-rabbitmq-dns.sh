#!/bin/bash
# Update DNS to create rabbitmq.sloandev.net subdomain

set -e

# Get the hosted zone ID for sloandev.net
HOSTED_ZONE_ID=$(aws route53 list-hosted-zones --query "HostedZones[?Name=='sloandev.net.'].Id" --output text | sed 's/\/hostedzone\///')

if [ -z "$HOSTED_ZONE_ID" ]; then
  echo "Error: Could not find hosted zone ID for sloandev.net"
  exit 1
fi

echo "Found hosted zone ID: $HOSTED_ZONE_ID"

# Apply the DNS change
echo "Applying DNS change for rabbitmq.sloandev.net..."
aws route53 change-resource-record-sets \
  --hosted-zone-id $HOSTED_ZONE_ID \
  --change-batch file:///home/msloan/gitprojects/aws-starter/rabbitmq-dns-change.json

echo "DNS change submitted successfully!"
echo "It may take a few minutes for the DNS change to propagate."
echo "Once propagated, RabbitMQ will be accessible at: rabbitmq.sloandev.net"
