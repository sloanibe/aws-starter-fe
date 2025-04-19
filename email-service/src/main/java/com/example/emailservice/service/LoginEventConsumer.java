package com.example.emailservice.service;

import com.example.emailservice.dto.LoginEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class LoginEventConsumer {

    private final EmailService emailService;

    @RabbitListener(queues = "${rabbitmq.queue.name}")
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
