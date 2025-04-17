package com.example.infra

import com.example.infra.constructs.MicroserviceConstruct
import com.example.infra.constructs.MicroserviceProps
import software.amazon.awscdk.CfnOutput
import software.amazon.awscdk.Duration
import software.amazon.awscdk.Stack
import software.amazon.awscdk.StackProps
import software.amazon.awscdk.services.ec2.SecurityGroup
import software.amazon.awscdk.services.ec2.Vpc
import software.amazon.awscdk.services.ec2.VpcLookup
import software.amazon.awscdk.services.apigateway.RestApi
import software.constructs.Construct

/**
 * Stack for the Email service
 * Uses the shared API Gateway from ApiInfrastructureStack and the MicroserviceConstruct
 * for better organization of Lambda functions
 */
class EmailServiceStack(
    scope: Construct, 
    id: String, 
    props: StackProps,
    private val apiStack: ApiInfrastructureStack  // Reference to the API Infrastructure stack
) : Stack(scope, id, props) {
    
    init {
        // Get the shared API Gateway from the API Infrastructure stack
        val api = apiStack.api
            
        // Get existing VPC if needed
        val vpc = Vpc.fromLookup(this, "ExistingVpc", VpcLookup.builder()
            .isDefault(true)
            .build())
            
        // Create security group for Lambda functions
        val lambdaSecurityGroup = SecurityGroup.Builder.create(this, "EmailLambdaSecurityGroup")
            .vpc(vpc)
            .description("Security group for Email service Lambda functions")
            .allowAllOutbound(true)
            .build()
            
        // Environment variables for email service
        val emailServiceEnv = mapOf(
            "SES_REGION" to "us-west-1",
            "EMAIL_FROM" to "noreply@sloandev.net",
            "EMAIL_TEMPLATE_BUCKET" to "sloandev-email-templates"
        )
        
        // Create the Email microservice construct
        val emailService = MicroserviceConstruct(this, "EmailService", MicroserviceProps(
            serviceName = "emails",
            api = api,
            jarPath = "../services/emails/build/libs/emails-all.jar",
            basePackage = "com.example.emails",
            vpc = vpc,
            securityGroup = lambdaSecurityGroup,
            environment = emailServiceEnv,
            memorySize = 512,
            timeout = Duration.seconds(30)
        ))
        
        // Add functions to the microservice
        val sendEmailFunction = emailService.addFunction(
            functionName = "send",
            handler = "SendEmailHandler",
            httpMethod = "POST"
        )
        
        val getTemplatesFunction = emailService.addFunction(
            functionName = "getTemplates",
            handler = "GetTemplatesHandler",
            httpMethod = "GET"
        )
        
        val sendBulkEmailFunction = emailService.addFunction(
            functionName = "sendBulk",
            handler = "SendBulkEmailHandler",
            httpMethod = "POST",
            path = "/bulk"  // Creates /emails/bulk endpoint
        )
        
        // Output the service endpoints
        CfnOutput.Builder.create(this, "EmailServiceEndpoints")
            .description("Email Service API Endpoints")
            .value("POST https://api.sloandev.net/emails, GET https://api.sloandev.net/emails, POST https://api.sloandev.net/emails/bulk")
            .build()
    }
}
