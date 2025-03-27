package com.example.awsmanager.util

import javafx.application.Platform
import javafx.scene.control.Alert
import javafx.scene.control.Alert.AlertType

import java.nio.file.*
import java.util.concurrent.Executors
import java.util.concurrent.ScheduledExecutorService
import java.util.concurrent.TimeUnit

/**
 * A utility class that watches for file changes in development mode
 * and provides hot-reloading capabilities similar to Electron's dev mode.
 */
class DevModeWatcher {
    private WatchService watchService
    private Path basePath
    private ScheduledExecutorService executor
    private boolean running = false
    private Closure reloadCallback

    /**
     * Creates a new DevModeWatcher
     * @param basePath The base directory to watch for changes
     * @param reloadCallback A closure to call when files change
     */
    DevModeWatcher(String basePath, Closure reloadCallback) {
        this.basePath = Paths.get(basePath)
        this.reloadCallback = reloadCallback
        
        try {
            watchService = FileSystems.getDefault().newWatchService()
            registerDirectory(this.basePath)
            
            // Register all subdirectories
            Files.walk(this.basePath)
                .filter(Files.&isDirectory)
                .each { registerDirectory(it) }
                
            println "DevModeWatcher initialized for: ${this.basePath}"
        } catch (Exception e) {
            println "Failed to initialize DevModeWatcher: ${e.message}"
            e.printStackTrace()
        }
    }

    /**
     * Registers a directory with the watch service
     */
    private void registerDirectory(Path dir) {
        dir.register(
            watchService,
            StandardWatchEventKinds.ENTRY_CREATE,
            StandardWatchEventKinds.ENTRY_DELETE,
            StandardWatchEventKinds.ENTRY_MODIFY
        )
        println "Watching directory: ${dir}"
    }

    /**
     * Starts watching for file changes
     */
    void start() {
        if (running) return
        
        running = true
        executor = Executors.newSingleThreadScheduledExecutor()
        
        executor.scheduleWithFixedDelay({
            try {
                WatchKey key = watchService.poll()
                if (key == null) return
                
                boolean shouldReload = false
                
                for (WatchEvent<?> event : key.pollEvents()) {
                    WatchEvent.Kind<?> kind = event.kind()
                    
                    if (kind == StandardWatchEventKinds.OVERFLOW) continue
                    
                    // Get the filename for the event
                    WatchEvent<Path> ev = (WatchEvent<Path>) event
                    Path filename = ev.context()
                    Path child = ((Path) key.watchable()).resolve(filename)
                    
                    // Only reload for Groovy or FXML files
                    if (child.toString().endsWith('.groovy') || 
                        child.toString().endsWith('.fxml')) {
                        println "Change detected: ${child} (${kind.name()})"
                        shouldReload = true
                    }
                    
                    // If a new directory is created, register it
                    if (kind == StandardWatchEventKinds.ENTRY_CREATE) {
                        try {
                            if (Files.isDirectory(child)) {
                                registerDirectory(child)
                            }
                        } catch (IOException e) {
                            println "Failed to register new directory: ${e.message}"
                        }
                    }
                }
                
                if (shouldReload && reloadCallback) {
                    Platform.runLater {
                        try {
                            reloadCallback()
                        } catch (Exception e) {
                            showErrorAlert("Reload Error", "Failed to reload application", e.message)
                            e.printStackTrace()
                        }
                    }
                }
                
                key.reset()
            } catch (Exception e) {
                println "Error in file watcher: ${e.message}"
                e.printStackTrace()
            }
        }, 0, 1, TimeUnit.SECONDS)
        
        println "DevModeWatcher started"
    }

    /**
     * Stops watching for file changes
     */
    void stop() {
        if (!running) return
        
        running = false
        executor.shutdown()
        try {
            watchService.close()
        } catch (IOException e) {
            println "Error closing watch service: ${e.message}"
        }
        
        println "DevModeWatcher stopped"
    }
    
    /**
     * Shows an error alert
     */
    private static void showErrorAlert(String title, String header, String content) {
        Alert alert = new Alert(AlertType.ERROR)
        alert.title = title
        alert.headerText = header
        alert.contentText = content
        alert.showAndWait()
    }
}
