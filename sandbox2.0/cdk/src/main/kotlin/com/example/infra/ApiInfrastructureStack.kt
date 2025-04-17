package com.example.infra

import software.amazon.awscdk.CfnOutput
import software.amazon.awscdk.Stack
import software.amazon.awscdk.StackProps
import software.amazon.awscdk.services.apigateway.*
import software.amazon.awscdk.services.certificatemanager.Certificate
import software.constructs.Construct

/**
 * Base infrastructure stack that creates a shared API Gateway
 * This allows multiple service stacks to add their endpoints to a single API Gateway
 */
class ApiInfrastructureStack(scope: Construct, id: String, props: StackProps) : Stack(scope, id, props) {
    
    // Expose the API Gateway so other stacks can access it
    val api: RestApi
    
    init {
        // Create a single API Gateway for all services
        api = RestApi.Builder.create(this, "UnifiedApiGateway")
            .restApiName("sloandev-unified-api")
            .description("Unified API Gateway for all microservices")
            .defaultCorsPreflightOptions(CorsOptions.builder()
                .allowOrigins(listOf("https://sloandev.net"))
                .allowMethods(listOf("GET", "POST", "PUT", "DELETE", "OPTIONS"))
                .allowHeaders(listOf("Content-Type", "X-Amz-Date", "Authorization", "X-Api-Key"))
                .build())
            .build()
            
        // Custom domain configuration with your existing certificate
        val domainName = DomainName.Builder.create(this, "ApiDomainName")
            .domainName("api.sloandev.net")
            .certificate(Certificate.fromCertificateArn(this, "Certificate", 
                "arn:aws:acm:us-west-1:076034795794:certificate/6aee3b95-d747-4f5a-b9ec-2581e217bbf0"))
            .endpointType(EndpointType.EDGE)
            .build()
            
        BasePathMapping.Builder.create(this, "ApiMapping")
            .domainName(domainName)
            .restApi(api)
            .stage(api.deploymentStage)
            .build()
            
        // Output the custom domain URL
        CfnOutput.Builder.create(this, "ApiUrl")
            .description("API Gateway endpoint URL")
            .value("https://api.sloandev.net/")
            .build()
    }
}
