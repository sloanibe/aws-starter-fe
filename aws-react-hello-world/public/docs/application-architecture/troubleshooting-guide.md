# Troubleshooting Guide

This document provides solutions for common issues you might encounter with the AWS Starter Project.

## Frontend Issues

### Mixed Content Warnings

**Problem**: Browser console shows mixed content warnings when the frontend tries to load resources over HTTP from an HTTPS page.

**Solution**:
1. Ensure all API endpoints use HTTPS instead of HTTP
2. Update the API_BASE_URL in App.tsx:
   ```typescript
   const API_BASE_URL = 'https://api.sloandev.net';
   ```
3. Redeploy the frontend

### CloudFront Cache Issues

**Problem**: Updates to the frontend are not visible after deployment.

**Solution**:
1. Invalidate the CloudFront cache:
   ```bash
   aws cloudfront create-invalidation --distribution-id E3HMJW9ME79W32 --paths "/*"
   ```
2. Clear your browser cache
3. Wait a few minutes for the invalidation to propagate

## Backend Issues

### API Not Accessible

**Problem**: The backend API at api.sloandev.net is not accessible.

**Solution**:
1. Check if the EC2 instance is running:
   ```bash
   aws ec2 describe-instances --filters "Name=ip-address,Values=13.52.157.48" --query "Reservations[0].Instances[0].State.Name"
   ```
2. Verify security group settings allow traffic on ports 80, 443, and 8080
3. Check if Nginx is running:
   ```bash
   ssh ec2-user@api.sloandev.net "sudo systemctl status nginx"
   ```
4. Check if the Spring Boot application is running:
   ```bash
   ssh ec2-user@api.sloandev.net "sudo systemctl status spring-boot-app"
   ```

### HTTPS Not Working

**Problem**: HTTPS requests to the backend API fail.

**Solution**:
1. Verify port 443 is open in the EC2 security group:
   ```bash
   aws ec2 describe-security-groups --group-ids sg-YOUR_GROUP_ID --query "SecurityGroups[0].IpPermissions[?ToPort==\`443\`]"
   ```
2. Check Nginx SSL configuration:
   ```bash
   ssh ec2-user@api.sloandev.net "sudo nginx -t"
   ```
3. Verify SSL certificate is valid:
   ```bash
   ssh ec2-user@api.sloandev.net "sudo certbot certificates"
   ```

## DNS Issues

### DNS Resolution Problems

**Problem**: Domain name doesn't resolve to the correct IP address after EC2 restart.

**Solution**:
1. Use Elastic IP to maintain a stable IP address
2. Update DNS records if the IP address has changed:
   ```bash
   aws route53 change-resource-record-sets --hosted-zone-id YOUR_ZONE_ID --change-batch file://update-dns.json
   ```
3. Check current DNS resolution:
   ```bash
   nslookup api.sloandev.net
   ```

## EC2 Instance Issues

### Instance Stops Unexpectedly

**Problem**: EC2 instance stops unexpectedly.

**Solution**:
1. Check CloudWatch logs for shutdown events
2. Verify instance is not part of an auto-scaling group with scale-in policies
3. Check if instance is configured for automatic shutdown

### Cannot Connect to Instance

**Problem**: Unable to SSH into the EC2 instance.

**Solution**:
1. Verify security group allows SSH (port 22)
2. Check if the instance is running
3. Verify you're using the correct key pair
4. Check if the instance has a public IP address

## Database Issues

### MongoDB Connection Problems

**Problem**: Spring Boot application cannot connect to MongoDB.

**Solution**:
1. Check if MongoDB service is running:
   ```bash
   ssh ec2-user@api.sloandev.net "sudo systemctl status mongod"
   ```
2. Verify MongoDB connection string in application.yml
3. Check MongoDB logs for errors:
   ```bash
   ssh ec2-user@api.sloandev.net "sudo journalctl -u mongod"
   ```

## Deployment Issues

### Frontend Deployment Fails

**Problem**: Frontend deployment script fails.

**Solution**:
1. Check AWS CLI credentials are configured correctly
2. Verify S3 bucket permissions
3. Check for build errors in the React application

### Backend Deployment Fails

**Problem**: Backend deployment script fails.

**Solution**:
1. Verify SSH connectivity to the EC2 instance
2. Check if the Spring Boot build succeeds locally
3. Verify permissions for restarting the service on the EC2 instance
