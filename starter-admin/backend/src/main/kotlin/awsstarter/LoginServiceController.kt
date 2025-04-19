package awsstarter

import org.springframework.web.bind.annotation.*
import org.springframework.http.ResponseEntity

@RestController
@RequestMapping("/api/login")
class LoginServiceController {

    @PostMapping("/start")
    fun start(): ResponseEntity<String> = runScript("start")

    @PostMapping("/stop")
    fun stop(): ResponseEntity<String> = runScript("stop")

    @GetMapping("/status")
    fun status(): ResponseEntity<String> = runScript("status")

    private fun runScript(action: String): ResponseEntity<String> {
        val scriptPath = "/home/msloan/gitprojects/aws-starter/scripts/server/services.sh"
        val process = ProcessBuilder("bash", scriptPath, action, "--service=login-service")
            .redirectErrorStream(true)
            .start()
        val output = process.inputStream.bufferedReader().readText()
        val exitCode = process.waitFor()
        return if (exitCode == 0) ResponseEntity.ok(output) else ResponseEntity.status(500).body(output)
    }
}
