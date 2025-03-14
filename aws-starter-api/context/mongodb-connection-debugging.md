# MongoDB Connection Debugging Notes

## Current Setup

### MongoDB Instance Details
- **Host**: 3.101.153.60 (sloandev.net)
- **Port**: 27017
- **Database**: aws_starter_db
- **Instance ID**: i-01d80332e1a5ef33f
- **Instance Name**: MongoDB-New-Instance

### Spring Boot Configuration
```yaml
spring:
  data:
    mongodb:
      uri: mongodb://3.101.153.60:27017/aws_starter_db
      database: aws_starter_db
```

## Connection Status

### Network Accessibility
- Port 27017 is accessible (confirmed via `nc -zv 3.101.153.60 27017`)
- MongoDB server is listening on all interfaces (`0.0.0.0:27017`)
- Active connections observed from client IP (47.147.63.102)

### Security Group Configuration
- Security Group ID: sg-017c4ee6cb0beccdb
- Name: CoreStack-TaskerSecurityGroup-SdXLoaoAO8gu
- Inbound rules for port 27017:
  1. Allow from 47.147.63.102/32
  2. Allow from 10.0.0.86/32

### MongoDB Server Status
- Service is running (PID 7542)
- User: mongodb
- Listening on all interfaces
- Authorization is disabled in config
- Has established connections (seen in `lsof` output)

## Current Issues

### Connection Behavior
1. TCP connection establishes successfully
2. Initial handshake with MongoDB server works (server version 6.0.20 reported)
3. Connection hangs after initial handshake
4. Spring Boot application shows similar connection issues

### Server Warnings
1. XFS filesystem warning
2. vm.max_map_count warning (fixed by setting to 262144)

### Attempted Solutions
1. Restarted MongoDB service
2. Updated vm.max_map_count
3. Tried various connection string parameters:
   - directConnection=true
   - retryWrites=false
   - connectTimeoutMS=5000
   - serverSelectionTimeoutMS=5000

## Next Steps for Investigation

1. **DNS Resolution**
   - Verify DNS resolution for mongodb.sloandev.net
   - Check for potential DNS-related timeouts

2. **MongoDB Configuration**
   - Review complete MongoDB configuration
   - Check for any connection pooling issues
   - Investigate potential authentication mechanisms

3. **Network Analysis**
   - Perform packet capture to analyze connection hang
   - Check for any TCP keepalive issues
   - Verify no middleware blocking connections

4. **Application Logs**
   - Need to gather Spring Boot application logs
   - Check MongoDB server logs for connection errors
   - Monitor system resources during connection attempts

5. **Alternative Approaches**
   - Try connecting through MongoDB Compass
   - Test with different MongoDB driver versions
   - Consider using connection string with authentication

## Related Files
- `/etc/mongod.conf` - MongoDB configuration
- `application.yml` - Spring Boot configuration
- AWS security group configuration

## Commands for Further Debugging
```bash
# Check MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log

# Monitor connections
sudo lsof -i :27017

# Test DNS resolution
nslookup mongodb.sloandev.net

# Check MongoDB status
sudo systemctl status mongod

# Monitor system resources
top -c
```
