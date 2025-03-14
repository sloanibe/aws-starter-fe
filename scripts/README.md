# AWS Environment Management Scripts

These scripts help manage your AWS development environment instances.

## Available Scripts

### start-aws-env.sh
Starts both the Spring Boot API and MongoDB instances:
```bash
./start-aws-env.sh
```

### stop-aws-env.sh
Stops both instances manually (useful for stopping before midnight):
```bash
./stop-aws-env.sh
```

## Instance Details
- Spring Boot API: i-0016ff996ce1dd7ea (api.sloandev.net)
- MongoDB: i-01d80332e1a5ef33f (mongodb.sloandev.net)

## Notes
- Instances will automatically stop at midnight Pacific time
- Wait 1-2 minutes after starting for all services to initialize
- The Elastic IPs remain associated even when instances are stopped
