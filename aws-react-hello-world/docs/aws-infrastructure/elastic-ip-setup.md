# Elastic IP Setup

This document explains how Elastic IP addressing is used in the AWS Starter Project to provide stable addressing for the backend API.

## Overview

When an EC2 instance is stopped and started, it typically receives a new public IP address. This can cause issues with DNS records and application connectivity. To solve this problem, we use an Elastic IP address, which remains associated with your AWS account until you release it.

## Benefits of Elastic IP

1. **Stable Addressing**: The IP address remains the same even when the EC2 instance is stopped and started
2. **DNS Stability**: No need to update DNS records when restarting instances
3. **Application Reliability**: Frontend can reliably connect to backend without interruption
4. **Simplified Maintenance**: Easier to manage firewall rules and whitelists

## Implementation

We implemented Elastic IP for the backend API using the following steps:

### 1. Allocate an Elastic IP

```bash
aws ec2 allocate-address --domain vpc --region us-west-1
```

This command allocates a new Elastic IP address in the us-west-1 region and returns details including:
- PublicIp: The allocated IP address
- AllocationId: A unique identifier for the allocation

### 2. Associate the Elastic IP with an EC2 Instance

```bash
aws ec2 associate-address --allocation-id eipalloc-032910ce9c651bf52 --instance-id i-00c601082fcb6bec1 --region us-west-1
```

This command associates the allocated Elastic IP with a specific EC2 instance.

### 3. Update DNS Records

After associating the Elastic IP, we updated the DNS record for api.sloandev.net to point to this new stable IP address:

```bash
aws route53 change-resource-record-sets \
    --hosted-zone-id Z03563681XDZ1U0VJCB9P \
    --change-batch '{
      "Changes": [
        {
          "Action": "UPSERT",
          "ResourceRecordSet": {
            "Name": "api.sloandev.net",
            "Type": "A",
            "TTL": 300,
            "ResourceRecords": [
              {
                "Value": "13.52.157.48"
              }
            ]
          }
        }
      ]
    }'
```

## Troubleshooting

If you encounter issues with Elastic IP:

1. **Check Association**: Verify that the Elastic IP is correctly associated with your instance
   ```bash
   aws ec2 describe-addresses --region us-west-1
   ```

2. **Verify DNS**: Check that your DNS records are pointing to the Elastic IP
   ```bash
   nslookup api.sloandev.net
   ```

3. **Security Groups**: Ensure that your security groups allow traffic to the required ports

## Cost Considerations

Elastic IPs are free when:
- They are associated with a running EC2 instance
- You have only one Elastic IP per running instance

You are charged for Elastic IPs that are allocated but not associated with a running instance.

## Best Practices

1. **Use DNS Names**: Always reference your services by DNS names rather than IP addresses
2. **Limit Elastic IP Usage**: Only use Elastic IPs where necessary
3. **Release Unused IPs**: To avoid charges, release Elastic IPs you no longer need
4. **Document IP Assignments**: Keep track of which Elastic IPs are assigned to which services
