package com.example.infra.constructs

import software.amazon.awscdk.Duration
import software.amazon.awscdk.services.apigateway.*
import software.amazon.awscdk.services.ec2.ISecurityGroup
import software.amazon.awscdk.services.ec2.IVpc
import software.amazon.awscdk.services.ec2.SubnetSelection
import software.amazon.awscdk.services.ec2.SubnetType
import software.amazon.awscdk.services.iam.Effect
import software.amazon.awscdk.services.iam.PolicyStatement
import software.amazon.awscdk.services.lambda.Code
import software.amazon.awscdk.services.lambda.Function
import software.amazon.awscdk.services.lambda.Runtime
import software.constructs.Construct
import java.util.*

/**
 * Properties for the MicroserviceConstruct
 */
data class MicroserviceProps(
    val serviceName: String,                // Name of the microservice (e.g., "guests", "emails")
    val api: RestApi,                       // Shared API Gateway
    val jarPath: String,                    // Path to the service's JAR file
    val basePackage: String,                // Base package for handlers (e.g., "com.example.guests")
    val vpc: IVpc? = null,                  // Optional VPC for the service
    val securityGroup: ISecurityGroup? = null, // Optional security group
    val environment: Map<String, String> = mapOf(), // Environment variables
    val memorySize: Int = 512,              // Lambda memory size
    val timeout: Duration = Duration.seconds(30) // Lambda timeout
)

/**
 * A construct that represents a microservice with multiple Lambda functions
 * sharing the same API Gateway.
 */
class MicroserviceConstruct(
    scope: Construct,
    id: String,
    private val props: MicroserviceProps
) : Construct(scope, id) {
    
    // Map to store created Lambda functions by name
    private val functions = mutableMapOf<String, Function>()
    
    // The API resource for this microservice (e.g., /guests)
    val apiResource: Resource
    
    init {
        // Create the base resource for this microservice
        apiResource = props.api.root.addResource(props.serviceName)
        
        // Add standard IAM permissions if using VPC
        if (props.vpc != null && props.securityGroup != null) {
            // Add standard VPC permissions that all Lambda functions will need
            val vpcPolicy = PolicyStatement.Builder.create()
                .effect(Effect.ALLOW)
                .actions(listOf(
                    "ec2:CreateNetworkInterface",
                    "ec2:DescribeNetworkInterfaces",
                    "ec2:DeleteNetworkInterface"
                ))
                .resources(listOf("*"))
                .build()
                
            // This will be applied to all Lambda functions created by this construct
            addToAllRolePolicies(vpcPolicy)
        }
    }
    
    /**
     * Adds a new Lambda function to this microservice
     */
    fun addFunction(
        functionName: String,
        handler: String,
        httpMethod: String,
        path: String = "",
        additionalEnvironment: Map<String, String> = mapOf()
    ): Function {
        // Create a unique ID for this function
        val id = "${props.serviceName}${functionName.capitalize()}Function"
        
        // Combine the base environment with any additional environment variables
        val environment = props.environment + additionalEnvironment
        
        // Create the Lambda function
        val function = Function.Builder.create(this, id)
            .functionName("${props.serviceName}-${functionName.toLowerCase()}")
            .runtime(Runtime.JAVA_11)
            .code(Code.fromAsset(props.jarPath))
            .handler("${props.basePackage}.${handler}")
            .memorySize(props.memorySize)
            .timeout(props.timeout)
            .environment(environment)
            .apply {
                // Add VPC configuration if provided
                if (props.vpc != null && props.securityGroup != null) {
                    vpc(props.vpc)
                    securityGroups(listOf(props.securityGroup))
                    vpcSubnets(SubnetSelection.builder()
                        .subnetType(SubnetType.PUBLIC)
                        .build())
                }
            }
            .build()
            
        // Store the function for later reference
        functions[functionName] = function
        
        // Create the API endpoint
        val resource = if (path.isEmpty()) {
            apiResource
        } else {
            // Handle nested paths like "/{id}"
            var currentResource = apiResource
            path.split("/")
                .filter { it.isNotEmpty() }
                .forEach { pathPart ->
                    currentResource = currentResource.getResource(pathPart) 
                        ?: currentResource.addResource(pathPart)
                }
            currentResource
        }
        
        // Add the method to the resource
        resource.addMethod(httpMethod, 
            LambdaIntegration.Builder.create(function)
                .proxy(true)
                .build())
                
        return function
    }
    
    /**
     * Gets a previously created function by name
     */
    fun getFunction(functionName: String): Function? {
        return functions[functionName]
    }
    
    /**
     * Adds a policy statement to all Lambda functions in this microservice
     */
    fun addToAllRolePolicies(policyStatement: PolicyStatement) {
        functions.values.forEach { function ->
            function.addToRolePolicy(policyStatement)
        }
    }
}
