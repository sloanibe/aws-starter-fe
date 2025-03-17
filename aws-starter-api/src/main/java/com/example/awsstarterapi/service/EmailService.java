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

    public void sendWelcomeEmail(String userEmail, String userName, String organization) {
        try {
            SendTemplatedEmailRequest emailRequest = SendTemplatedEmailRequest.builder()
                    .destination(Destination.builder().toAddresses(userEmail).build())
                    .source(senderEmail)
                    .template(templateName)
                    .templateData(String.format(
                            "{\"userName\":\"%s\"," +
                            "\"userEmail\":\"%s\"," +
                            "\"organization\":\"%s\"," +
                            "\"appUrl\":\"https://app.sloandev.net\"}",
                            userName, userEmail, organization))
                    .build();

            SendTemplatedEmailResponse response = sesClient.sendTemplatedEmail(emailRequest);
            log.info("Email sent successfully to {}. MessageId: {}", userEmail, response.messageId());
        } catch (SesException e) {
            log.error("Failed to send welcome email to {}: {}", userEmail, e.getMessage());
            throw new RuntimeException("Failed to send welcome email", e);
        }
    }
}
