# AWS S3 Static Website with CloudFront and Custom Domain Setup

This document outlines the complete process of setting up an S3 bucket for static website hosting, configuring CloudFront for content delivery, and setting up a custom domain with SSL/TLS.

## 1. S3 Bucket Setup

### 1.1. Create the S3 Bucket
```bash
aws s3api create-bucket \
    --bucket aws-starter-app \
    --region us-west-1 \
    --create-bucket-configuration LocationConstraint=us-west-1
```

### 1.2. Enable Static Website Hosting
```bash
aws s3api put-bucket-website \
    --bucket aws-starter-app \
    --website-configuration '{
        "IndexDocument": {"Suffix": "index.html"},
        "ErrorDocument": {"Key": "index.html"}
    }'
```

### 1.3. Configure Public Access
```bash
aws s3api put-public-access-block \
    --bucket aws-starter-app \
    --public-access-block-configuration \
    "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"
```

### 1.4. Add Bucket Policy for Public Read Access
```bash
aws s3api put-bucket-policy \
    --bucket aws-starter-app \
    --policy '{
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "PublicReadGetObject",
                "Effect": "Allow",
                "Principal": "*",
                "Action": "s3:GetObject",
                "Resource": "arn:aws:s3:::aws-starter-app/*"
            }
        ]
    }'
```

## 2. SSL Certificate Setup

### 2.1. Request ACM Certificate
```bash
aws acm request-certificate \
    --domain-name sloandev.net \
    --validation-method DNS \
    --region us-east-1 \
    --subject-alternative-names "*.sloandev.net"
```

### 2.2. Add DNS Validation Records
```bash
aws route53 change-resource-record-sets \
    --hosted-zone-id Z03563681XDZ1U0VJCB9P \
    --change-batch '{
        "Changes": [
            {
                "Action": "UPSERT",
                "ResourceRecordSet": {
                    "Name": "_45552f473849bbfa7023d532d97e94b4.sloandev.net",
                    "Type": "CNAME",
                    "TTL": 300,
                    "ResourceRecords": [
                        {
                            "Value": "_352af3bdd61eb191c04efe74ca5353f6.zfyfvmchrl.acm-validations.aws"
                        }
                    ]
                }
            }
        ]
    }'
```

## 3. CloudFront Distribution Setup

### 3.1. Create CloudFront Distribution
```bash
aws cloudfront create-distribution \
    --distribution-config '{
        "CallerReference": "aws-starter-app-distribution",
        "Aliases": {
            "Quantity": 2,
            "Items": ["sloandev.net", "www.sloandev.net"]
        },
        "DefaultRootObject": "index.html",
        "Origins": {
            "Quantity": 1,
            "Items": [
                {
                    "Id": "S3-aws-starter-app",
                    "DomainName": "aws-starter-app.s3-website-us-west-1.amazonaws.com",
                    "CustomOriginConfig": {
                        "HTTPPort": 80,
                        "HTTPSPort": 443,
                        "OriginProtocolPolicy": "http-only",
                        "OriginSslProtocols": {
                            "Quantity": 1,
                            "Items": ["TLSv1.2"]
                        },
                        "OriginReadTimeout": 30,
                        "OriginKeepaliveTimeout": 5
                    }
                }
            ]
        },
        "DefaultCacheBehavior": {
            "TargetOriginId": "S3-aws-starter-app",
            "ViewerProtocolPolicy": "redirect-to-https",
            "AllowedMethods": {
                "Quantity": 2,
                "Items": ["HEAD", "GET"],
                "CachedMethods": {
                    "Quantity": 2,
                    "Items": ["HEAD", "GET"]
                }
            },
            "Compress": true,
            "DefaultTTL": 86400,
            "MinTTL": 0,
            "MaxTTL": 31536000,
            "ForwardedValues": {
                "QueryString": false,
                "Cookies": {
                    "Forward": "none"
                }
            }
        },
        "CustomErrorResponses": {
            "Quantity": 1,
            "Items": [
                {
                    "ErrorCode": 404,
                    "ResponsePagePath": "/index.html",
                    "ResponseCode": "200",
                    "ErrorCachingMinTTL": 300
                }
            ]
        },
        "Comment": "Distribution for aws-starter-app",
        "Enabled": true,
        "ViewerCertificate": {
            "ACMCertificateArn": "arn:aws:acm:us-east-1:076034795794:certificate/d58da656-ef77-4dd0-bea6-0281c07c8cec",
            "SSLSupportMethod": "sni-only",
            "MinimumProtocolVersion": "TLSv1.2_2021"
        },
        "HttpVersion": "http2",
        "PriceClass": "PriceClass_100"
    }'
```

Key CloudFront Configuration Details:
- Uses the S3 website endpoint as origin
- Redirects HTTP to HTTPS
- Compresses content
- Serves index.html for 404s (for SPA routing)
- Uses TLS 1.2
- Price Class 100 (US, Canada, Europe)

## 4. Route 53 DNS Setup

### 4.1. Add DNS Records for CloudFront
```bash
aws route53 change-resource-record-sets \
    --hosted-zone-id Z03563681XDZ1U0VJCB9P \
    --change-batch '{
        "Changes": [
            {
                "Action": "UPSERT",
                "ResourceRecordSet": {
                    "Name": "sloandev.net",
                    "Type": "A",
                    "AliasTarget": {
                        "HostedZoneId": "Z2FDTNDATAQYW2",
                        "DNSName": "d23g2ah1oukxrw.cloudfront.net",
                        "EvaluateTargetHealth": false
                    }
                }
            },
            {
                "Action": "UPSERT",
                "ResourceRecordSet": {
                    "Name": "www.sloandev.net",
                    "Type": "A",
                    "AliasTarget": {
                        "HostedZoneId": "Z2FDTNDATAQYW2",
                        "DNSName": "d23g2ah1oukxrw.cloudfront.net",
                        "EvaluateTargetHealth": false
                    }
                }
            }
        ]
    }'
```

## 5. Final Configuration Details

### 5.1. S3 Bucket
- Name: `aws-starter-app`
- Region: us-west-1
- Website Endpoint: http://aws-starter-app.s3-website-us-west-1.amazonaws.com

### 5.2. CloudFront Distribution
- Distribution ID: E3HMJW9ME79W32
- Domain Name: d23g2ah1oukxrw.cloudfront.net
- SSL Certificate: Covers both sloandev.net and *.sloandev.net
- Origins: S3 website endpoint
- Custom Error Pages: 404 → /index.html

### 5.3. Domain Names
- Primary Domain: https://sloandev.net
- WWW Domain: https://www.sloandev.net
- Both domains are configured with SSL/TLS
- Both domains redirect HTTP to HTTPS

## 6. Important Notes

1. **SSL Certificate Validation**:
   - Can take 15-30 minutes to complete
   - Requires DNS validation records to be properly propagated

2. **CloudFront Distribution**:
   - Initial creation takes 15-30 minutes
   - Changes to the distribution can take 10-15 minutes to propagate

3. **DNS Propagation**:
   - Can take up to 48 hours to fully propagate globally
   - Most users will see the changes within 15-60 minutes

4. **S3 Bucket Policy**:
   - Allows public read access to all objects
   - Required for static website hosting
   - Secured by CloudFront distribution

5. **Cache Behavior**:
   - Default TTL: 24 hours (86400 seconds)
   - Maximum TTL: 365 days (31536000 seconds)
   - Minimum TTL: 0 seconds

## 7. Maintenance and Updates

To update the website content:
1. Build your React application
2. Upload the built files to the S3 bucket
3. If needed, create an invalidation in CloudFront to clear the cache

To modify the CloudFront settings:
1. Update the distribution configuration
2. Wait for changes to propagate (10-15 minutes)

To update SSL certificates:
1. Request a new certificate in ACM
2. Update the CloudFront distribution to use the new certificate
3. Wait for the old certificate to expire before deleting it
