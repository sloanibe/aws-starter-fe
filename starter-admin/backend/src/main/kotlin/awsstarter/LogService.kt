package awsstarter

import org.springframework.stereotype.Service
import java.io.BufferedReader
import java.io.InputStreamReader
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

/**
 * Data class to represent a log entry with timestamp
 */
import java.time.OffsetDateTime

data class LogEntry(
    val timestamp: OffsetDateTime,
    val message: String
)

/**
 * Service for fetching logs from journalctl on demand
 */
@Service
class LogService {
    /**
     * Fetch logs from journalctl for a service, for a given time window.
     * @param serviceId the service identifier (must match systemd unit)
     * @param since optional start time (LocalDateTime)
     * @param until optional end time (LocalDateTime)
     * @param limit max number of log entries to return
     * @return list of LogEntry parsed from journalctl output
     */
    fun fetchLogsFromJournalctl(serviceId: String, since: LocalDateTime?, until: LocalDateTime?, limit: Int = 100): List<LogEntry> {
        // Always fetch the last 50 lines for now
        data class ServiceInfo(val unit: String, val remoteHost: String?)
        val serviceInfo = when (serviceId) {
            "login-service" -> ServiceInfo("login-service.service", "13.52.157.48")
            "email-service" -> ServiceInfo("email-service.service", "13.52.157.48")
            "rabbitmq-service" -> ServiceInfo("rabbitmq-server", "54.241.100.123")
            "api-gateway" -> ServiceInfo("api-gateway.service", "13.52.157.48")
            "config-server" -> ServiceInfo("config-server.service", "13.52.157.48")
            "eureka" -> ServiceInfo("service-discovery.service", "13.52.157.48")
            else -> return emptyList()
        }
        val baseJournalCmd = listOf("journalctl", "-u", serviceInfo.unit, "-o", "short-iso", "--no-pager", "-n", "500")
        println("[LogService] journalctl command: ${baseJournalCmd.joinToString(" ")}")
        val process = if (serviceInfo.remoteHost != null) {
            val sshCmd = mutableListOf(
                "ssh", "-i", "/home/msloan/.ssh/aws-starter-key.pem",
                "ubuntu@${serviceInfo.remoteHost}",
                baseJournalCmd.joinToString(" ")
            )
            println("[LogService] Full SSH command: ${sshCmd.joinToString(" ")}")
            ProcessBuilder(sshCmd).redirectErrorStream(true).start()
        } else {
            ProcessBuilder(baseJournalCmd).redirectErrorStream(true).start()
        }
        val logs = mutableListOf<LogEntry>()
        process.inputStream.bufferedReader().useLines { lines ->
            lines.forEach { line ->
                println("[LogService] Raw log line: $line")
                // Look for the 'java[PID]:' pattern (Spring Boot log lines)
                val javaLogPrefix = "java["
                val javaIdx = line.indexOf(javaLogPrefix)
                if (javaIdx > 0) {
                    val afterPidIdx = line.indexOf("]:", javaIdx)
                    if (afterPidIdx > 0 && afterPidIdx + 2 < line.length) {
                        val springLog = line.substring(afterPidIdx + 2).trim()
                        val springSpaceIdx = springLog.indexOf(' ')
                        if (springSpaceIdx > 0) {
                            val springTimestampStr = springLog.substring(0, springSpaceIdx)
                            val message = springLog.substring(springSpaceIdx + 1)
                            try {
                                val timestamp = java.time.OffsetDateTime.parse(springTimestampStr)
                                logs.add(LogEntry(timestamp, message))
                                println("[LogService] Parsed Spring Boot log timestamp OK: $springTimestampStr")
                            } catch (e: Exception) {
                                println("[LogService] Failed to parse Spring Boot timestamp: $springTimestampStr, error: ${e.message}")
                                // Ignore lines that can't be parsed
                            }
                        }
                    }
                } else {
                    // Fallback: try to parse the systemd prefix as before
                    val firstSpace = line.indexOf(' ')
                    if (firstSpace > 0) {
                        val timestampStr = line.substring(0, firstSpace)
                        val message = line.substring(firstSpace + 1)
                        try {
                            val timestamp = java.time.OffsetDateTime.parse(timestampStr, java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ssZ"))
                            logs.add(LogEntry(timestamp, message))
                        } catch (_: Exception) {
                            // Ignore lines that can't be parsed
                        }
                    }
                }
            }
        }
        return logs
    }

}
