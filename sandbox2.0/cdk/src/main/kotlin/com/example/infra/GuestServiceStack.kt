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
 * Stack for the Guest Registration service
 * Uses the shared API Gateway from ApiInfrastructureStack and the MicroserviceConstruct
 * for better organization of Lambda functions
 */
class GuestServiceStack(
    scope: Construct, 
    id: String, 
    props: StackProps,
    private val apiStack: ApiInfrastructureStack  // Reference to the API Infrastructure stack
) : Stack(scope, id, props) {
    
    init {
        // Get the shared API Gateway from the API Infrastructure stack
        val api = apiStack.api
            
        // Get existing VPC for MongoDB access
        val vpc = Vpc.fromLookup(this, "ExistingVpc", VpcLookup.builder()
            .isDefault(true)
            .build())
            
        // Create security group for Lambda to access MongoDB
        val lambdaSecurityGroup = SecurityGroup.Builder.create(this, "LambdaSecurityGroup")
            .vpc(vpc)
            .description("Security group for Lambda functions to access MongoDB")
            .allowAllOutbound(true)
            .build()
            
        // Environment variables for MongoDB connection
        val mongoDbEnv = mapOf(
            "MONGODB_URI" to "mongodb://admin:admin123@13.52.157.48:27017/aws_starter_db",
            "MONGODB_DATABASE" to "aws_starter_db",
            "MONGODB_COLLECTION" to "guests"
        )
        
        // Create the Guests microservice construct
        val guestsService = MicroserviceConstruct(this, "GuestsService", MicroserviceProps(
            serviceName = "guests",
            api = api,
            jarPath = "../services/guests/build/libs/guests-all.jar",
            basePackage = "com.example.guests",
            vpc = vpc,
            securityGroup = lambdaSecurityGroup,
            environment = mongoDbEnv,
            memorySize = 512,
            timeout = Duration.seconds(30)
        ))
        
        // Add functions to the microservice
        val registerGuestFunction = guestsService.addFunction(
            functionName = "register",
            handler = "RegisterGuestHandler",
            httpMethod = "POST"
        )
        
        val getGuestsFunction = guestsService.addFunction(
            functionName = "getAll",
            handler = "GetGuestsHandler",
            httpMethod = "GET"
        )
        
        // Output the service endpoints
        CfnOutput.Builder.create(this, "GuestServiceEndpoints")
            .description("Guest Service API Endpoints")
            .value("GET/POST https://api.sloandev.net/guests")
            .build()
    }
}
