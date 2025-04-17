package awsstarter

import org.springframework.stereotype.Service
import java.io.BufferedReader
import java.io.InputStreamReader
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.CopyOnWriteArrayList
import java.util.concurrent.CompletableFuture

/**
 * Data class to represent a log entry with timestamp
 */
data class LogEntry(
    val timestamp: LocalDateTime,
    val message: String
)

/**
 * Service for managing log collection and retrieval
 */
@Service
class LogService {
    // Store logs for each service with a maximum buffer size
    private val logBuffers = ConcurrentHashMap<String, CopyOnWriteArrayList<LogEntry>>()
    private val activeProcesses = ConcurrentHashMap<String, Process>()
    
    // Maximum number of log entries to keep per service
    private val MAX_LOG_ENTRIES = 1000
    
    // Date time formatter for log timestamps
    private val formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS")
    
    /**
     * Get the latest logs for a service
     * @param serviceId the service identifier
     * @param limit maximum number of log entries to return (most recent first)
     * @return list of log entries, or empty list if no logs available
     */
    fun getLogs(serviceId: String, limit: Int = 100): List<LogEntry> {
        val logs = logBuffers[serviceId] ?: return emptyList()
        return logs.takeLast(limit).reversed()
    }
    
    /**
     * Get logs for a service after a specific timestamp
     * @param serviceId the service identifier
     * @param since timestamp to get logs after (null to get all available logs)
     * @param limit maximum number of log entries to return
     * @return list of log entries after the specified timestamp
     */
    fun getLogsSince(serviceId: String, since: LocalDateTime?, limit: Int = 100): List<LogEntry> {
        val logs = logBuffers[serviceId] ?: return emptyList()
        
        val filteredLogs = if (since != null) {
            logs.filter { it.timestamp.isAfter(since) }
        } else {
            logs
        }
        
        return filteredLogs.takeLast(limit).reversed()
    }
    
    /**
     * Add a log entry to the buffer for a service
     * @param serviceId the service identifier
     * @param logLine the log message
     */
    private fun addLogEntry(serviceId: String, logLine: String) {
        val buffer = logBuffers.computeIfAbsent(serviceId) { CopyOnWriteArrayList() }
        
        // Add new log entry with current timestamp
        buffer.add(LogEntry(LocalDateTime.now(), logLine))
        
        // Trim buffer if it exceeds maximum size
        if (buffer.size > MAX_LOG_ENTRIES) {
            val overflow = buffer.size - MAX_LOG_ENTRIES
            for (i in 0 until overflow) {
                buffer.removeAt(0)
            }
        }
    }
    
    /**
     * Start collecting logs for a service
     * @param serviceId the service identifier
     * @param command the command to execute to collect logs
     */
    fun startLogStream(serviceId: String, command: String) {
        // Stop any existing process for this service
        stopLogStream(serviceId)
        
        // Clear existing logs for this service
        logBuffers[serviceId] = CopyOnWriteArrayList()
        
        CompletableFuture.runAsync {
            try {
                val process = ProcessBuilder("bash", "-c", command)
                    .redirectErrorStream(true)
                    .start()
                
                activeProcesses[serviceId] = process
                
                addLogEntry(serviceId, "Starting log collection with command: $command")
                
                BufferedReader(InputStreamReader(process.inputStream)).use { reader ->
                    var line: String?
                    while (reader.readLine().also { line = it } != null) {
                        line?.let { addLogEntry(serviceId, it) }
                    }
                }
                
                val exitCode = process.waitFor()
                addLogEntry(serviceId, "Process exited with code: $exitCode")
                
            } catch (e: Exception) {
                addLogEntry(serviceId, "Error in log collection: ${e.message}")
            } finally {
                activeProcesses.remove(serviceId)
            }
        }
    }
    
    /**
     * Stop collecting logs for a service
     * @param serviceId the service identifier
     */
    fun stopLogStream(serviceId: String) {
        activeProcesses[serviceId]?.let { process ->
            try {
                process.destroy()
                addLogEntry(serviceId, "Log collection stopped")
            } catch (e: Exception) {
                addLogEntry(serviceId, "Error stopping log collection: ${e.message}")
            }
            activeProcesses.remove(serviceId)
        }
    }
    
    /**
     * Check if log collection is active for a service
     * @param serviceId the service identifier
     * @return true if log collection is active, false otherwise
     */
    fun isLogStreamActive(serviceId: String): Boolean {
        return activeProcesses.containsKey(serviceId)
    }
    
    /**
     * Get the current log buffer size for a service
     * @param serviceId the service identifier
     * @return number of log entries currently stored
     */
    fun getLogBufferSize(serviceId: String): Int {
        return logBuffers[serviceId]?.size ?: 0
    }
}
