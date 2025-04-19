package awsstarter

import org.springframework.web.bind.annotation.*
import org.springframework.http.ResponseEntity

@RestController
@RequestMapping("/api/ec2-rabbitmq")
class Ec2RabbitMQController(
    private val ec2InstanceStatusService: Ec2InstanceStatusService
) {

    @PostMapping("/start")
    fun start(): ResponseEntity<String> = runScript("start")

    @PostMapping("/stop")
    fun stop(): ResponseEntity<String> = runScript("stop")

    @GetMapping("/status")
    fun status(): ResponseEntity<String> = runScript("status")

    private fun runScript(action: String): ResponseEntity<String> {
        val scriptPath = "/home/msloan/gitprojects/aws-starter/scripts/server/ec2-instances.sh"
        val process = ProcessBuilder("bash", scriptPath, action, "--instance=aws-starter-rabbitmq")
            .redirectErrorStream(true)
            .start()
        val output = process.inputStream.bufferedReader().readText()
        val exitCode = process.waitFor()
        return if (exitCode == 0) ResponseEntity.ok(output) else ResponseEntity.status(500).body(output)
    }

    @GetMapping("/aws-status")
    fun awsStatus(): ResponseEntity<String> {
        val instanceId = "i-03c3cdae1dc401eaa"
        val state = ec2InstanceStatusService.getInstanceStatus(instanceId)
        return ResponseEntity.ok(state)
    }
}
