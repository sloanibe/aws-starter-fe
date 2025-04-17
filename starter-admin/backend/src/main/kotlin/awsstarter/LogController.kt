package awsstarter

import org.springframework.format.annotation.DateTimeFormat
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.time.LocalDateTime

@RestController
@RequestMapping("/api/logs")
class LogController(private val logService: LogService) {

    // Map of service IDs to their corresponding SSH commands
    private val serviceCommands = mapOf(
        "email-service" to "ssh -i /home/msloan/.ssh/aws-starter-key.pem ubuntu@13.52.157.48 'sudo journalctl -u email-service.service -f'",
        "api-gateway" to "ssh -i /home/msloan/.ssh/aws-starter-key.pem ubuntu@13.52.157.48 'sudo journalctl -u api-gateway.service -f'",
        "config-server" to "ssh -i /home/msloan/.ssh/aws-starter-key.pem ubuntu@13.52.157.48 'sudo journalctl -u config-server.service -f'",
        "eureka" to "ssh -i /home/msloan/.ssh/aws-starter-key.pem ubuntu@13.52.157.48 'sudo journalctl -u service-discovery.service -f'",
        "test" to "for i in {1..100}; do echo \"Test log line \$i\"; sleep 1; done" // Simple test command
    )

    /**
     * Get logs for a service with optional filtering by timestamp
     * @param serviceId the service identifier
     * @param since optional timestamp to get logs after
     * @param limit maximum number of log entries to return
     * @return list of log entries
     */
    @GetMapping("/{serviceId}", produces = [MediaType.APPLICATION_JSON_VALUE])
    fun getLogs(
        @PathVariable serviceId: String,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) since: LocalDateTime?,
        @RequestParam(required = false, defaultValue = "100") limit: Int
    ): ResponseEntity<List<LogEntry>> {
        if (!serviceCommands.containsKey(serviceId)) {
            return ResponseEntity.badRequest().build()
        }
        
        val logs = if (since != null) {
            logService.getLogsSince(serviceId, since, limit)
        } else {
            logService.getLogs(serviceId, limit)
        }
        
        return ResponseEntity.ok(logs)
    }
    
    /**
     * Get status information about log collection for a service
     * @param serviceId the service identifier
     * @return status information
     */
    @GetMapping("/{serviceId}/status")
    fun getLogStatus(@PathVariable serviceId: String): ResponseEntity<Map<String, Any>> {
        if (!serviceCommands.containsKey(serviceId)) {
            return ResponseEntity.badRequest().build()
        }
        
        val status = mapOf(
            "serviceId" to serviceId,
            "active" to logService.isLogStreamActive(serviceId),
            "bufferSize" to logService.getLogBufferSize(serviceId)
        )
        
        return ResponseEntity.ok(status)
    }
    
    @PostMapping("/start/{serviceId}")
    fun startLogStream(@PathVariable serviceId: String): ResponseEntity<String> {
        val command = serviceCommands[serviceId] ?: 
            return ResponseEntity.badRequest().body("Unknown service ID: $serviceId")
        
        logService.startLogStream(serviceId, command)
        return ResponseEntity.ok("Log streaming started for $serviceId")
    }
    
    @PostMapping("/stop/{serviceId}")
    fun stopLogStream(@PathVariable serviceId: String): ResponseEntity<String> {
        logService.stopLogStream(serviceId)
        return ResponseEntity.ok("Log streaming stopped for $serviceId")
    }
    
    @GetMapping("/services")
    fun getAvailableServices(): ResponseEntity<List<String>> {
        return ResponseEntity.ok(serviceCommands.keys.toList())
    }
}
