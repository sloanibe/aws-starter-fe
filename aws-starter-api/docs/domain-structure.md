# Domain Structure

## Overview
Our application uses different subdomains for different services, utilizing AWS Route 53 for DNS management and various AWS services for hosting.

## Domain Layout

### Frontend (React Application)
- **www.sloandev.net**
  - Main website endpoint
  - Served via CloudFront distribution (d23g2ah1oukxrw.cloudfront.net)
  - Static content hosted on S3
  - Benefits from CloudFront's global CDN

### Backend Services
- **api.sloandev.net**
  - Spring Boot API endpoint
  - Hosted on t2.micro EC2 instance
  - Fixed Elastic IP: 54.215.190.170
  - Base URL: `https://api.sloandev.net`

- **mongodb.sloandev.net**
  - MongoDB database access point
  - Hosted on dedicated t2.micro EC2 instance
  - Fixed IP: 3.101.153.60
  - Connection string: `mongodb://mongodb.sloandev.net:27017`

### Root Domain
- **sloandev.net**
  - Currently points to MongoDB instance (3.101.153.60)
  - Consider redirecting to www.sloandev.net for consistency

## Network Configuration

### DNS Configuration (Route 53)
- Hosted Zone ID: Z03563681XDZ1U0VJCB9P
- TTL: 300 seconds
- Record Types: 
  - A records for api and mongodb subdomains
  - A record with Alias for www (CloudFront)

### AWS Resources
- VPC: tasker-vpc (10.0.0.0/16)
- Region: us-west-1
- Availability Zone: us-west-1b
- Security Groups:
  - CoreStack-TaskerSecurityGroup-SdXLoaoAO8gu (for SSH access)
  - Default VPC security group

## Security Considerations
- MongoDB port (27017) should only be accessible from whitelisted IPs
- API endpoint should use HTTPS in production
- SSH access should be restricted to specific IP ranges
- CloudFront provides DDoS protection for the frontend
- Elastic IP ensures stable API endpoint

## Future Improvements
1. Set up SSL certificates for all subdomains using AWS Certificate Manager
2. Implement API Gateway for api.sloandev.net
3. Consider using AWS ELB for high availability
4. Set up CloudWatch monitoring for all services
5. Implement automatic backups for MongoDB
6. Configure the root domain to redirect to www subdomain
