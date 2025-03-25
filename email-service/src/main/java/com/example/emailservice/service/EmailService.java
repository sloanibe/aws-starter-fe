package com.example.emailservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.ses.SesClient;
import software.amazon.awssdk.services.ses.model.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final SesClient sesClient;

    @Value("${aws.ses.sender-email}")
    private String senderEmail;

    @Value("${aws.ses.template-name}")
    private String templateName;

    public void sendLoginNotification(String userEmail, String userName, String organization) {
        try {
            log.info("Sending login notification for user: {} ({}) from organization: {}", 
                    userName, userEmail, organization);
            
            SendTemplatedEmailRequest emailRequest = SendTemplatedEmailRequest.builder()
                    .destination(Destination.builder().toAddresses(senderEmail).build())
                    .source(senderEmail)
                    .template(templateName)
                    .templateData(String.format(
                            "{\"userName\":\"%s\"," +
                            "\"userEmail\":\"%s\"," +
                            "\"organization\":\"%s\"," +
                            "\"loginTime\":\"%s\"," +
                            "\"appUrl\":\"https://sloandev.net\"}",
                            userName, userEmail, organization, java.time.LocalDateTime.now()))
                    .build();

            SendTemplatedEmailResponse response = sesClient.sendTemplatedEmail(emailRequest);
            log.info("Login notification sent successfully. MessageId: {}", response.messageId());
        } catch (SesException e) {
            log.error("Failed to send login notification: {}", e.getMessage(), e);
            // We don't rethrow to prevent cascading failures
        }
    }
}
