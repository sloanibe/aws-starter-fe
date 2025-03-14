# AWS DNS and Domain Setup Tutorial

## Introduction
This tutorial explains how to set up domain names for your AWS EC2 instance using Route 53. We'll cover everything from basic DNS concepts to practical implementation using AWS CLI.

## Prerequisites
- An AWS account
- AWS CLI installed and configured
- An EC2 instance running (in our case: i-01d80332e1a5ef33f)
- A registered domain (in our case: sloandev.net)

## Basic Concepts

### What is DNS?
DNS (Domain Name System) is like a phone book for the internet. Instead of remembering IP addresses (like 3.101.153.60), we can use friendly names (like sloandev.net).

### What is Route 53?
Route 53 is AWS's DNS service. It helps:
1. Register domain names
2. Route internet traffic to your AWS resources
3. Check the health of your resources

### Record Types
- **A Record**: Maps a domain name to an IPv4 address
- **CNAME**: Maps one domain name to another
- **MX**: For email routing
- **TXT**: For verification and SPF records

## Our Setup

### Goal
We wanted to set up:
1. `sloandev.net` for SSH access
2. `mongodb.sloandev.net` for database connections
3. `api.sloandev.net` for our REST API

### Step-by-Step Implementation

#### 1. Check Existing Route 53 Configuration
```bash
# List hosted zones
aws route53 list-hosted-zones

# Output explained:
{
    "HostedZones": [{
        "Id": "/hostedzone/Z03563681XDZ1U0VJCB9P",  # Unique identifier for your domain
        "Name": "sloandev.net.",                     # Your domain name
        "Config": {
            "PrivateZone": false                     # Public zone, accessible from internet
        }
    }]
}
```

#### 2. Create DNS Records
We created a JSON file (dns-records.json) to define our records:
```json
{
    "Changes": [
        {
            "Action": "UPSERT",         # Create or update existing record
            "ResourceRecordSet": {
                "Name": "sloandev.net", # Main domain
                "Type": "A",            # A record = IPv4 address
                "TTL": 300,             # Time-to-live in seconds
                "ResourceRecords": [
                    {
                        "Value": "3.101.153.60" # Your EC2 IP
                    }
                ]
            }
        },
        // Similar records for mongodb. and api. subdomains
    ]
}
```

#### 3. Apply DNS Changes
```bash
# Apply the changes to Route 53
aws route53 change-resource-record-sets \
    --hosted-zone-id Z03563681XDZ1U0VJCB9P \
    --change-batch file://dns-records.json

# Output explained:
{
    "ChangeInfo": {
        "Id": "/change/C07522512RQ6BFP4GKTCJ",  # Unique change ID
        "Status": "PENDING",                     # Changes are processing
        "SubmittedAt": "2025-02-01T20:36:28.144Z"
    }
}
```

## How It All Works

1. **DNS Resolution Flow**:
   ```
   User types sloandev.net
   → DNS query to Route 53
   → Route 53 returns 3.101.153.60
   → Traffic reaches your EC2 instance
   ```

2. **Subdomain Resolution**:
   ```
   User connects to mongodb.sloandev.net
   → DNS query to Route 53
   → Route 53 returns same IP (3.101.153.60)
   → Traffic reaches EC2 on port 27017 (MongoDB)
   ```

## Security Considerations

1. **TTL (Time-to-Live)**:
   - We set TTL to 300 seconds (5 minutes)
   - Lower TTL = Faster DNS changes but more DNS queries
   - Higher TTL = Better caching but slower changes

2. **Security Groups**:
   - Configure different rules for different subdomains
   - SSH (22) for sloandev.net
   - MongoDB (27017) for mongodb.sloandev.net
   - HTTP/HTTPS (80/443) for api.sloandev.net

## Testing DNS Setup

1. **Check DNS Propagation**:
   ```bash
   # Check main domain
   nslookup sloandev.net
   
   # Check subdomains
   nslookup mongodb.sloandev.net
   nslookup api.sloandev.net
   ```

2. **Test SSH Access**:
   ```bash
   ssh -i key.pem ubuntu@sloandev.net
   ```

3. **Test MongoDB Connection**:
   ```
   mongodb://mongodb.sloandev.net:27017
   ```

## Troubleshooting

1. **DNS Not Resolving**:
   - Check if changes are still PENDING
   - Verify correct hosted zone ID
   - Wait for TTL to expire

2. **Cannot Connect**:
   - Verify EC2 instance is running
   - Check security group rules
   - Verify IP address is correct

3. **View Route 53 Records**:
   ```bash
   aws route53 list-resource-record-sets \
       --hosted-zone-id Z03563681XDZ1U0VJCB9P
   ```

## Best Practices

1. **Domain Organization**:
   - Use subdomains for different services
   - Makes SSL certificate management easier
   - Allows for future service migration

2. **Monitoring**:
   - Set up Route 53 health checks
   - Monitor DNS resolution times
   - Keep DNS records updated

3. **Documentation**:
   - Keep DNS records documented
   - Document security group configurations
   - Maintain deployment scripts updated

## Future Improvements

1. **SSL Certificates**:
   - Add SSL using AWS Certificate Manager
   - Enable HTTPS for api.sloandev.net

2. **High Availability**:
   - Set up multiple EC2 instances
   - Use Route 53 weighted routing
   - Implement health checks

3. **Automation**:
   - Create CloudFormation template
   - Automate DNS updates
   - Implement CI/CD pipeline
