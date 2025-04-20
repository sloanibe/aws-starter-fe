package com.example.loginservice.service;

import com.example.loginservice.dto.LoginEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.AmqpException;
import org.springframework.amqp.core.MessageProperties;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class LoginEventProducer {

    private RabbitTemplate rabbitTemplate;
    private String exchangeName;
    private String routingKey;
    private boolean rabbitMqAvailable;

    @Autowired
    public LoginEventProducer(RabbitTemplate rabbitTemplate, 
                               @Value("${rabbitmq.exchange.name:login-exchange}") String exchangeName,
                               @Value("${rabbitmq.routing.key:login.events}") String routingKey,
                               @Value("${rabbitmq.enabled:false}") boolean rabbitMqAvailable) {
        this.rabbitTemplate = rabbitTemplate;
        this.exchangeName = exchangeName;
        this.routingKey = routingKey;
        this.rabbitMqAvailable = rabbitMqAvailable;
        
        log.info("!!!!!!!!!!! LOGIN-EVENT-PRODUCER INITIALIZED with latest code update !!!!!!!!!!!");
        log.info("!!!!!!!!!!! Using exchange: {} and routing key: {} !!!!!!!!!!!", exchangeName, routingKey);
        log.info("!!!!!!!!!!! RabbitMQ available: {} !!!!!!!!!!!", rabbitMqAvailable);
    }

    public void sendLoginEvent(LoginEvent loginEvent) {
        if (!rabbitMqAvailable) {
            log.warn("RabbitMQ not available. Login will proceed but notification will not be sent: {}", loginEvent);
            return;
        }
        
        try {
            log.info("Sending login event to RabbitMQ: {}", loginEvent);
            
            // Use RabbitTemplate's convertAndSend with explicit message post-processor to set content type
            rabbitTemplate.convertAndSend(exchangeName, routingKey, loginEvent, message -> {
                MessageProperties props = message.getMessageProperties();
                props.setContentType(MessageProperties.CONTENT_TYPE_JSON);
                
                // Log the JSON payload for debugging
                String jsonPayload = new String(message.getBody());
                log.info("Sending JSON message: {}", jsonPayload);
                
                log.info("Setting message content type to: {}", props.getContentType());
                return message;
            });
            
            log.info("Login event sent successfully with JSON content type");
        } catch (AmqpException e) {
            log.error("Failed to send login event: {}", e.getMessage(), e);
            // We don't rethrow the exception to prevent login failure if messaging fails
        }
    }
}
