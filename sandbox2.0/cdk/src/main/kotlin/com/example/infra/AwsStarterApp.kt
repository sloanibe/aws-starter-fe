package com.example.infra

import software.amazon.awscdk.App
import software.amazon.awscdk.Environment
import software.amazon.awscdk.StackProps

/**
 * Main entry point for the CDK application
 * Creates the API infrastructure stack first, then service stacks that use the shared API
 */
fun main() {
    val app = App()
    
    val env = Environment.builder()
        .account(System.getenv("CDK_DEFAULT_ACCOUNT"))
        .region(System.getenv("CDK_DEFAULT_REGION") ?: "us-west-1")
        .build()
    
    // Create the base API infrastructure stack first
    val apiStack = ApiInfrastructureStack(app, "ApiInfrastructureStack", StackProps.builder()
        .env(env)
        .description("Shared API Gateway infrastructure")
        .build())
    
    // Create the guest service stack, passing the API stack as a dependency
    GuestServiceStack(app, "GuestServiceStack", StackProps.builder()
        .env(env)
        .description("Serverless guest registration service")
        .build(), apiStack)
    
    // Create the email service stack, also using the shared API Gateway
    EmailServiceStack(app, "EmailServiceStack", StackProps.builder()
        .env(env)
        .description("Serverless email service")
        .build(), apiStack)
    
    // Additional service stacks can be added here following the same pattern
    
    app.synth()
}
