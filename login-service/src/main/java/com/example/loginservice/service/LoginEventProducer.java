package com.example.loginservice.service;

import com.example.loginservice.dto.LoginEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.AmqpException;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class LoginEventProducer {

    private RabbitTemplate rabbitTemplate;
    private boolean rabbitMqAvailable = false;

    @Value("${rabbitmq.exchange.name:login-exchange}")
    private String exchangeName;

    @Value("${rabbitmq.routing.key:login.event}")
    private String routingKey;
    
    @Value("${rabbitmq.enabled:false}")
    private boolean rabbitMqEnabled;

    @Autowired(required = false)
    public void setRabbitTemplate(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
        this.rabbitMqAvailable = true;
        log.info("RabbitMQ integration available");
    }

    public void sendLoginEvent(LoginEvent loginEvent) {
        if (!rabbitMqEnabled) {
            log.info("RabbitMQ integration disabled by configuration. Skipping message: {}", loginEvent);
            return;
        }
        
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
