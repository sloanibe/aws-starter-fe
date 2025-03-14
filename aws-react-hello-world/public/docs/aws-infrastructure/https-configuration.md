# HTTPS Configuration

This document outlines how HTTPS was configured for secure communication between the React frontend and Spring Boot backend.

## Overview

Secure communication between the frontend and backend is essential for protecting data in transit. This project uses HTTPS for all communication between components:

- Frontend (sloandev.net) - Served via CloudFront with an SSL certificate
- Backend (api.sloandev.net) - Secured with Nginx as a reverse proxy handling SSL termination

## Frontend HTTPS Configuration

The frontend is served securely through CloudFront, which handles SSL termination:

1. SSL certificate is managed by AWS Certificate Manager (ACM)
2. CloudFront is configured to use this certificate
3. All HTTP requests are redirected to HTTPS via the CloudFront distribution settings

## Backend HTTPS Configuration

The backend API is secured using Nginx as a reverse proxy:

1. Nginx is installed on the EC2 instance alongside the Spring Boot application
2. Let's Encrypt is used to obtain and manage SSL certificates
3. Nginx handles SSL termination and forwards requests to the Spring Boot application

### Nginx Configuration

Nginx is configured to:
1. Listen on port 443 (HTTPS)
2. Use the SSL certificates from Let's Encrypt
3. Forward requests to the Spring Boot application running on port 8080

### Let's Encrypt Certificate

The SSL certificate for api.sloandev.net was obtained using Certbot:

```bash
sudo certbot --nginx -d api.sloandev.net
```

This command:
1. Verifies domain ownership
2. Obtains the certificate
3. Configures Nginx to use the certificate
4. Sets up automatic renewal

## Security Group Configuration

For HTTPS to work properly, the EC2 security group must allow inbound traffic on port 443:

```bash
aws ec2 authorize-security-group-ingress \
    --group-id sg-0123456789abcdef \
    --protocol tcp \
    --port 443 \
    --cidr 0.0.0.0/0
```

## Troubleshooting HTTPS Issues

When we encountered issues with HTTPS connectivity between the frontend and backend, we identified and fixed the following:

1. **Security Group Configuration**: Port 443 was not open in the EC2 security group, preventing HTTPS access to the API.
   - Solution: Added port 443 to the security group using AWS CLI.

2. **API Endpoint in React App**: The React app was using a direct IP address with HTTP.
   - Solution: Updated the API endpoint in the React app to use the secure HTTPS endpoint (https://api.sloandev.net).

3. **Mixed Content Warnings**: The browser was blocking mixed content (HTTP requests from an HTTPS page).
   - Solution: Ensuring all API calls use HTTPS eliminated these warnings.

## Best Practices

1. **Use Domain Names**: Always use domain names instead of IP addresses for better maintainability and security.
2. **Automatic Certificate Renewal**: Let's Encrypt certificates are configured to renew automatically.
3. **Redirect HTTP to HTTPS**: All HTTP traffic is automatically redirected to HTTPS.
4. **Regular Certificate Monitoring**: Monitor certificate expiration dates to avoid unexpected failures.
