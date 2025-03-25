# RabbitMQ For Developers

## Table of Contents
1. [Introduction to RabbitMQ](#introduction-to-rabbitmq)
2. [Core Concepts](#core-concepts)
   - [Exchanges](#exchanges)
   - [Queues](#queues)
   - [Bindings](#bindings)
   - [Routing Keys](#routing-keys)
   - [Message Flow](#message-flow)
3. [RabbitMQ Exchange Types](#rabbitmq-exchange-types)
   - [Direct Exchange](#direct-exchange)
   - [Topic Exchange](#topic-exchange)
   - [Fanout Exchange](#fanout-exchange)
   - [Headers Exchange](#headers-exchange)
4. [Spring Boot Integration](#spring-boot-integration)
   - [Dependencies](#dependencies)
   - [Configuration](#configuration)
   - [Publishing Messages](#publishing-messages)
   - [Consuming Messages](#consuming-messages)
5. [Real-World Examples](#real-world-examples)
   - [Login Service (Producer)](#login-service-producer)
   - [Email Service (Consumer)](#email-service-consumer)
6. [Advanced Patterns](#advanced-patterns)
   - [Request-Reply Pattern](#request-reply-pattern)
   - [Publish-Subscribe Pattern](#publish-subscribe-pattern)
   - [Work Queues Pattern](#work-queues-pattern)
7. [Best Practices](#best-practices)
   - [Message Durability](#message-durability)
   - [Acknowledgments](#acknowledgments)
   - [Prefetch Count](#prefetch-count)
   - [Dead Letter Exchanges](#dead-letter-exchanges)
8. [Troubleshooting](#troubleshooting)
9. [References](#references)

## Introduction to RabbitMQ

RabbitMQ is an open-source message broker that implements the Advanced Message Queuing Protocol (AMQP). It acts as an intermediary for messaging, providing a common platform for sending and receiving messages, which enables applications to communicate with each other in a loosely coupled manner.

### Why Use RabbitMQ?

1. **Decoupling**: Services can communicate without direct dependencies
2. **Scalability**: Easily scale producers and consumers independently
3. **Resilience**: Messages persist even if consumers are temporarily unavailable
4. **Load Balancing**: Distribute work across multiple consumers
5. **Asynchronous Processing**: Non-blocking operations for better performance

### Key Benefits in Microservices Architecture

```
┌─────────────────┐                                  ┌─────────────────┐
│                 │                                  │                 │
│  Microservice A │                                  │  Microservice B │
│   (Producer)    │                                  │   (Consumer)    │
│                 │                                  │                 │
└────────┬────────┘                                  └────────▲────────┘
         │                                                    │
         │ Publish                                            │ Consume
         │                                                    │
         ▼                                                    │
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                         RabbitMQ                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

In our AWS Starter architecture, RabbitMQ enables:
- Login Service to publish login events without waiting for email processing
- Email Service to process notifications at its own pace
- System resilience when either service experiences issues
- Easy addition of new consumers for login events (e.g., analytics, audit)

## Core Concepts

### Exchanges

An exchange is a message routing agent that receives messages from producers and pushes them to queues based on rules defined by the exchange type and bindings. Think of an exchange as a post office or mail sorting facility.

```
┌─────────────────┐          ┌─────────────────┐
│                 │          │                 │
│    Producer     │─────────▶│    Exchange     │
│                 │          │                 │
└─────────────────┘          └───────┬─────────┘
                                     │
                                     │ Routes based on
                                     │ exchange type and
                                     │ routing key
                                     │
                                     ▼
                             ┌─────────────────┐
                             │                 │
                             │     Queue       │
                             │                 │
                             └─────────────────┘
```

### Queues

A queue is a buffer that stores messages until they are consumed by applications. Queues are where messages live until they are processed by a consumer. They are bound to exchanges and receive messages based on the binding rules.

Properties of queues:
- **Name**: Identifier for the queue
- **Durable**: Whether the queue survives broker restarts
- **Exclusive**: Used by only one connection and deleted when that connection closes
- **Auto-delete**: Deleted when the last consumer unsubscribes

### Bindings

A binding is a link between an exchange and a queue. It specifies the rules for routing messages from the exchange to the queue. The binding may include a routing key or header attributes depending on the exchange type.

```
┌─────────────────┐          ┌─────────────────┐
│                 │          │                 │
│    Exchange     │          │     Queue       │
│                 │          │                 │
└───────┬─────────┘          └───────▲─────────┘
        │                            │
        │                            │
        └────────────────────────────┘
                  Binding
           (with routing key)
```

### Routing Keys

A routing key is a message attribute the exchange looks at when deciding how to route the message. Think of it as the address on an envelope that the exchange uses to determine which queue(s) should receive the message.

### Message Flow

The complete message flow in RabbitMQ follows this pattern:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│             │     │             │     │             │     │             │
│  Producer   │────▶│  Exchange   │────▶│   Queue     │────▶│  Consumer   │
│             │     │             │     │             │     │             │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
       │                   ▲                   ▲
       │                   │                   │
       │                   └───────────────────┘
       │                         Binding
       │
       └─────────────────────────────────────────────┐
                      Message with                    │
                      Routing Key                     │
                                                      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  Message = {                                                            │
│    body: <application data>,                                            │
│    properties: {                                                        │
│      content_type: "application/json",                                  │
│      content_encoding: "utf-8",                                         │
│      headers: { <custom-headers> },                                     │
│      delivery_mode: 2, // 1 = non-persistent, 2 = persistent            │
│      priority: 1,                                                       │
│      correlation_id: "request-1",                                       │
│      reply_to: "reply-queue",                                           │
│      expiration: "60000", // TTL in milliseconds                        │
│      message_id: "m-1",                                                 │
│      timestamp: 1616493200,                                             │
│      type: "login.event",                                               │
│      user_id: "guest",                                                  │
│      app_id: "login-service"                                            │
│    },                                                                   │
│    routing_key: "login.events"                                          │
│  }                                                                      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## RabbitMQ Exchange Types

RabbitMQ provides four types of exchanges, each with different routing capabilities:

### Direct Exchange

A direct exchange routes messages to queues based on an exact match between the routing key of the message and the routing key of the binding.

```
                      ┌─────────────────┐
                      │                 │
                      │  Direct Exchange│
                      │                 │
                      └─┬─────────────┬─┘
                        │             │
Binding with            │             │   Binding with
routing key = "login"   │             │   routing key = "signup"
                        │             │
                        ▼             ▼
             ┌─────────────────┐ ┌─────────────────┐
             │                 │ │                 │
             │  Login Queue    │ │  Signup Queue   │
             │                 │ │                 │
             └─────────────────┘ └─────────────────┘
```

**Example**: In our system, the `login.exchange` is a direct exchange that routes login events to the `login.events.queue` using the routing key `login.events`.

### Topic Exchange

A topic exchange routes messages to queues based on wildcard matches between the routing key and the routing pattern specified in the binding.

Wildcards:
- `*` (star) substitutes exactly one word
- `#` (hash) substitutes zero or more words

```
                      ┌─────────────────┐
                      │                 │
                      │  Topic Exchange │
                      │                 │
                      └─┬─────┬─────┬───┘
                        │     │     │
Binding with            │     │     │   Binding with
routing key = "user.#"  │     │     │   routing key = "*.error"
                        │     │     │
                        ▼     │     ▼
             ┌─────────────────┐ ┌─────────────────┐
             │                 │ │                 │
             │   User Queue    │ │   Error Queue   │
             │                 │ │                 │
             └─────────────────┘ └─────────────────┘
                                  ▲
                                  │
                                  │
                      Binding with│
                      routing key = "user.*.error"
```

**Example**: A topic exchange could route messages with routing keys like:
- `user.login` → User Queue
- `user.login.error` → User Queue AND Error Queue
- `service.error` → Error Queue

### Fanout Exchange

A fanout exchange routes messages to all queues that are bound to it, regardless of routing keys or patterns. It's ideal for broadcast routing.

```
                      ┌─────────────────┐
                      │                 │
                      │ Fanout Exchange │
                      │                 │
                      └─┬─────┬─────┬───┘
                        │     │     │
                        │     │     │   
                        │     │     │   
                        │     │     │
                        ▼     ▼     ▼
             ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
             │                 │ │                 │ │                 │
             │   Email Queue   │ │   SMS Queue     │ │   Audit Queue   │
             │                 │ │                 │ │                 │
             └─────────────────┘ └─────────────────┘ └─────────────────┘
```

**Example**: A login event could be broadcast to multiple services: email notifications, SMS alerts, and audit logging.

### Headers Exchange

A headers exchange routes messages based on header attributes instead of routing keys. Messages are routed based on whether the headers match those specified in the bindings.

```
                      ┌─────────────────┐
                      │                 │
                      │Headers Exchange │
                      │                 │
                      └─┬─────────────┬─┘
                        │             │
Binding with            │             │   Binding with
headers = {format=pdf,  │             │   headers = {format=json, 
type=report, x-match=all}│            │   type=log, x-match=any}
                        │             │
                        ▼             ▼
             ┌─────────────────┐ ┌─────────────────┐
             │                 │ │                 │
             │  Reports Queue  │ │   Logs Queue    │
             │                 │ │                 │
             └─────────────────┘ └─────────────────┘
```

The `x-match` binding argument specifies how headers should be matched:
- `all` - all header values must match (AND)
- `any` - at least one header value must match (OR)
## Spring Boot Integration

Spring Boot provides excellent integration with RabbitMQ through the Spring AMQP project, making it easy to implement messaging patterns in your applications.

### Dependencies

To use RabbitMQ with Spring Boot, add the following dependency to your `pom.xml`:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-amqp</artifactId>
</dependency>
```

### Configuration

#### Application Properties

Configure RabbitMQ connection in `application.properties` or `application.yml`:

```properties
# RabbitMQ Connection
spring.rabbitmq.host=rabbitmq.sloandev.net
spring.rabbitmq.port=5672
spring.rabbitmq.username=aws-starter
spring.rabbitmq.password=aws-starter-password
spring.rabbitmq.virtual-host=/

# Custom RabbitMQ Properties
rabbitmq.enabled=true
rabbitmq.exchange.name=login.exchange
rabbitmq.queue.name=login.events.queue
rabbitmq.routing.key=login.events
```

#### RabbitMQ Configuration Class

Create a configuration class to define exchanges, queues, and bindings:

```java
@Configuration
@ConditionalOnProperty(name = "rabbitmq.enabled", havingValue = "true", matchIfMissing = false)
public class RabbitMQConfig {

    @Value("${rabbitmq.exchange.name:login-exchange}")
    private String exchangeName;

    @Value("${rabbitmq.queue.name:login-queue}")
    private String queueName;

    @Value("${rabbitmq.routing.key:login.event}")
    private String routingKey;

    @Bean
    public TopicExchange loginExchange() {
        return ExchangeBuilder
                .topicExchange(exchangeName)
                .durable(true)
                .build();
    }

    @Bean
    public Queue loginQueue() {
        return QueueBuilder
                .durable(queueName)
                .build();
    }

    @Bean
    public Binding loginBinding(Queue loginQueue, TopicExchange loginExchange) {
        return BindingBuilder
                .bind(loginQueue)
                .to(loginExchange)
                .with(routingKey);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(jsonMessageConverter());
        // Enable publisher confirms for guaranteed delivery
        rabbitTemplate.setConfirmCallback((correlationData, ack, cause) -> {
            if (!ack) {
                // Log failed message delivery
                System.err.println("Failed to deliver message: " + cause);
            }
        });
        return rabbitTemplate;
    }
}
```

This configuration:
1. Creates a durable topic exchange named `login.exchange`
2. Creates a durable queue named `login.events.queue`
3. Binds the queue to the exchange with routing key `login.events`
4. Configures message conversion to/from JSON
5. Sets up publisher confirms for reliable messaging

### Publishing Messages

To publish messages to RabbitMQ, inject the `RabbitTemplate` and use it to send messages:

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

Key points about this implementation:
1. The `@Autowired(required = false)` annotation makes RabbitMQ integration optional
2. We check if RabbitMQ is available before attempting to send messages
3. We use try-catch to handle messaging errors gracefully
4. The `convertAndSend` method automatically converts the Java object to JSON

### Consuming Messages

To consume messages from RabbitMQ, use the `@RabbitListener` annotation:

```java
@Slf4j
@Service
@RequiredArgsConstructor
public class LoginEventConsumer {

    private final EmailService emailService;

    @RabbitListener(queues = "${rabbitmq.queue.name:login-queue}")
    public void consumeLoginEvent(LoginEvent loginEvent) {
        try {
            log.info("Received login event: {}", loginEvent);
            
            // Process the login event
            emailService.sendLoginNotification(
                    loginEvent.getEmail(),
                    loginEvent.getName(),
                    loginEvent.getOrganization()
            );
            
            log.info("Successfully processed login event for user: {}", loginEvent.getEmail());
        } catch (Exception e) {
            log.error("Error processing login event: {}", e.getMessage(), e);
            // We don't rethrow to prevent message redelivery for non-recoverable errors
        }
    }
}
```

Key points about this implementation:
1. The `@RabbitListener` annotation designates this method as a message consumer
2. Spring automatically deserializes the JSON message to a `LoginEvent` object
3. We use try-catch to handle processing errors gracefully
4. By default, Spring AMQP acknowledges messages automatically after successful processing

### Message Model

The message payload is a simple POJO (Plain Old Java Object) that is serialized to JSON:

```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginEvent implements Serializable {
    private String userId;
    private String email;
    private String name;
    private String organization;
    private LocalDateTime loginTime;
}
```

This class must be present in both the producer and consumer services with the same structure.

## Real-World Examples

Let's explore how our AWS Starter microservices use RabbitMQ for communication.

### Login Service (Producer)

The Login Service publishes login events to RabbitMQ whenever a user logs in. This allows the system to perform asynchronous tasks like sending email notifications without blocking the login process.

#### Architecture

```
┌─────────────────┐          ┌─────────────────┐          ┌─────────────────┐
│                 │          │                 │          │                 │
│  Login Service  │─────────▶│    RabbitMQ     │─────────▶│  Email Service  │
│                 │  publish │                 │  consume │                 │
└─────────────────┘          └─────────────────┘          └─────────────────┘
        │                                                         │
        │                                                         │
        ▼                                                         ▼
┌─────────────────┐                                      ┌─────────────────┐
│                 │                                      │                 │
│    MongoDB      │                                      │   SMTP Server   │
│                 │                                      │                 │
└─────────────────┘                                      └─────────────────┘
```

#### Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Login Service                                 │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
                                    │ 1. User logs in
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ LoginController.login(LoginRequest) → LoginService.login(LoginRequest)  │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
                                    │ 2. Create LoginEvent
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ LoginEvent(userId, email, name, organization, loginTime)                │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
                                    │ 3. Send to RabbitMQ
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ LoginEventProducer.sendLoginEvent(loginEvent)                           │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
                                    │ 4. Convert and send
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ rabbitTemplate.convertAndSend(exchangeName, routingKey, loginEvent)     │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
                                    │ 5. Return login response to user
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ LoginResponse(success=true, message="Login successful")                 │
└─────────────────────────────────────────────────────────────────────────┘
```

#### Implementation Details

1. **Login Controller**: Receives login requests and delegates to the login service
2. **Login Service**: Processes login requests and creates login events
3. **LoginEventProducer**: Sends login events to RabbitMQ
4. **RabbitMQConfig**: Configures the exchange, queue, and bindings

The key advantage is that the login process completes quickly, even if email notification processing takes time.

### Email Service (Consumer)

The Email Service consumes login events from RabbitMQ and sends email notifications to users.

#### Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Email Service                                 │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
                                    │ 1. Listen for messages
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ @RabbitListener(queues = "${rabbitmq.queue.name:login-queue}")          │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
                                    │ 2. Receive LoginEvent
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ LoginEventConsumer.consumeLoginEvent(LoginEvent)                        │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
                                    │ 3. Process event
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ emailService.sendLoginNotification(email, name, organization)           │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
                                    │ 4. Send email
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ JavaMailSender.send(MimeMessage)                                        │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
                                    │ 5. Acknowledge message
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ (Automatic acknowledgment by Spring AMQP)                               │
└─────────────────────────────────────────────────────────────────────────┘
```

#### Implementation Details

1. **LoginEventConsumer**: Listens for login events and processes them
2. **EmailService**: Sends email notifications to users
3. **RabbitMQConfig**: Configures the connection to RabbitMQ

The Email Service can scale independently of the Login Service, allowing the system to handle high volumes of login events without affecting login performance.

### Message Flow Between Services

```
┌─────────────────┐                                  ┌─────────────────┐
│  Login Service  │                                  │  Email Service  │
└───────┬─────────┘                                  └───────┬─────────┘
        │                                                    │
        │ 1. Create LoginEvent                               │
        │    - userId: "123"                                 │
        │    - email: "user@example.com"                     │
        │    - name: "John Doe"                              │
        │    - organization: "ACME Inc."                     │
        │    - loginTime: "2025-03-24T21:30:00"              │
        │                                                    │
        │ 2. Publish to Exchange                             │
        │    - exchange: "login.exchange"                    │
        │    - routingKey: "login.events"                    │
        │    - payload: LoginEvent (as JSON)                 │
        │                                                    │
        │                  ┌─────────────────┐               │
        └─────────────────▶│                 │               │
                           │    RabbitMQ     │               │
                           │                 │───────────────┘
                           └─────────────────┘               │
                                                             │
                                                             │ 3. Consume from Queue
                                                             │    - queue: "login.events.queue"
                                                             │    - payload: LoginEvent (as Java object)
                                                             │
                                                             │ 4. Process Event
                                                             │    - Extract user information
                                                             │    - Generate email content
                                                             │    - Send email notification
                                                             │
                                                             │ 5. Acknowledge Message
                                                             │    (automatic with @RabbitListener)
                                                             │
                                                             ▼
```

This asynchronous messaging pattern provides several benefits:
1. **Decoupling**: The Login Service doesn't need to know about email sending logic
2. **Resilience**: If the Email Service is down, logins still succeed
3. **Scalability**: Each service can scale independently based on its workload
4. **Performance**: Login responses are faster because email sending happens asynchronously
## Advanced Patterns

### Request-Reply Pattern

The Request-Reply pattern is useful when a service needs to make a synchronous-like request to another service and wait for a response.

```
┌─────────────────┐                                  ┌─────────────────┐
│                 │                                  │                 │
│  Service A      │                                  │  Service B      │
│  (Requester)    │                                  │  (Responder)    │
│                 │                                  │                 │
└────────┬────────┘                                  └────────▲────────┘
         │                                                    │
         │ 1. Send request with                               │
         │    replyTo queue                                   │
         │                                                    │
         ▼                                                    │
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                         RabbitMQ                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
         ▲                                                    │
         │                                                    │
         │ 3. Receive                                         │ 2. Process request
         │    response                                        │    and send response
         │                                                    │
┌────────┴────────┐                                  ┌────────┴────────┐
│                 │                                  │                 │
│  Reply Queue    │◀─────────────────────────────────│  Service B      │
│                 │                                  │                 │
└─────────────────┘                                  └─────────────────┘
```

#### Implementation

**Requester:**
```java
@Service
public class UserServiceClient {
    private final RabbitTemplate rabbitTemplate;
    private final String requestExchange;
    private final String requestRoutingKey;
    
    public UserServiceClient(RabbitTemplate rabbitTemplate,
                           @Value("${user.request.exchange}") String requestExchange,
                           @Value("${user.request.routing-key}") String requestRoutingKey) {
        this.rabbitTemplate = rabbitTemplate;
        this.requestExchange = requestExchange;
        this.requestRoutingKey = requestRoutingKey;
    }
    
    public UserDetails getUserDetails(String userId) {
        // Send request and wait for response (with 5 second timeout)
        return rabbitTemplate.convertSendAndReceive(
            requestExchange,
            requestRoutingKey,
            new UserDetailsRequest(userId),
            message -> {
                message.getMessageProperties().setReplyTo("user.details.reply");
                message.getMessageProperties().setCorrelationId(UUID.randomUUID().toString());
                return message;
            },
            5000
        );
    }
}
```

**Responder:**
```java
@Service
public class UserDetailsService {
    private final UserRepository userRepository;
    
    @RabbitListener(queues = "${user.request.queue}")
    public UserDetails handleUserDetailsRequest(UserDetailsRequest request) {
        User user = userRepository.findById(request.getUserId())
            .orElseThrow(() -> new UserNotFoundException(request.getUserId()));
            
        return new UserDetails(
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getFullName()
        );
    }
}
```

### Publish-Subscribe Pattern

The Publish-Subscribe pattern allows a message to be broadcast to multiple consumers. This is implemented using a fanout exchange.

```
┌─────────────────┐
│                 │
│    Publisher    │
│                 │
└────────┬────────┘
         │
         │ Publish
         │
         ▼
┌─────────────────┐
│                 │
│ Fanout Exchange │
│                 │
└─┬─────────┬─────┘
  │         │
  │         │
  ▼         ▼
┌─────┐   ┌─────┐
│     │   │     │
│Queue│   │Queue│
│  A  │   │  B  │
│     │   │     │
└──┬──┘   └──┬──┘
   │         │
   │         │
   ▼         ▼
┌─────┐   ┌─────┐
│Sub 1│   │Sub 2│
└─────┘   └─────┘
```

#### Implementation

**Configuration:**
```java
@Configuration
public class NotificationConfig {
    @Bean
    public FanoutExchange notificationExchange() {
        return new FanoutExchange("notification.exchange");
    }
    
    @Bean
    public Queue emailNotificationQueue() {
        return new Queue("notification.email.queue");
    }
    
    @Bean
    public Queue smsNotificationQueue() {
        return new Queue("notification.sms.queue");
    }
    
    @Bean
    public Queue pushNotificationQueue() {
        return new Queue("notification.push.queue");
    }
    
    @Bean
    public Binding emailBinding(Queue emailNotificationQueue, FanoutExchange notificationExchange) {
        return BindingBuilder.bind(emailNotificationQueue).to(notificationExchange);
    }
    
    @Bean
    public Binding smsBinding(Queue smsNotificationQueue, FanoutExchange notificationExchange) {
        return BindingBuilder.bind(smsNotificationQueue).to(notificationExchange);
    }
    
    @Bean
    public Binding pushBinding(Queue pushNotificationQueue, FanoutExchange notificationExchange) {
        return BindingBuilder.bind(pushNotificationQueue).to(notificationExchange);
    }
}
```

**Publisher:**
```java
@Service
public class NotificationService {
    private final RabbitTemplate rabbitTemplate;
    
    public NotificationService(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }
    
    public void sendNotification(NotificationEvent event) {
        rabbitTemplate.convertAndSend("notification.exchange", "", event);
    }
}
```

**Consumers:**
```java
@Service
public class EmailNotificationConsumer {
    @RabbitListener(queues = "notification.email.queue")
    public void handleNotification(NotificationEvent event) {
        // Send email notification
    }
}

@Service
public class SmsNotificationConsumer {
    @RabbitListener(queues = "notification.sms.queue")
    public void handleNotification(NotificationEvent event) {
        // Send SMS notification
    }
}

@Service
public class PushNotificationConsumer {
    @RabbitListener(queues = "notification.push.queue")
    public void handleNotification(NotificationEvent event) {
        // Send push notification
    }
}
```

### Work Queues Pattern

The Work Queues pattern (also known as Task Queues) distributes time-consuming tasks among multiple workers.

```
┌─────────────────┐
│                 │
│     Producer    │
│                 │
└────────┬────────┘
         │
         │ Tasks
         │
         ▼
┌─────────────────────────────────────────┐
│                                         │
│                 Queue                   │
│                                         │
└─────────┬─────────────┬─────────────┬───┘
          │             │             │
          │             │             │
          ▼             ▼             ▼
    ┌───────────┐ ┌───────────┐ ┌───────────┐
    │           │ │           │ │           │
    │  Worker 1 │ │  Worker 2 │ │  Worker 3 │
    │           │ │           │ │           │
    └───────────┘ └───────────┘ └───────────┘
```

#### Implementation

**Producer:**
```java
@Service
public class ImageProcessingService {
    private final RabbitTemplate rabbitTemplate;
    
    public ImageProcessingService(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }
    
    public void processImage(String imageId, String imageUrl) {
        ImageProcessingTask task = new ImageProcessingTask(imageId, imageUrl);
        rabbitTemplate.convertAndSend("image.processing.exchange", "image.task", task);
    }
}
```

**Consumer:**
```java
@Service
public class ImageProcessingWorker {
    @RabbitListener(queues = "image.processing.queue", concurrency = "3")
    public void processImage(ImageProcessingTask task) {
        // Download image
        // Process image (resize, filter, etc.)
        // Upload processed image
        // Update database
    }
}
```

The `concurrency = "3"` parameter creates 3 consumers that share the same queue, effectively creating 3 workers.

## Best Practices

### Message Durability

To ensure messages aren't lost when RabbitMQ restarts, configure durable exchanges, queues, and persistent messages:

```java
// Durable exchange
@Bean
public TopicExchange exchange() {
    return ExchangeBuilder.topicExchange("my.exchange")
            .durable(true)
            .build();
}

// Durable queue
@Bean
public Queue queue() {
    return QueueBuilder.durable("my.queue")
            .build();
}

// Persistent messages
public void sendMessage(Object message) {
    rabbitTemplate.convertAndSend("my.exchange", "my.routing.key", message,
        m -> {
            m.getMessageProperties().setDeliveryMode(MessageDeliveryMode.PERSISTENT);
            return m;
        });
}
```

### Acknowledgments

By default, Spring AMQP acknowledges messages automatically after successful processing. For more control, configure manual acknowledgment:

```java
@Bean
public SimpleRabbitListenerContainerFactory rabbitListenerContainerFactory(
        ConnectionFactory connectionFactory,
        MessageConverter messageConverter) {
    SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
    factory.setConnectionFactory(connectionFactory);
    factory.setMessageConverter(messageConverter);
    factory.setAcknowledgeMode(AcknowledgeMode.MANUAL);
    return factory;
}

@RabbitListener(queues = "my.queue")
public void processMessage(Message message, Channel channel) throws IOException {
    try {
        // Process message
        // ...
        
        // Acknowledge message
        channel.basicAck(message.getMessageProperties().getDeliveryTag(), false);
    } catch (Exception e) {
        // Reject message and requeue
        channel.basicNack(message.getMessageProperties().getDeliveryTag(), false, true);
    }
}
```

### Prefetch Count

The prefetch count limits the number of unacknowledged messages a consumer can have at once. This helps distribute work evenly among consumers:

```java
@Bean
public SimpleRabbitListenerContainerFactory rabbitListenerContainerFactory(
        ConnectionFactory connectionFactory) {
    SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
    factory.setConnectionFactory(connectionFactory);
    factory.setPrefetchCount(1); // Only fetch one message at a time
    return factory;
}
```

### Dead Letter Exchanges

A Dead Letter Exchange (DLX) handles messages that can't be delivered or processed:

```java
@Bean
public DirectExchange deadLetterExchange() {
    return new DirectExchange("dead-letter.exchange");
}

@Bean
public Queue deadLetterQueue() {
    return QueueBuilder.durable("dead-letter.queue").build();
}

@Bean
public Binding deadLetterBinding() {
    return BindingBuilder.bind(deadLetterQueue())
            .to(deadLetterExchange())
            .with("dead-letter");
}

@Bean
public Queue myQueue() {
    return QueueBuilder.durable("my.queue")
            .withArgument("x-dead-letter-exchange", "dead-letter.exchange")
            .withArgument("x-dead-letter-routing-key", "dead-letter")
            .build();
}
```

## Troubleshooting

### Common Issues and Solutions

#### Connection Issues

**Problem**: Unable to connect to RabbitMQ server
**Solutions**:
- Verify RabbitMQ is running: `systemctl status rabbitmq-server`
- Check connection properties in `application.properties`
- Ensure network connectivity: `telnet rabbitmq.sloandev.net 5672`
- Verify security groups allow traffic on port 5672

#### Message Not Being Delivered

**Problem**: Messages are published but not received by consumers
**Solutions**:
- Check exchange and queue names match in both producer and consumer
- Verify routing key is correct
- Ensure queue is bound to the exchange with the correct routing key
- Check if messages are being routed to dead letter queue

#### Serialization Issues

**Problem**: `ClassCastException` or deserialization errors
**Solutions**:
- Ensure message classes have the same structure in producer and consumer
- Use the same serialization mechanism (e.g., Jackson2JsonMessageConverter)
- Add `@JsonIgnoreProperties(ignoreUnknown = true)` to DTOs for forward compatibility

#### Consumer Exceptions

**Problem**: Consumer throws exceptions while processing messages
**Solutions**:
- Implement proper error handling in consumers
- Consider using a dead letter queue for failed messages
- Use manual acknowledgment for better control over message processing

### Diagnostic Commands

```bash
# List exchanges
rabbitmqctl list_exchanges

# List queues
rabbitmqctl list_queues name messages_ready messages_unacknowledged

# List bindings
rabbitmqctl list_bindings source_name source_kind destination_name destination_kind routing_key

# List connections
rabbitmqctl list_connections user peer_host state channels

# List consumers
rabbitmqctl list_consumers

# Purge a queue
rabbitmqctl purge_queue queue_name

# Get a message from a queue (without consuming it)
rabbitmqctl get_message queue_name
```

### Monitoring RabbitMQ

The RabbitMQ Management UI (accessible at http://rabbitmq.sloandev.net:15672) provides a comprehensive dashboard for monitoring:

- **Overview**: System-wide metrics
- **Connections**: Client connections
- **Channels**: Client channels
- **Exchanges**: Exchange metrics and bindings
- **Queues**: Queue metrics, including message rates and consumer counts
- **Admin**: User management and policies

## References

1. [Spring AMQP Documentation](https://docs.spring.io/spring-amqp/docs/current/reference/html/)
2. [RabbitMQ Documentation](https://www.rabbitmq.com/documentation.html)
3. [RabbitMQ Tutorials](https://www.rabbitmq.com/getstarted.html)
4. [AWS Starter RabbitMQ Integration Guide](/home/msloan/gitprojects/aws-starter/aws-react-hello-world/docs/RabbitMQ/rabbitmq-integration-guide.md)

---

## Conclusion

RabbitMQ is a powerful message broker that enables asynchronous communication between microservices. By using RabbitMQ with Spring Boot, you can implement various messaging patterns to build resilient, scalable, and loosely coupled systems.

In our AWS Starter architecture, RabbitMQ plays a crucial role in decoupling the Login Service from the Email Service, allowing each service to operate independently while still communicating effectively.

As you continue developing with RabbitMQ, remember these key principles:
1. **Decoupling**: Design services to operate independently
2. **Resilience**: Implement proper error handling and message durability
3. **Scalability**: Design for horizontal scaling of producers and consumers
4. **Monitoring**: Keep an eye on queue depths and message rates

Happy messaging!
