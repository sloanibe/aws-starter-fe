package com.example.awsmanager

import javafx.application.Platform
import javafx.collections.FXCollections
import javafx.fxml.FXML
import javafx.scene.control.*
import javafx.scene.web.WebView
import javafx.concurrent.Task
import java.util.concurrent.Executors
import java.util.concurrent.ScheduledExecutorService
import java.util.concurrent.TimeUnit

class MainViewController {
    
    @FXML private TabPane mainTabPane
    @FXML private TreeView<String> serviceTreeView
    @FXML private TableView<ServiceStatus> serviceStatusTable
    @FXML private TextArea logOutputArea
    @FXML private WebView dashboardView
    @FXML private Button startInstanceButton
    @FXML private Button stopInstanceButton
    @FXML private Button restartServiceButton
    @FXML private ComboBox<String> serviceSelector
    
    // Service for background tasks
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(2)
    
    // Path to your scripts directory
    private final String scriptsDir = "/home/msloan/gitprojects/aws-starter/scripts/server"
    
    void init() {
        initServiceTree()
        initServiceStatusTable()
        initDashboard()
        initButtons()
        
        // Start periodic refresh of service status
        scheduleStatusRefresh()
    }
    
    private void initServiceTree() {
        TreeItem<String> root = new TreeItem<>("AWS Microservices")
        root.setExpanded(true)
        
        // Add EC2 instances
        TreeItem<String> instances = new TreeItem<>("EC2 Instances")
        instances.getChildren().add(new TreeItem<>("Combined (i-00c601082fcb6bec1)"))
        instances.getChildren().add(new TreeItem<>("SpringBoot (i-0511968cdefa2a66b)"))
        instances.getChildren().add(new TreeItem<>("MongoDB (i-01e834b9543995678)"))
        
        // Add services
        TreeItem<String> services = new TreeItem<>("Services")
        services.getChildren().add(new TreeItem<>("Eureka"))
        services.getChildren().add(new TreeItem<>("Config Server"))
        services.getChildren().add(new TreeItem<>("API Gateway"))
        services.getChildren().add(new TreeItem<>("AWS Starter API"))
        services.getChildren().add(new TreeItem<>("Login Service"))
        
        // Add gateways
        TreeItem<String> gateways = new TreeItem<>("Gateways")
        gateways.getChildren().add(new TreeItem<>("AWS API Gateway"))
        gateways.getChildren().add(new TreeItem<>("Spring Cloud Gateway"))
        
        root.getChildren().addAll(instances, services, gateways)
        serviceTreeView.setRoot(root)
        
        // Handle tree selection
        serviceTreeView.getSelectionModel().selectedItemProperty().addListener({ observable, oldValue, newValue ->
            if (newValue != null) {
                updateDetailsForSelection(newValue.getValue())
            }
        })
    }
    
    private void initServiceStatusTable() {
        // Initialize service status table columns
        // This would be populated with actual service status data
        serviceStatusTable.setItems(FXCollections.observableArrayList(
            new ServiceStatus("Eureka", "RUNNING", "13.52.157.48", "8761"),
            new ServiceStatus("Config Server", "RUNNING", "13.52.157.48", "8888"),
            new ServiceStatus("API Gateway", "RUNNING", "13.52.157.48", "8090"),
            new ServiceStatus("AWS Starter API", "RUNNING", "13.52.157.48", "8080"),
            new ServiceStatus("Login Service", "RUNNING", "13.52.157.48", "8081")
        ))
    }
    
    private void initDashboard() {
        // Load Eureka dashboard in the WebView
        dashboardView.getEngine().load("http://13.52.157.48:8761")
    }
    
    private void initButtons() {
        // Initialize service selector
        serviceSelector.setItems(FXCollections.observableArrayList(
            "eureka-service", "config-server-service", "api-gateway-service", "aws-starter-api", "login-service"
        ))
        serviceSelector.getSelectionModel().selectFirst()
        
        // Set up button actions
        startInstanceButton.setOnAction({ event ->
            runCommand("${scriptsDir}/ec2-instances.sh start --instance=combined")
        })
        
        stopInstanceButton.setOnAction({ event ->
            runCommand("${scriptsDir}/ec2-instances.sh stop --instance=combined")
        })
        
        restartServiceButton.setOnAction({ event ->
            String service = serviceSelector.getValue()
            if (service) {
                runCommand("sudo systemctl restart ${service}")
            }
        })
    }
    
    private void updateDetailsForSelection(String selection) {
        // This would update the details view based on the selected item
        switch (selection) {
            case "Combined (i-00c601082fcb6bec1)":
                runCommand("${scriptsDir}/ec2-instances.sh status --instance=combined")
                break
            case "Eureka":
                dashboardView.getEngine().load("http://13.52.157.48:8761")
                break
            case "API Gateway":
                runCommand("curl -s http://13.52.157.48:8090/actuator/health")
                break
            // Add more cases for other services
        }
    }
    
    private void runCommand(String command) {
        Task<String> task = new Task<String>() {
            @Override
            protected String call() throws Exception {
                Process process = command.execute()
                String output = process.text
                return output
            }
            
            @Override
            protected void succeeded() {
                String result = getValue()
                Platform.runLater({
                    logOutputArea.appendText("Command: ${command}\n")
                    logOutputArea.appendText("${result}\n\n")
                })
            }
            
            @Override
            protected void failed() {
                Platform.runLater({
                    logOutputArea.appendText("Command failed: ${command}\n")
                    logOutputArea.appendText("Error: ${getException().message}\n\n")
                })
            }
        }
        
        new Thread(task).start()
    }
    
    private void scheduleStatusRefresh() {
        scheduler.scheduleAtFixedRate({
            Platform.runLater({
                refreshServiceStatus()
            })
        }, 0, 30, TimeUnit.SECONDS)
    }
    
    private void refreshServiceStatus() {
        // This would query and update the actual status of all services
        // For now, we'll just log that we're refreshing
        logOutputArea.appendText("Refreshing service status...\n")
    }
    
    // Called when the application is closing
    void shutdown() {
        scheduler.shutdown()
    }
    
    // Simple data class for service status
    static class ServiceStatus {
        String name
        String status
        String host
        String port
        
        ServiceStatus(String name, String status, String host, String port) {
            this.name = name
            this.status = status
            this.host = host
            this.port = port
        }
    }
}
