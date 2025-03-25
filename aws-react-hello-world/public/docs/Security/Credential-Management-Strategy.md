# Secure Credential Management Strategy

This document outlines our approach to managing secure credentials across our microservices architecture, with specific focus on the Spring Cloud Config Server implementation.

## Core Principles

1. **Separation of Concerns**: Credentials are kept separate from application code
2. **Least Privilege**: Services only have access to credentials they require
3. **Defense in Depth**: Multiple layers of protection for sensitive information
4. **Auditability**: Changes to credential handling can be tracked and reviewed

## Credential Management Approaches

### 1. Local Development Environment

For local development, we use:

- `.env` files excluded from git via `.gitignore`
- Environment variables set in IDE run configurations
- Default fallback values for non-sensitive configuration

### 2. EC2 Production Environment

For our EC2 instances, we implement a multi-layered approach:

#### 2.1 Service-Specific Environment Files

- Each service has its own `.env` file in its working directory
- Files are secured with `chmod 600` permissions (owner read/write only)
- Environment files are created during deployment and never committed to the repository

```bash
# Example secure .env file creation
ssh -i $SSH_KEY ubuntu@$EC2_IP "cat > /home/ubuntu/service-name/.env << EOF
API_KEY=your_api_key
DB_PASSWORD=your_db_password
EOF
chmod 600 /home/ubuntu/service-name/.env"
```

#### 2.2 systemd Service Integration

- systemd service files use `EnvironmentFile` directive to load credentials
- Variables are scoped only to the specific service process
- Not visible in system-wide environment listings

```ini
[Service]
EnvironmentFile=/home/ubuntu/service-name/.env
```

#### 2.3 Deployment Process Security

- Credentials are stored locally in a protected file on the developer machine
- Deployment scripts read these credentials and transfer them securely
- SSH with key authentication is used for all server access
- No credentials are stored in deployment scripts themselves

## Implementation for Config Server

The Config Server requires GitHub credentials to access our private repository. Here's how we secure these:

### 1. Local Credential Storage

```bash
# Create a local .env file for credentials
echo "GITHUB_USERNAME=sloanibe" > ~/.aws-starter-credentials
echo "GITHUB_TOKEN=your_personal_access_token" >> ~/.aws-starter-credentials
chmod 600 ~/.aws-starter-credentials
```

### 2. Secure Transfer During Deployment

```bash
# In deploy-config-server.sh
GITHUB_USERNAME=$(grep GITHUB_USERNAME ~/.aws-starter-credentials | cut -d'=' -f2)
GITHUB_TOKEN=$(grep GITHUB_TOKEN ~/.aws-starter-credentials | cut -d'=' -f2)

# Create secure environment file on EC2
ssh -i $SSH_KEY ubuntu@$EC2_IP "mkdir -p /home/ubuntu/config-server"
ssh -i $SSH_KEY ubuntu@$EC2_IP "cat > /home/ubuntu/config-server/.env << EOF
GITHUB_USERNAME=$GITHUB_USERNAME
GITHUB_TOKEN=$GITHUB_TOKEN
EOF
chmod 600 /home/ubuntu/config-server/.env"
```

### 3. Service Configuration

```ini
[Unit]
Description=Spring Cloud Config Server
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/config-server
EnvironmentFile=/home/ubuntu/config-server/.env
ExecStart=/usr/bin/java -Xmx256m -Xms128m \
    -DSERVER_PORT=8888 \
    -DSPRING_PROFILES_ACTIVE=prod \
    -jar config-server-0.0.1-SNAPSHOT.jar
SuccessExitStatus=143
TimeoutStopSec=10
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

## Security Benefits

1. **Process Isolation**: Credentials are only available to the specific service process
2. **No System-Wide Exposure**: Credentials don't appear in `env` or `ps` output
3. **File System Protection**: Permission settings prevent unauthorized access
4. **Transport Security**: SSH encryption protects credentials during deployment
5. **No Version Control Exposure**: Credentials are never committed to the repository

## Sensitive Information Types

We apply these practices to the following types of sensitive information:

1. **API Keys & Tokens**: GitHub tokens, AWS access keys, third-party API keys
2. **Database Credentials**: MongoDB connection strings, database passwords
3. **Service-to-Service Authentication**: Shared secrets, client IDs/secrets
4. **Encryption Keys**: Keys used for encrypting/decrypting sensitive data

## Future Enhancements

As our architecture evolves, we plan to implement:

1. **AWS Secrets Manager**: For more robust secrets management
2. **Credential Rotation**: Automated rotation of sensitive credentials
3. **Enhanced Auditing**: Tracking of credential access and usage
4. **HashiCorp Vault Integration**: For advanced secrets management capabilities

This approach aligns with our microservices migration plan and provides a secure foundation for our growing architecture.
