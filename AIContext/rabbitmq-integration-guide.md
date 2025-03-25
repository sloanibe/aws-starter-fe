# RabbitMQ Integration Guide for AWS Starter Microservices

## Table of Contents
1. [Overview](#overview)
2. [Architecture Diagram](#architecture-diagram)
3. [RabbitMQ Installation](#rabbitmq-installation)
4. [RabbitMQ Configuration](#rabbitmq-configuration)
5. [Service Integration](#service-integration)
   - [Login Service (Producer)](#login-service-producer)
   - [Email Service (Consumer)](#email-service-consumer)
6. [Testing the Integration](#testing-the-integration)
7. [Monitoring and Management](#monitoring-and-management)
8. [Troubleshooting](#troubleshooting)
9. [Security Considerations](#security-considerations)
10. [Future Enhancements](#future-enhancements)

## Overview

This document provides a comprehensive guide for installing, configuring, and integrating RabbitMQ with our microservices architecture. The primary focus is on establishing a message queue between the Login Service (producer) and Email Service (consumer) to handle login events.

RabbitMQ will enable asynchronous communication between these services, allowing the Login Service to continue processing user requests without waiting for email notifications to be sent. This decoupling improves system resilience, scalability, and user experience.

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

## RabbitMQ Installation

### Prerequisites
- Ubuntu 20.04 LTS or later
- Sudo privileges
- Open ports: 5672 (AMQP), 15672 (Management UI)

### Installation Steps

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

## RabbitMQ Configuration

### Creating Exchange and Queue for Login Events

1. **Access the Management UI**:
   - Open a browser and navigate to `http://<your-server-ip>:15672`
   - Login with the admin credentials created earlier

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

### Configuring High Availability

For production environments, we recommend setting up RabbitMQ in a cluster for high availability:

1. **Enable HA policy for login queue**:
   ```bash
   sudo rabbitmqctl set_policy ha-login "^login\." \
     '{"ha-mode":"all","ha-sync-mode":"automatic"}' \
     --apply-to queues
   ```

## Service Integration

### Login Service (Producer)

The Login Service is already configured to publish login events to RabbitMQ. Here's a review of the key components:

#### Configuration in `application.properties`

```properties
# RabbitMQ Configuration
rabbitmq.enabled=${RABBITMQ_ENABLED:true}
spring.rabbitmq.host=${RABBITMQ_HOST:localhost}
spring.rabbitmq.port=${RABBITMQ_PORT:5672}
spring.rabbitmq.username=${RABBITMQ_USERNAME:aws-starter}
spring.rabbitmq.password=${RABBITMQ_PASSWORD:aws-starter-password}
spring.rabbitmq.virtual-host=${RABBITMQ_VHOST:/}

# Login Event Configuration
login.exchange.name=login.exchange
login.routing.key=login.events
```

#### LoginEventProducer Implementation

```java
@Service
@Slf4j
public class LoginEventProducer {

    private final RabbitTemplate rabbitTemplate;
    private final String exchangeName;
    private final String routingKey;
    private final boolean rabbitMqEnabled;

    public LoginEventProducer(
            RabbitTemplate rabbitTemplate,
            @Value("${login.exchange.name}") String exchangeName,
            @Value("${login.routing.key}") String routingKey,
            @Value("${rabbitmq.enabled}") boolean rabbitMqEnabled) {
        this.rabbitTemplate = rabbitTemplate;
        this.exchangeName = exchangeName;
        this.routingKey = routingKey;
        this.rabbitMqEnabled = rabbitMqEnabled;
    }

    public void sendLoginEvent(LoginEvent event) {
        if (!rabbitMqEnabled) {
            log.info("RabbitMQ integration disabled by configuration.");
            return;
        }

        try {
            log.info("Sending login event to RabbitMQ: {}", event);
            rabbitTemplate.convertAndSend(exchangeName, routingKey, event);
            log.info("Login event sent successfully");
        } catch (Exception e) {
            log.error("Failed to send login event to RabbitMQ: {}", e.getMessage());
            // We don't rethrow the exception to prevent login failures due to messaging issues
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

### Manual Testing

1. **Start all services**:
   ```bash
   sudo systemctl start rabbitmq-server
   sudo systemctl start login-service
   sudo systemctl start email-service
   ```

2. **Monitor logs**:
   ```bash
   # Terminal 1
   sudo journalctl -u login-service -f
   
   # Terminal 2
   sudo journalctl -u email-service -f
   
   # Terminal 3
   sudo journalctl -u rabbitmq-server -f
   ```

3. **Perform a login**:
   - Use the login endpoint: `POST /api/login`
   - Provide valid credentials
   - Check logs to verify:
     - Login Service publishes event to RabbitMQ
     - Email Service consumes event and sends email

### Automated Testing

Create an integration test script:

```bash
#!/bin/bash
# File: test-rabbitmq-integration.sh

echo "Testing RabbitMQ Integration"
echo "============================"

# Check RabbitMQ status
echo "Checking RabbitMQ status..."
rabbitmq_status=$(systemctl is-active rabbitmq-server)
if [ "$rabbitmq_status" != "active" ]; then
    echo "❌ RabbitMQ is not running!"
    exit 1
else
    echo "✅ RabbitMQ is running"
fi

# Check queue status
echo "Checking login.events.queue..."
queue_info=$(sudo rabbitmqctl list_queues name messages_ready messages_unacknowledged | grep login.events.queue)
if [ -z "$queue_info" ]; then
    echo "❌ login.events.queue not found!"
    exit 1
else
    echo "✅ login.events.queue exists: $queue_info"
fi

# Send test message
echo "Sending test login event..."
curl -X POST http://localhost:8081/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com"}' \
  -v

echo "Waiting for message processing..."
sleep 5

# Check email service logs
echo "Checking Email Service logs..."
email_log=$(sudo journalctl -u email-service -n 20 | grep "Received login event")
if [ -z "$email_log" ]; then
    echo "❌ No login event received by Email Service!"
else
    echo "✅ Email Service received login event: $email_log"
fi

echo "Test completed"
```

## Monitoring and Management

### RabbitMQ Management UI

The Management UI provides a comprehensive dashboard for monitoring:

- **Queues**: Monitor queue depth, message rates, and consumer counts
- **Connections**: Track client connections and channel usage
- **Exchanges**: View message publishing rates and bindings
- **Users**: Manage user permissions and access

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
   - Check if RabbitMQ is running: `systemctl status rabbitmq-server`
   - Verify firewall settings: `sudo ufw status`
   - Ensure correct host and port in application properties

2. **Authentication Failed**
   - Verify username and password in application properties
   - Check user permissions: `sudo rabbitmqctl list_user_permissions aws-starter`

3. **Queue Not Found**
   - Verify queue exists: `sudo rabbitmqctl list_queues`
   - Check exchange bindings: `sudo rabbitmqctl list_bindings`

4. **Messages Not Being Consumed**
   - Check consumer status: `sudo rabbitmqctl list_consumers`
   - Verify routing key matches binding: `sudo rabbitmqctl list_bindings`
   - Check Email Service logs for errors

### Diagnostic Commands

```bash
# List queues with message counts
sudo rabbitmqctl list_queues name messages_ready messages_unacknowledged

# List exchanges
sudo rabbitmqctl list_exchanges name type durable

# List bindings
sudo rabbitmqctl list_bindings source_name source_kind destination_name destination_kind routing_key

# List connections
sudo rabbitmqctl list_connections user peer_host state channels

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

### Potential Improvements

1. **Dead Letter Queue**:
   - Implement a dead letter exchange and queue for failed messages
   - Set up monitoring and alerting for dead letter queue

2. **Message TTL**:
   - Configure time-to-live for messages to prevent queue buildup
   ```bash
   sudo rabbitmqctl set_policy TTL ".*" '{"message-ttl":86400000}' --apply-to queues
   ```

3. **Circuit Breaker Pattern**:
   - Implement circuit breaker for RabbitMQ connections to handle outages gracefully
   - Use Spring Cloud Circuit Breaker with Resilience4j

4. **Message Idempotency**:
   - Add unique message IDs to ensure idempotent processing
   - Implement deduplication in the consumer

5. **Scaling Consumers**:
   - Configure multiple instances of Email Service to scale processing
   - Use prefetch count to balance load across consumers

```
┌─────────────────┐
│                 │
│  Login Service  │
│   (Producer)    │
│                 │
└────────┬────────┘
         │
         │ Publish
         │
         ▼
┌─────────────────┐
│                 │
│    RabbitMQ     │
│  Message Broker │
│                 │
└────────┬────────┘
         │
         │ Consume
         │
         ▼
┌─────────────────────────────────────┐
│                                     │
│           Email Service             │
│                                     │
├─────────────┬─────────────┬─────────┤
│  Instance 1 │  Instance 2 │   ...   │
│  (Consumer) │  (Consumer) │         │
└─────────────┴─────────────┴─────────┘
```

### Additional Event Types

Consider expanding the event-driven architecture to include:

1. **Password Reset Events**:
   - Exchange: `user.exchange`
   - Routing Key: `user.password.reset`
   - Queue: `password.reset.queue`

2. **Account Update Events**:
   - Exchange: `user.exchange`
   - Routing Key: `user.account.update`
   - Queue: `account.update.queue`

3. **System Notification Events**:
   - Exchange: `system.exchange`
   - Routing Key: `system.notification`
   - Queue: `system.notification.queue`
