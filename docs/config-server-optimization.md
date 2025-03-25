# Config Server Optimization Guide

## Overview

This document details the optimization strategies implemented for the Config Server to ensure stable operation on a t2.small EC2 instance with limited memory resources (2GB RAM).

## Problem Statement

The Config Server was experiencing `OutOfMemoryError: Java heap space` errors when attempting to clone the configuration repository. This was due to:

1. Insufficient heap space allocation (initially set to 128MB)
2. Large repository size with build artifacts being cloned unnecessarily
3. Limited memory resources on the t2.small instance

## Solution Implementation

### 1. Memory Allocation Optimization

The heap space allocation was increased to provide adequate memory for repository cloning:

**Before:**
```
ExecStart=/usr/bin/java -Xmx128m -Xms64m ...
```

**After:**
```
ExecStart=/usr/bin/java -Xmx256m -Xms128m ...
```

This change doubled the maximum heap space and increased the initial heap allocation to ensure the Config Server has sufficient memory to handle repository cloning operations.

### 2. Repository Search Path Configuration

To prevent the Config Server from cloning unnecessary large files from the repository, a search path configuration was added:

```
-DSPRING_CLOUD_CONFIG_SERVER_GIT_SEARCH_PATHS=config-repo
```

This configuration directs the Config Server to only clone and monitor the `config-repo` directory within the repository, significantly reducing memory usage during the cloning process.

### 3. Systemd Service Configuration

The complete systemd service file with optimizations:

```
[Unit]
Description=Config Server Service
After=service-discovery.service
Requires=service-discovery.service

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/config-server-service
EnvironmentFile=/home/ubuntu/config-server-service/.env
ExecStart=/usr/bin/java -Xmx256m -Xms128m -DSPRING_CLOUD_CONFIG_SERVER_GIT_SEARCH_PATHS=config-repo -jar config-server-service.jar
SuccessExitStatus=143
TimeoutStopSec=10
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

## Monitoring and Verification

### Memory Usage Monitoring

To monitor the Config Server's memory usage:

```bash
ssh ubuntu@[EC2-IP] "ps -o pid,rss,command -p $(pgrep -f config-server)"
```

This command displays the resident set size (RSS) of the Config Server process, allowing you to track actual memory usage.

### Log Monitoring

To check for memory-related issues in the logs:

```bash
ssh ubuntu@[EC2-IP] "sudo journalctl -u config-server -n 100 | grep -i 'memory\|heap\|gc'"
```

### Repository Clone Verification

The Config Server clones the repository to a temporary directory in `/tmp`. The exact location follows this pattern:

```
/tmp/config-repo-[random-number]/config-repo
```

For example, during our troubleshooting, we found it at:

```
/tmp/config-repo-6660413371084940105/config-repo
```

To find the current location of the cloned repository:

```bash
ssh ubuntu@[EC2-IP] "find /tmp -name \"config-repo\" -type d"
```

This information is crucial for troubleshooting, as it allows you to:
1. Verify that the correct files are being cloned
2. Check the structure of the configuration files
3. Manually inspect configuration files if needed

## Best Practices for Config Server Management

### 1. Repository Structure

Maintain a clean repository structure with configuration files organized by service:

```
config-repo/
├── application.yml                 # Common configuration
├── service1/
│   └── service1.yml                # Service-specific configuration
├── service2/
│   └── service2.yml                # Service-specific configuration
```

### 2. Memory Tuning Guidelines

For t2.small instances (2GB RAM), follow these guidelines:

- Config Server: 256MB max heap
- Eureka Server: 256MB max heap
- API Gateway: 256MB max heap
- Application Services: 256-512MB max heap depending on load
- Total JVM memory should not exceed 1.5GB to leave room for the OS and MongoDB

### 3. Git Repository Maintenance

- Regularly clean up unnecessary files in the configuration repository
- Use `.gitignore` to exclude build artifacts and large binary files
- Consider using a dedicated repository for configurations only

## Troubleshooting Common Issues

### OutOfMemoryError Recurrence

If OutOfMemoryError issues recur despite the optimizations:

1. Increase heap space further if possible
2. Move to a larger instance type (t2.medium or higher)
3. Split services across multiple instances
4. Implement a more aggressive garbage collection strategy:
   ```
   -XX:+UseG1GC -XX:MaxGCPauseMillis=200
   ```

### Slow Repository Cloning

If repository cloning is still slow:

1. Use shallow cloning by setting:
   ```
   spring.cloud.config.server.git.cloneOnStart=false
   spring.cloud.config.server.git.depth=1
   ```
2. Consider using a local filesystem repository instead of Git for very resource-constrained environments

### Configuration Not Updating

If services are not picking up configuration changes:

1. Verify the Config Server is properly serving the updated configurations:
   ```
   curl http://localhost:8888/login-service/default
   ```
2. Ensure services are configured to refresh configurations:
   ```
   curl -X POST http://localhost:8081/actuator/refresh
   ```

## Conclusion

These optimizations have successfully resolved the memory issues with the Config Server, ensuring stable operation on the t2.small instance. The combination of increased heap space and targeted repository cloning has significantly reduced memory usage while maintaining full functionality.
