# SSH Access Guide

## Key File Information
- **Key Name**: `aws-starter-mongo-key.pem`
- **Local Location**: `/home/msloan/aws-starter-mongo-key.pem`
- **Windows WSL Path**: `\\wsl.localhost\Ubuntu-22.04\home\msloan\aws-starter-mongo-key.pem`

## EC2 Instance Details
- **Domain**: sloandev.net
- **MongoDB Access**: mongodb.sloandev.net
- **API Access**: api.sloandev.net
- **Username**: ubuntu
- **Instance ID**: i-01d80332e1a5ef33f
- **Instance Name**: MongoDB-New-Instance

## SSH Commands

### Basic SSH Connection
```bash
# Connect to EC2 instance
ssh -i /home/msloan/aws-starter-mongo-key.pem ubuntu@sloandev.net

# With verbose logging for troubleshooting
ssh -vvv -i /home/msloan/aws-starter-mongo-key.pem ubuntu@sloandev.net
```

### File Transfer Commands
```bash
# Copy file to EC2 using scp
scp -i /home/msloan/aws-starter-mongo-key.pem local_file.txt ubuntu@sloandev.net:/home/ubuntu/

# Sync files using rsync (more efficient)
rsync -avz --progress -e "ssh -i /home/msloan/aws-starter-mongo-key.pem" local_directory/ ubuntu@sloandev.net:/home/ubuntu/remote_directory/
```

### Common SSH Options
```bash
# Check instance uptime
ssh -i /home/msloan/aws-starter-mongo-key.pem ubuntu@sloandev.net 'uptime'

# Run multiple commands
ssh -i /home/msloan/aws-starter-mongo-key.pem ubuntu@sloandev.net 'pwd && ls -la'

# Start an application
ssh -i /home/msloan/aws-starter-mongo-key.pem ubuntu@sloandev.net 'cd /home/ubuntu/app && java -jar app.jar'
```

## MongoDB Connection
To connect to MongoDB using MongoDB Compass:
```
mongodb://mongodb.sloandev.net:27017
```

## Security Best Practices
1. Keep your key file secure and never share it
2. Set proper permissions on your key file: `chmod 400 aws-starter-mongo-key.pem`
3. Use specific security group rules for SSH access (port 22)
4. Consider using SSH config file for easier access

## Troubleshooting
If SSH connection fails:
1. Check if the instance is running
2. Verify security group allows SSH access
3. Ensure key file has correct permissions
4. Use verbose mode (-vvv) to debug connection issues
5. Confirm you're using the correct username (ubuntu)
6. Verify DNS resolution: `nslookup sloandev.net`

## AWS CLI Commands for Instance Management
```bash
# Check instance status
aws ec2 describe-instance-status --instance-ids i-01d80332e1a5ef33f

# Get instance information
aws ec2 describe-instances --instance-ids i-01d80332e1a5ef33f

# Reboot instance if needed
aws ec2 reboot-instances --instance-ids i-01d80332e1a5ef33f
