package com.example.awsstarterapi.service;

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

    @Value("${aws.ses.welcome-template-name:login-notification-dev}")
    private String welcomeTemplateName;

    public void sendWelcomeEmail(String userEmail, String userName, String organization) {
        try {
            SendTemplatedEmailRequest emailRequest = SendTemplatedEmailRequest.builder()
                    .destination(Destination.builder().toAddresses(userEmail).build())
                    .source(senderEmail)
                    .template(welcomeTemplateName)
                    .templateData(String.format(
                            "{\"userName\":\"%s\",\"userEmail\":\"%s\",\"organization\":\"%s\",\"appUrl\":\"https://sloandev.net\"}",
                            userName, userEmail, organization))
                    .build();

            SendTemplatedEmailResponse response = sesClient.sendTemplatedEmail(emailRequest);
            log.info("Welcome email sent successfully to {}. MessageId: {}", userEmail, response.messageId());
        } catch (SesException e) {
            log.error("Failed to send welcome email: {}", e.getMessage());
            throw new RuntimeException("Failed to send welcome email", e);
        }
    }

    public void sendGuestVisitNotification(String guestEmail, String guestName, String guestCompany) {
        try {
            SendTemplatedEmailRequest emailRequest = SendTemplatedEmailRequest.builder()
                    .destination(Destination.builder().toAddresses(senderEmail).build())
                    .source(senderEmail)
                    .template(templateName)
                    .templateData(String.format(
                            "{\"guestName\":\"%s\"," +
                            "\"guestEmail\":\"%s\"," +
                            "\"guestCompany\":\"%s\"," +
                            "\"visitTime\":\"%s\"," +
                            "\"appUrl\":\"https://sloandev.net\"}",
                            guestName, guestEmail, guestCompany, java.time.LocalDateTime.now()))
                    .build();

            SendTemplatedEmailResponse response = sesClient.sendTemplatedEmail(emailRequest);
            log.info("Guest visit notification sent successfully. MessageId: {}", response.messageId());
        } catch (SesException e) {
            log.error("Failed to send guest visit notification: {}", e.getMessage());
            throw new RuntimeException("Failed to send guest visit notification", e);
        }
    }
}
