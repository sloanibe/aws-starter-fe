package com.example.awsmanager.service

import groovy.transform.CompileStatic
import javafx.concurrent.Task
import software.amazon.awssdk.auth.credentials.ProfileCredentialsProvider
import software.amazon.awssdk.regions.Region
import software.amazon.awssdk.services.ec2.Ec2Client
import software.amazon.awssdk.services.ec2.model.DescribeInstancesRequest
import software.amazon.awssdk.services.ec2.model.DescribeInstancesResponse
import software.amazon.awssdk.services.ec2.model.Instance

import java.util.concurrent.CompletableFuture

/**
 * Service for managing AWS resources and microservices
 * Integrates with existing shell scripts and provides direct AWS SDK access
 */
@CompileStatic
class AwsServiceManager {
    
    private final String scriptsDir
    private final Ec2Client ec2Client
    
    // EC2 Instance IDs from your scripts
    private static final String COMBINED_INSTANCE_ID = "i-00c601082fcb6bec1"
    private static final String SPRINGBOOT_INSTANCE_ID = "i-0511968cdefa2a66b"
    private static final String MONGODB_INSTANCE_ID = "i-01e834b9543995678"
    
    // Service names and ports
    private final Map<String, Integer> servicePorts = [
        'eureka-service': 8761,
        'config-server-service': 8888,
        'api-gateway-service': 8090,
        'aws-starter-api': 8080,
        'login-service': 8081
    ]
    
    AwsServiceManager(String scriptsDir) {
        this.scriptsDir = scriptsDir
        this.ec2Client = Ec2Client.builder()
            .region(Region.US_WEST_1)
            .credentialsProvider(ProfileCredentialsProvider.create())
            .build()
    }
    
    /**
     * Start an EC2 instance using the existing script
     * @param instanceType The instance type (combined, springboot, mongodb)
     * @return A task that executes the command
     */
    Task<String> startInstance(String instanceType) {
        return executeCommand("${scriptsDir}/ec2-instances.sh start --instance=${instanceType}")
    }
    
    /**
     * Stop an EC2 instance using the existing script
     * @param instanceType The instance type (combined, springboot, mongodb)
     * @return A task that executes the command
     */
    Task<String> stopInstance(String instanceType) {
        return executeCommand("${scriptsDir}/ec2-instances.sh stop --instance=${instanceType}")
    }
    
    /**
     * Get the status of an EC2 instance using the existing script
     * @param instanceType The instance type (combined, springboot, mongodb)
     * @return A task that executes the command
     */
    Task<String> getInstanceStatus(String instanceType) {
        return executeCommand("${scriptsDir}/ec2-instances.sh status --instance=${instanceType}")
    }
    
    /**
     * Start a service using systemctl
     * @param serviceName The name of the service
     * @return A task that executes the command
     */
    Task<String> startService(String serviceName) {
        return executeCommand("sudo systemctl start ${serviceName}")
    }
    
    /**
     * Stop a service using systemctl
     * @param serviceName The name of the service
     * @return A task that executes the command
     */
    Task<String> stopService(String serviceName) {
        return executeCommand("sudo systemctl stop ${serviceName}")
    }
    
    /**
     * Restart a service using systemctl
     * @param serviceName The name of the service
     * @return A task that executes the command
     */
    Task<String> restartService(String serviceName) {
        return executeCommand("sudo systemctl restart ${serviceName}")
    }
    
    /**
     * Get the status of a service using systemctl
     * @param serviceName The name of the service
     * @return A task that executes the command
     */
    Task<String> getServiceStatus(String serviceName) {
        return executeCommand("systemctl status ${serviceName}")
    }
    
    /**
     * Test a path through the dual-gateway architecture
     * @param path The path to test
     * @param method The HTTP method
     * @return A map of gateway name to response
     */
    CompletableFuture<Map<String, String>> testPath(String path, String method) {
        CompletableFuture<Map<String, String>> future = new CompletableFuture<>()
        
        Thread.start {
            Map<String, String> results = [:]
            
            // Test AWS API Gateway
            String awsApiGatewayUrl = "https://vab90wx4u0.execute-api.us-west-1.amazonaws.com/prod${path}"
            results["AWS API Gateway"] = executeHttpRequest(awsApiGatewayUrl, method)
            
            // Test Spring Cloud Gateway
            String springCloudGatewayUrl = "http://13.52.157.48:8090${path}"
            results["Spring Cloud Gateway"] = executeHttpRequest(springCloudGatewayUrl, method)
            
            // Test direct microservice
            // This is a simplification - in reality, you'd need to determine which service handles this path
            String microserviceUrl = "http://13.52.157.48:8080${path.replace('/api', '')}"
            results["Microservice"] = executeHttpRequest(microserviceUrl, method)
            
            future.complete(results)
        }
        
        return future
    }
    
    /**
     * Execute an HTTP request
     * @param url The URL to request
     * @param method The HTTP method
     * @return The response as a string
     */
    private String executeHttpRequest(String url, String method) {
        try {
            Process process = "curl -s -X ${method} ${url}".execute()
            String response = process.text
            return response
        } catch (Exception e) {
            return "Error: ${e.message}"
        }
    }
    
    /**
     * Execute a shell command
     * @param command The command to execute
     * @return A task that executes the command
     */
    private Task<String> executeCommand(String command) {
        Task<String> task = new Task<String>() {
            @Override
            protected String call() throws Exception {
                Process process = command.execute()
                String output = process.text
                return output
            }
        }
        
        Thread thread = new Thread(task)
        thread.setDaemon(true)
        thread.start()
        
        return task
    }
    
    /**
     * Get EC2 instance details directly from AWS
     * @param instanceId The instance ID
     * @return A CompletableFuture with the instance details
     */
    CompletableFuture<Instance> getEc2InstanceDetails(String instanceId) {
        CompletableFuture<Instance> future = new CompletableFuture<>()
        
        Thread.start {
            try {
                DescribeInstancesRequest request = DescribeInstancesRequest.builder()
                    .instanceIds(instanceId)
                    .build()
                
                DescribeInstancesResponse response = ec2Client.describeInstances(request)
                
                if (!response.reservations().isEmpty() && 
                    !response.reservations().get(0).instances().isEmpty()) {
                    future.complete(response.reservations().get(0).instances().get(0))
                } else {
                    future.completeExceptionally(new RuntimeException("Instance not found"))
                }
            } catch (Exception e) {
                future.completeExceptionally(e)
            }
        }
        
        return future
    }
    
    /**
     * Check health of a Spring Boot service
     * @param serviceName The service name
     * @return A CompletableFuture with the health status
     */
    CompletableFuture<String> checkServiceHealth(String serviceName) {
        CompletableFuture<String> future = new CompletableFuture<>()
        
        Thread.start {
            try {
                Integer port = servicePorts[serviceName]
                if (port) {
                    String healthUrl = "http://13.52.157.48:${port}/actuator/health"
                    Process process = "curl -s ${healthUrl}".execute()
                    String response = process.text
                    future.complete(response)
                } else {
                    future.completeExceptionally(new RuntimeException("Unknown service"))
                }
            } catch (Exception e) {
                future.completeExceptionally(e)
            }
        }
        
        return future
    }
    
    /**
     * Check Eureka registrations
     * @return A CompletableFuture with the Eureka registry
     */
    CompletableFuture<String> getEurekaRegistrations() {
        CompletableFuture<String> future = new CompletableFuture<>()
        
        Thread.start {
            try {
                String eurekaUrl = "http://13.52.157.48:8761/eureka/apps"
                Process process = "curl -s -H 'Accept: application/json' ${eurekaUrl}".execute()
                String response = process.text
                future.complete(response)
            } catch (Exception e) {
                future.completeExceptionally(e)
            }
        }
        
        return future
    }
    
    /**
     * View service logs
     * @param serviceName The service name
     * @param lines Number of lines to retrieve
     * @return A task that executes the command
     */
    Task<String> viewServiceLogs(String serviceName, int lines) {
        return executeCommand("journalctl -u ${serviceName} -n ${lines}")
    }
    
    /**
     * Close resources when shutting down
     */
    void close() {
        ec2Client.close()
    }
}
