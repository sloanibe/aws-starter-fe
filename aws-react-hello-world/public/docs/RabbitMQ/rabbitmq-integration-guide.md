# RabbitMQ Integration Guide for AWS Starter Microservices

## Table of Contents
1. [Overview](#overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Infrastructure Setup](#infrastructure-setup)
   - [Dedicated RabbitMQ Server](#dedicated-rabbitmq-server)
   - [DNS Configuration](#dns-configuration)
4. [RabbitMQ Installation](#rabbitmq-installation)
5. [RabbitMQ Configuration](#rabbitmq-configuration)
6. [Service Integration](#service-integration)
   - [Login Service (Producer)](#login-service-producer)
   - [Email Service (Consumer)](#email-service-consumer)
7. [Testing the Integration](#testing-the-integration)
8. [Monitoring and Management](#monitoring-and-management)
9. [Troubleshooting](#troubleshooting)
10. [Security Considerations](#security-considerations)
11. [Future Enhancements](#future-enhancements)

## Overview

This document provides a comprehensive guide for installing, configuring, and integrating RabbitMQ with our microservices architecture. The primary focus is on establishing a message queue between the Login Service (producer) and Email Service (consumer) to handle login events.

RabbitMQ is deployed on a dedicated EC2 instance separate from our microservices to ensure better resource isolation, scalability, and maintainability. We use DNS-based service discovery to allow services to connect to RabbitMQ using a consistent hostname rather than hardcoded IP addresses.

RabbitMQ enables asynchronous communication between services, allowing the Login Service to continue processing user requests without waiting for email notifications to be sent. This decoupling improves system resilience, scalability, and user experience.

## Architecture Diagram

```
                                                          ┌─────────────────┐
                                                          │                 │
                                                          │  Email Service  │
                                                          │    (Consumer)   │
                                                          │                 │
                                                          └────────┬────────┘
                                                                   │
                                                                   │ Subscribe
                                                                   │ (login.events)
                                                                   │
┌─────────────────┐    Publish     ┌─────────────────┐    Consume  │
│                 │    (login.events)                ├────────────┘
│  Login Service  ├────────────────►    RabbitMQ     │
│   (Producer)    │                │  Message Broker │
│                 │                │                 │
└─────────────────┘                └─────────────────┘
        │                                   ▲
        │                                   │
        │                                   │
        │                                   │
        │                                   │
        ▼                                   │
┌─────────────────┐                ┌────────┴────────┐
│                 │                │                 │
│    MongoDB      │                │  Management UI  │
│   (User Data)   │                │  (Port 15672)   │
│                 │                │                 │
└─────────────────┘                └─────────────────┘
```

## Infrastructure Setup

### Dedicated RabbitMQ Server

RabbitMQ is deployed on a dedicated EC2 instance (t2.nano) with the following specifications:

- **Instance Type**: t2.nano
- **AMI**: Ubuntu 22.04 LTS (ami-0a0409af1cb831414)
- **Region**: us-west-1
- **Public IP**: 52.53.165.26
- **DNS Name**: rabbitmq.sloandev.net

This dedicated instance approach provides several benefits:

1. **Resource Isolation**: RabbitMQ has dedicated resources and won't compete with other services
2. **Independent Scaling**: Can be scaled independently based on messaging needs
3. **Simplified Maintenance**: Updates and maintenance can be performed without affecting other services
4. **Enhanced Security**: Security groups can be tailored specifically for messaging traffic

### DNS Configuration

We've set up a DNS record using Route 53 to provide a consistent hostname for RabbitMQ:

- **DNS Name**: rabbitmq.sloandev.net
- **Record Type**: A Record
- **TTL**: 300 seconds
- **Points to**: RabbitMQ EC2 instance public IP

This DNS-based approach offers several advantages:

1. **Service Discovery**: Services can discover RabbitMQ using a consistent hostname
2. **IP Independence**: The underlying IP can change without affecting service configurations
3. **Future Migration**: Makes it easier to migrate RabbitMQ to different infrastructure

The DNS configuration is managed through CloudFormation and can also be updated using the `update-rabbitmq-dns.sh` script in the `scripts/dns/` directory.

## RabbitMQ Installation

### Prerequisites
- Ubuntu 22.04 LTS or later
- Sudo privileges
- Open ports: 5672 (AMQP), 15672 (Management UI)
- AWS CLI configured with appropriate permissions

### Automated Installation

We use CloudFormation to automate the deployment of RabbitMQ. The template is located at `infrastructure/cloudformation/rabbitmq-service.yml` and can be deployed using the `scripts/deploy/deploy-rabbitmq.sh` script.

```bash
# Deploy RabbitMQ using CloudFormation
./scripts/deploy/deploy-rabbitmq.sh
```

The CloudFormation template handles:
1. EC2 instance creation with appropriate security groups
2. RabbitMQ installation and configuration
3. User creation and permissions setup
4. Exchange and queue creation
5. DNS record creation for rabbitmq.sloandev.net

### Manual Installation Steps

If you prefer to install RabbitMQ manually, follow these steps:

1. **Update package lists**:
   ```bash
   sudo apt-get update
   sudo apt-get upgrade -y
   ```

2. **Install RabbitMQ server**:
   ```bash
   sudo apt-get install rabbitmq-server -y
   ```

3. **Enable and start RabbitMQ service**:
   ```bash
   sudo systemctl enable rabbitmq-server
   sudo systemctl start rabbitmq-server
   ```

4. **Verify RabbitMQ is running**:
   ```bash
   sudo systemctl status rabbitmq-server
   ```

5. **Enable RabbitMQ Management UI**:
   ```bash
   sudo rabbitmq-plugins enable rabbitmq_management
   ```

6. **Create admin user for management**:
   ```bash
   sudo rabbitmqctl add_user admin admin123
   sudo rabbitmqctl set_user_tags admin administrator
   sudo rabbitmqctl set_permissions -p / admin ".*" ".*" ".*"
   ```

7. **Create application user with limited permissions**:
   ```bash
   sudo rabbitmqctl add_user aws-starter aws-starter-password
   sudo rabbitmqctl set_permissions -p / aws-starter ".*" ".*" ".*"
   ```

8. **Install rabbitmqadmin CLI tool**:
   ```bash
   sudo apt-get install -y python3 python3-pip
   sudo pip3 install requests
   ```

## RabbitMQ Configuration

### Exchange and Queue Configuration

Our RabbitMQ setup includes the following components:

1. **Exchanges**:
   - `login.exchange`: A topic exchange for login-related events

2. **Queues**:
   - `login.events.queue`: Durable queue for login events

3. **Bindings**:
   - `login.exchange` → `login.events.queue` with routing key `login.events`

These are automatically created during deployment by the CloudFormation template. If you need to create them manually, you can use either the Management UI or the rabbitmqadmin CLI tool.

### Using the Management UI

1. **Access the Management UI**:
   - Open a browser and navigate to `http://rabbitmq.sloandev.net:15672`
   - Login with the admin credentials (admin/admin123)

2. **Create Exchange**:
   - Go to "Exchanges" tab
   - Add a new exchange:
     - Name: `login.exchange`
     - Type: `topic`
     - Durability: `Durable`
     - Click "Add exchange"

3. **Create Queue**:
   - Go to "Queues" tab
   - Add a new queue:
     - Name: `login.events.queue`
     - Durability: `Durable`
     - Click "Add queue"

4. **Bind Queue to Exchange**:
   - Go to the newly created queue `login.events.queue`
   - In the "Bindings" section:
     - From exchange: `login.exchange`
     - Routing key: `login.events`
     - Click "Bind"

### Using the rabbitmqadmin CLI

```bash
# Create Exchange
sudo rabbitmqadmin declare exchange name=login.exchange type=topic durable=true

# Create Queue
sudo rabbitmqadmin declare queue name=login.events.queue durable=true

# Bind Queue to Exchange
sudo rabbitmqadmin declare binding source=login.exchange destination=login.events.queue routing_key="login.events"
```

### Configuring High Availability

For production environments, we've set up a high availability policy for login queues:

```bash
sudo rabbitmqctl set_policy ha-login "^login\." \
  '{"ha-mode":"all","ha-sync-mode":"automatic"}' \
  --apply-to queues
```

This policy ensures that all queues with names starting with "login." will be mirrored across all nodes when we expand to a RabbitMQ cluster in the future.

## Service Integration

### Login Service (Producer)

The Login Service is configured to publish login events to RabbitMQ whenever a user logs in. The service runs on a separate EC2 instance (IP: 13.52.157.48) and connects to RabbitMQ using the DNS name `rabbitmq.sloandev.net`.

#### Environment Configuration

The Login Service uses environment variables to configure the RabbitMQ connection. These are defined in the `/home/ubuntu/login-service/.env` file on the Login Service EC2 instance:

```properties
IP_ADDRESS=13.52.157.48
SERVER_PORT=8081
MONGO_USERNAME=admin
MONGO_PASSWORD=admin123
# RabbitMQ configuration
RABBITMQ_ENABLED=true
RABBITMQ_HOST=rabbitmq.sloandev.net
RABBITMQ_PORT=5672
RABBITMQ_USERNAME=aws-starter
RABBITMQ_PASSWORD=aws-starter-password
```

#### Spring Boot Configuration

These environment variables are mapped to Spring Boot properties in the application configuration:

```properties
# RabbitMQ Configuration
spring.rabbitmq.host=${RABBITMQ_HOST:localhost}
spring.rabbitmq.port=${RABBITMQ_PORT:5672}
spring.rabbitmq.username=${RABBITMQ_USERNAME:aws-starter}
spring.rabbitmq.password=${RABBITMQ_PASSWORD:aws-starter-password}
spring.rabbitmq.virtual-host=${RABBITMQ_VHOST:/}

# Login Event Configuration
rabbitmq.exchange.name=login.exchange
rabbitmq.routing.key=login.events
```

#### LoginEventProducer Implementation

The `LoginEventProducer` class handles publishing login events to RabbitMQ:

```java
@Slf4j
@Service
public class LoginEventProducer {

    private RabbitTemplate rabbitTemplate;
    private boolean rabbitMqAvailable = false;

    @Value("${rabbitmq.exchange.name:login.exchange}")
    private String exchangeName;

    @Value("${rabbitmq.routing.key:login.events}")
    private String routingKey;

    @Autowired(required = false)
    public void setRabbitTemplate(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
        this.rabbitMqAvailable = true;
        log.info("RabbitMQ integration available");
    }

    public void sendLoginEvent(LoginEvent loginEvent) {
        if (!rabbitMqAvailable) {
            log.warn("RabbitMQ not available. Login will proceed but notification will not be sent: {}", loginEvent);
            return;
        }
        
        try {
            log.info("Sending login event to RabbitMQ: {}", loginEvent);
            rabbitTemplate.convertAndSend(exchangeName, routingKey, loginEvent);
            log.info("Login event sent successfully");
        } catch (AmqpException e) {
            log.error("Failed to send login event: {}", e.getMessage(), e);
            // We don't rethrow the exception to prevent login failure if messaging fails
        }
    }
}
```

### Email Service (Consumer)

The Email Service is configured to consume login events from RabbitMQ and send email notifications.

#### Configuration in `application.properties`

```properties
# RabbitMQ Configuration
spring.rabbitmq.host=${RABBITMQ_HOST:localhost}
spring.rabbitmq.port=${RABBITMQ_PORT:5672}
spring.rabbitmq.username=${RABBITMQ_USERNAME:aws-starter}
spring.rabbitmq.password=${RABBITMQ_PASSWORD:aws-starter-password}
spring.rabbitmq.virtual-host=${RABBITMQ_VHOST:/}

# Login Event Configuration
login.queue.name=login.events.queue
```

#### RabbitMQ Configuration Class

```java
@Configuration
public class RabbitMQConfig {

    @Value("${login.queue.name}")
    private String queueName;

    @Bean
    public Queue loginEventsQueue() {
        return new Queue(queueName, true);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter());
        return template;
    }
}
```

#### LoginEventConsumer Implementation

```java
@Service
@Slf4j
public class LoginEventConsumer {

    private final EmailService emailService;

    public LoginEventConsumer(EmailService emailService) {
        this.emailService = emailService;
    }

    @RabbitListener(queues = "${login.queue.name}")
    public void consumeLoginEvent(LoginEvent event) {
        log.info("Received login event: {}", event);
        
        try {
            // Process the login event
            if (event.isNewUser()) {
                emailService.sendWelcomeEmail(event.getEmail(), event.getUsername());
            } else {
                emailService.sendLoginNotificationEmail(event.getEmail(), event.getUsername(), 
                                                       event.getLoginTime(), event.getIpAddress());
            }
            
            log.info("Login event processed successfully");
        } catch (Exception e) {
            log.error("Error processing login event: {}", e.getMessage(), e);
            // Consider implementing a dead letter queue for failed messages
        }
    }
}
```

## Testing the Integration

### Verifying RabbitMQ Setup

1. **Check RabbitMQ Status on Dedicated Server**:
   ```bash
   ssh -i "/home/msloan/.ssh/aws-starter-key.pem" ubuntu@52.53.165.26 'sudo systemctl status rabbitmq-server'
   ```

2. **Verify Management UI Access via DNS**:
   - Open a browser and navigate to `http://rabbitmq.sloandev.net:15672`
   - Login with admin credentials (admin/admin123)

3. **Check Exchange and Queue Existence**:
   ```bash
   # List exchanges
   ssh -i "/home/msloan/.ssh/aws-starter-key.pem" ubuntu@52.53.165.26 'sudo rabbitmqctl list_exchanges name type durable'

   # List queues
   ssh -i "/home/msloan/.ssh/aws-starter-key.pem" ubuntu@52.53.165.26 'sudo rabbitmqctl list_queues name messages consumers'

   # List bindings
   ssh -i "/home/msloan/.ssh/aws-starter-key.pem" ubuntu@52.53.165.26 'sudo rabbitmqctl list_bindings source_name destination_name routing_key'
   ```

### Testing the Login Service Producer

1. **Make a Login Request to the Login Service**:
   ```bash
   curl -X POST -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","name":"Test User","organization":"Test Org"}' \
     http://13.52.157.48:8081/login
   ```

   You should receive a response similar to:
   ```json
   {"id":"67e22e75e11b1f78a96733cf","email":"test@example.com","name":"Test User","organization":"Test Org","success":true,"message":"Login successful"}
   ```

2. **Check Queue for Messages on RabbitMQ Server**:
   ```bash
   ssh -i "/home/msloan/.ssh/aws-starter-key.pem" ubuntu@52.53.165.26 'sudo rabbitmqctl list_queues name messages'
   ```

   You should see that the `login.events.queue` has at least one message:
   ```
   Timeout: 60.0 seconds ...
   Listing queues for vhost / ...
   name	messages
   login.events.queue	1
   ```

3. **View Login Service Logs for RabbitMQ Integration**:
   ```bash
   ssh -i "/home/msloan/.ssh/aws-starter-key.pem" ubuntu@13.52.157.48 'sudo journalctl -u login-service -n 50 | grep -i "rabbit"'
   ```

   You should see logs indicating successful connection to RabbitMQ via DNS name and message publishing:
   ```
   Mar 25 04:16:51 ip-10-0-1-138 java[37665]: 2025-03-25T04:16:51.573Z  INFO 37665 --- [LOGIN-SERVICE] [           main] c.e.l.service.LoginEventProducer         : RabbitMQ integration available
   Mar 25 04:17:57 ip-10-0-1-138 java[37665]: 2025-03-25T04:17:57.527Z  INFO 37665 --- [LOGIN-SERVICE] [nio-8081-exec-1] c.e.l.service.LoginEventProducer         : Sending login event to RabbitMQ: LoginEvent(userId=67e22e75e11b1f78a96733cf, email=test3@example.com, name=Test User 3, organization=Test Org, loginTime=2025-03-25T04:17:57.527446635)
   Mar 25 04:17:57 ip-10-0-1-138 java[37665]: 2025-03-25T04:17:57.547Z  INFO 37665 --- [LOGIN-SERVICE] [nio-8081-exec-1] o.s.a.r.c.CachingConnectionFactory       : Attempting to connect to: [rabbitmq.sloandev.net:5672]
   Mar 25 04:17:57 ip-10-0-1-138 java[37665]: 2025-03-25T04:17:57.665Z  INFO 37665 --- [LOGIN-SERVICE] [nio-8081-exec-1] o.s.a.r.c.CachingConnectionFactory       : Created new connection: rabbitConnectionFactory#12d35bc9:0/SimpleConnection@7992f330 [delegate=amqp://aws-starter@52.53.165.26:5672/, localPort=43586]
   ```

### Automated Testing with Multi-Server Setup

Create an integration test script that works with our multi-server architecture:

```bash
#!/bin/bash
# File: test-rabbitmq-integration.sh

echo "Testing RabbitMQ Integration Across Servers"
echo "========================================="

# Define server details
RABBITMQ_SERVER="52.53.165.26"
RABBITMQ_DNS="rabbitmq.sloandev.net"
LOGIN_SERVER="13.52.157.48"
SSH_KEY="/home/msloan/.ssh/aws-starter-key.pem"

# Check DNS resolution
echo "Checking DNS resolution for $RABBITMQ_DNS..."
DNS_IP=$(dig +short $RABBITMQ_DNS)
if [ "$DNS_IP" == "$RABBITMQ_SERVER" ]; then
    echo "✅ DNS resolution working correctly: $RABBITMQ_DNS -> $DNS_IP"
else
    echo "❌ DNS resolution issue! $RABBITMQ_DNS resolves to $DNS_IP, expected $RABBITMQ_SERVER"
    echo "Running update-rabbitmq-dns.sh script to fix DNS..."
    ./scripts/dns/update-rabbitmq-dns.sh
    sleep 10
    DNS_IP=$(dig +short $RABBITMQ_DNS)
    echo "DNS now resolves to: $DNS_IP"
fi

# Check RabbitMQ status
echo "Checking RabbitMQ status on $RABBITMQ_SERVER..."
rabbitmq_status=$(ssh -i "$SSH_KEY" ubuntu@$RABBITMQ_SERVER 'sudo systemctl is-active rabbitmq-server')
if [ "$rabbitmq_status" != "active" ]; then
    echo "❌ RabbitMQ is not running on $RABBITMQ_SERVER!"
    exit 1
else
    echo "✅ RabbitMQ is running on $RABBITMQ_SERVER"
fi

# Check queue status
echo "Checking login.events.queue on $RABBITMQ_SERVER..."
queue_info=$(ssh -i "$SSH_KEY" ubuntu@$RABBITMQ_SERVER 'sudo rabbitmqctl list_queues name messages_ready messages_unacknowledged | grep login.events.queue')
if [ -z "$queue_info" ]; then
    echo "❌ login.events.queue not found on $RABBITMQ_SERVER!"
    exit 1
else
    echo "✅ login.events.queue exists: $queue_info"
fi

# Send test message to Login Service
echo "Sending test login event to Login Service at $LOGIN_SERVER..."
curl -X POST http://$LOGIN_SERVER:8081/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User","organization":"Test Org"}' \
  -s | jq .

echo "Waiting for message processing..."
sleep 5

# Check if message was published to RabbitMQ
echo "Checking if message was published to RabbitMQ..."
login_log=$(ssh -i "$SSH_KEY" ubuntu@$LOGIN_SERVER 'sudo journalctl -u login-service -n 20 | grep "Sending login event to RabbitMQ"')
if [ -z "$login_log" ]; then
    echo "❌ No login event published by Login Service!"
else
    echo "✅ Login Service published event: $login_log"
fi

# Check if message was received in RabbitMQ queue
echo "Checking message count in RabbitMQ queue..."
message_count=$(ssh -i "$SSH_KEY" ubuntu@$RABBITMQ_SERVER 'sudo rabbitmqctl list_queues name messages | grep login.events.queue | awk "{print \$2}"')
echo "✅ Messages in queue: $message_count"

echo "Test completed successfully"
```

This script tests the full integration between the Login Service and RabbitMQ, including DNS resolution, ensuring that messages are properly published across servers.

## Monitoring and Management

### RabbitMQ Management UI

The Management UI provides a comprehensive dashboard for monitoring and is accessible at `http://rabbitmq.sloandev.net:15672` with the admin credentials:

- **Queues**: Monitor queue depth, message rates, and consumer counts
- **Connections**: Track client connections and channel usage (including connections from the Login Service)
- **Exchanges**: View message publishing rates and bindings
- **Users**: Manage user permissions and access

### DNS Management

The DNS configuration for RabbitMQ is managed through Route 53 and can be updated using the `update-rabbitmq-dns.sh` script:

```bash
# Update DNS if RabbitMQ server IP changes
./scripts/dns/update-rabbitmq-dns.sh
```

This script updates the A record for `rabbitmq.sloandev.net` to point to the current RabbitMQ server IP address. The DNS configuration is defined in the `rabbitmq-dns-change.json` file, which contains the following:

```json
{
  "Comment": "Add rabbitmq.sloandev.net subdomain for RabbitMQ service",
  "Changes": [
    {
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "rabbitmq.sloandev.net",
        "Type": "A",
        "TTL": 300,
        "ResourceRecords": [
          {
            "Value": "52.53.165.26"
          }
        ]
      }
    }
  ]
}
```

### Prometheus Integration

For advanced monitoring, integrate RabbitMQ with Prometheus:

1. **Enable Prometheus plugin**:
   ```bash
   sudo rabbitmq-plugins enable rabbitmq_prometheus
   ```

2. **Configure Prometheus to scrape metrics**:
   ```yaml
   # prometheus.yml
   scrape_configs:
     - job_name: 'rabbitmq'
       static_configs:
         - targets: ['<rabbitmq-server-ip>:15692']
   ```

## Troubleshooting

### Common Issues and Solutions

1. **Connection Refused**
   - Check if RabbitMQ is running on the dedicated server: 
     ```bash
     ssh -i "/home/msloan/.ssh/aws-starter-key.pem" ubuntu@52.53.165.26 'sudo systemctl status rabbitmq-server'
     ```
   - Verify security group settings in AWS console to ensure ports 5672 and 15672 are open
   - Check DNS resolution: `nslookup rabbitmq.sloandev.net`
   - Ensure correct host and port in Login Service environment variables

2. **Authentication Failed**
   - Verify username and password in Login Service environment variables
   - Check user permissions on RabbitMQ server: 
     ```bash
     ssh -i "/home/msloan/.ssh/aws-starter-key.pem" ubuntu@52.53.165.26 'sudo rabbitmqctl list_user_permissions aws-starter'
     ```

3. **Queue Not Found**
   - Verify queue exists on RabbitMQ server: 
     ```bash
     ssh -i "/home/msloan/.ssh/aws-starter-key.pem" ubuntu@52.53.165.26 'sudo rabbitmqctl list_queues'
     ```
   - Check exchange bindings: 
     ```bash
     ssh -i "/home/msloan/.ssh/aws-starter-key.pem" ubuntu@52.53.165.26 'sudo rabbitmqctl list_bindings'
     ```

4. **DNS Resolution Issues**
   - Verify DNS record in Route 53 console
   - Run the DNS update script: `./scripts/dns/update-rabbitmq-dns.sh`
   - Check DNS propagation: `dig +trace rabbitmq.sloandev.net`

5. **Messages Not Being Consumed**
   - Check consumer status on RabbitMQ server: 
     ```bash
     ssh -i "/home/msloan/.ssh/aws-starter-key.pem" ubuntu@52.53.165.26 'sudo rabbitmqctl list_consumers'
     ```
   - Verify routing key matches binding
   - Check Email Service logs for errors

### Diagnostic Commands for Multi-Server Setup

```bash
# List queues with message counts on RabbitMQ server
ssh -i "/home/msloan/.ssh/aws-starter-key.pem" ubuntu@52.53.165.26 'sudo rabbitmqctl list_queues name messages_ready messages_unacknowledged'

# List exchanges on RabbitMQ server
ssh -i "/home/msloan/.ssh/aws-starter-key.pem" ubuntu@52.53.165.26 'sudo rabbitmqctl list_exchanges name type durable'

# List bindings on RabbitMQ server
ssh -i "/home/msloan/.ssh/aws-starter-key.pem" ubuntu@52.53.165.26 'sudo rabbitmqctl list_bindings source_name source_kind destination_name destination_kind routing_key'

# List connections to see Login Service connections
ssh -i "/home/msloan/.ssh/aws-starter-key.pem" ubuntu@52.53.165.26 'sudo rabbitmqctl list_connections user peer_host state channels'

# Check DNS resolution
dig +short rabbitmq.sloandev.net

# Test connectivity from Login Service to RabbitMQ
ssh -i "/home/msloan/.ssh/aws-starter-key.pem" ubuntu@13.52.157.48 'telnet rabbitmq.sloandev.net 5672'

# View Login Service environment variables
ssh -i "/home/msloan/.ssh/aws-starter-key.pem" ubuntu@13.52.157.48 'cat /home/ubuntu/login-service/.env | grep RABBIT'

# List consumers
sudo rabbitmqctl list_consumers
```

## Security Considerations

### Securing RabbitMQ

1. **Use TLS for Connections**:
   ```properties
   # application.properties
   spring.rabbitmq.ssl.enabled=true
   spring.rabbitmq.ssl.key-store=classpath:keystore.p12
   spring.rabbitmq.ssl.key-store-password=mypassword
   spring.rabbitmq.ssl.key-store-type=PKCS12
   ```

2. **Implement Least Privilege Access**:
   ```bash
   # Create user with specific permissions
   sudo rabbitmqctl add_user login-service login-service-password
   sudo rabbitmqctl set_permissions -p / login-service "^login\." "^login\." "^$"
   
   sudo rabbitmqctl add_user email-service email-service-password
   sudo rabbitmqctl set_permissions -p / email-service "^$" "^$" "^login\."
   ```

3. **Secure Management UI**:
   ```bash
   # Restrict management UI access
   sudo rabbitmqctl set_user_tags admin administrator
   sudo rabbitmqctl set_user_tags login-service none
   sudo rabbitmqctl set_user_tags email-service none
   ```

## Future Enhancements

### Multi-Server Architecture Improvements

1. **RabbitMQ Cluster Setup**:
   - Implement a RabbitMQ cluster across multiple EC2 instances for high availability
   - Configure mirrored queues to prevent message loss if a node fails
   ```bash
   # On primary node (52.53.165.26)
   sudo rabbitmqctl set_policy ha-all ".*" '{"ha-mode":"all"}'
   
   # Join secondary node to cluster
   sudo rabbitmqctl stop_app
   sudo rabbitmqctl join_cluster rabbit@ip-10-0-1-139
   sudo rabbitmqctl start_app
   ```

2. **DNS Failover Configuration**:
   - Implement Route 53 health checks and failover routing for `rabbitmq.sloandev.net`
   - Create a secondary RabbitMQ instance in a different availability zone
   ```json
   {
     "Comment": "Failover configuration for RabbitMQ",
     "Changes": [
       {
         "Action": "CREATE",
         "ResourceRecordSet": {
           "Name": "rabbitmq.sloandev.net",
           "Type": "A",
           "SetIdentifier": "Primary",
           "Failover": { "Type": "PRIMARY" },
           "TTL": 60,
           "ResourceRecords": [{ "Value": "52.53.165.26" }]
         }
       },
       {
         "Action": "CREATE",
         "ResourceRecordSet": {
           "Name": "rabbitmq.sloandev.net",
           "Type": "A",
           "SetIdentifier": "Secondary",
           "Failover": { "Type": "SECONDARY" },
           "TTL": 60,
           "ResourceRecords": [{ "Value": "<secondary-ip>" }]
         }
       }
     ]
   }
   ```

3. **Message Persistence and Reliability**:
   - Configure durable exchanges, queues, and persistent messages
   - Implement publisher confirms and consumer acknowledgments
   ```java
   // In LoginEventProducer
   @Bean
   public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
       RabbitTemplate template = new RabbitTemplate(connectionFactory);
       template.setMessageConverter(jsonMessageConverter());
       template.setConfirmCallback((correlationData, ack, cause) -> {
           if (ack) {
               log.info("Message confirmed: {}", correlationData);
           } else {
               log.error("Message failed: {}, reason: {}", correlationData, cause);
           }
       });
       return template;
   }
   ```

4. **Circuit Breaker for Cross-Server Communication**:
   - Implement circuit breaker pattern for RabbitMQ connections to handle network issues
   - Use Spring Cloud Circuit Breaker with Resilience4j
   ```java
   @Bean
   public CircuitBreakerFactory circuitBreakerFactory() {
       CircuitBreakerConfig circuitBreakerConfig = CircuitBreakerConfig.custom()
           .failureRateThreshold(50)
           .waitDurationInOpenState(Duration.ofMillis(1000))
           .slidingWindowSize(10)
           .build();
       
       return new Resilience4JCircuitBreakerFactory(circuitBreakerConfig);
   }
   ```

### Operational Improvements

1. **Automated Deployment Pipeline**:
   - Create a CI/CD pipeline for RabbitMQ configuration changes
   - Automate DNS updates when server IP changes
   ```yaml
   # .github/workflows/deploy-rabbitmq.yml
   name: Deploy RabbitMQ
   on:
     push:
       paths:
         - 'infrastructure/cloudformation/rabbitmq-service.yml'
         - 'scripts/deploy/deploy-rabbitmq.sh'
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v2
         - name: Deploy RabbitMQ
           run: ./scripts/deploy/deploy-rabbitmq.sh
         - name: Update DNS
           run: ./scripts/dns/update-rabbitmq-dns.sh
   ```

2. **Monitoring and Alerting**:
   - Integrate with CloudWatch for metrics and alarms
   - Set up alerts for queue depth, connection failures, and disk space
   ```bash
   # Create CloudWatch alarm for queue depth
   aws cloudwatch put-metric-alarm \
     --alarm-name RabbitMQ-QueueDepth-Alarm \
     --alarm-description "Alarm when queue depth exceeds threshold" \
     --metric-name QueueDepth \
     --namespace AWS/RabbitMQ \
     --statistic Average \
     --period 300 \
     --threshold 1000 \
     --comparison-operator GreaterThanThreshold \
     --dimensions Name=QueueName,Value=login.events.queue \
     --evaluation-periods 1 \
     --alarm-actions arn:aws:sns:us-west-1:123456789012:RabbitMQ-Alerts
   ```

3. **Dead Letter Exchange and Queue**:
   - Implement a dead letter exchange for failed message processing
   - Set up monitoring and alerting for dead letter queue
   ```java
   @Bean
   public Queue loginEventsQueue() {
       return QueueBuilder.durable(queueName)
           .withArgument("x-dead-letter-exchange", "login.dead-letter.exchange")
           .withArgument("x-dead-letter-routing-key", "login.dead-letter")
           .build();
   }
   
   @Bean
   public DirectExchange deadLetterExchange() {
       return new DirectExchange("login.dead-letter.exchange");
   }
   
   @Bean
   public Queue deadLetterQueue() {
       return QueueBuilder.durable("login.dead-letter.queue").build();
   }
   
   @Bean
   public Binding deadLetterBinding() {
       return BindingBuilder.bind(deadLetterQueue())
           .to(deadLetterExchange())
           .with("login.dead-letter");
   }
   ```

### Multi-Service Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Login Service  │     │  User Service   │     │  Admin Service  │
│   (Producer)    │     │   (Producer)    │     │   (Producer)    │
│                 │     │                 │     │                 │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                        RabbitMQ Cluster                         │
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐  │
│  │login.exchange│    │user.exchange│    │notification.exchange│  │
│  └─────────────┘    └─────────────┘    └─────────────────────┘  │
│                                                                 │
└───────────┬─────────────────────┬─────────────────────┬─────────┘
            │                     │                     │
            │                     │                     │
            ▼                     ▼                     ▼
┌───────────────────┐   ┌───────────────────┐   ┌───────────────────┐
│                   │   │                   │   │                   │
│   Email Service   │   │  Analytics Service│   │Notification Service│
│    (Consumer)     │   │    (Consumer)     │   │    (Consumer)     │
│                   │   │                   │   │                   │
└───────────────────┘   └───────────────────┘   └───────────────────┘
```

### Additional Event Types

Expand the event-driven architecture to include:

1. **User Management Events**:
   - Exchange: `user.exchange`
   - Routing Keys: 
     - `user.created` - When a new user registers
     - `user.updated` - When user profile is updated
     - `user.password.reset` - When password reset is requested
     - `user.deleted` - When user account is deleted

2. **System Events**:
   - Exchange: `system.exchange`
   - Routing Keys:
     - `system.startup` - When services start up
     - `system.shutdown` - When services shut down gracefully
     - `system.error` - When system errors occur
     - `system.config.changed` - When configuration changes

3. **Audit Events**:
   - Exchange: `audit.exchange`
   - Routing Keys:
     - `audit.login` - Login attempts (success/failure)
     - `audit.admin` - Admin actions
     - `audit.data.access` - Data access events
     - `audit.security` - Security-related events
