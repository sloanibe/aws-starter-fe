package com.example.awsmanager

import com.example.awsmanager.util.DevModeWatcher
import javafx.application.Application
import javafx.application.Platform
import javafx.fxml.FXMLLoader
import javafx.scene.Parent
import javafx.scene.Scene
import javafx.stage.Stage

class AwsManagerApplication extends Application {
    
    private Stage primaryStage
    private DevModeWatcher devModeWatcher
    private boolean devMode = false
    
    @Override
    void start(Stage primaryStage) {
        this.primaryStage = primaryStage
        
        // Check if dev mode is enabled
        parameters.raw.each { param ->
            if (param == "--dev-mode") {
                devMode = true
                println "Running in development mode with hot reloading enabled"
            }
        }
        
        loadMainView()
        
        // Start file watcher for dev mode
        if (devMode) {
            String projectPath = System.getProperty("user.dir")
            devModeWatcher = new DevModeWatcher("${projectPath}/src/main", { reloadUI() })
            devModeWatcher.start()
        }
    }
    
    /**
     * Loads the main view of the application
     */
    private void loadMainView() {
        try {
            FXMLLoader loader = new FXMLLoader(getClass().getResource("/fxml/MainView.fxml"))
            Parent root = loader.load()
            
            MainViewController controller = loader.getController()
            controller.init()
            
            primaryStage.setTitle("AWS Microservices Manager")
            primaryStage.setScene(new Scene(root, 1200, 800))
            primaryStage.show()
        } catch (Exception e) {
            e.printStackTrace()
        }
    }
    
    /**
     * Reloads the UI when files change in dev mode
     */
    private void reloadUI() {
        println "Reloading UI due to file changes..."
        try {
            // Clear the resource cache to reload FXML
            FXMLLoader.clearCache()
            
            // Reload the main view
            Platform.runLater {
                loadMainView()
            }
            
            println "UI reloaded successfully"
        } catch (Exception e) {
            println "Failed to reload UI: ${e.message}"
            e.printStackTrace()
        }
    }
    
    @Override
    void stop() {
        if (devModeWatcher) {
            devModeWatcher.stop()
        }
        Platform.exit()
    }
    
    static void main(String[] args) {
        launch(AwsManagerApplication.class, args)
    }
}
