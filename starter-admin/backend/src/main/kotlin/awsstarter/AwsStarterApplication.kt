package awsstarter

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class AwsStarterApplication

fun main(args: Array<String>) {
    runApplication<AwsStarterApplication>(*args)
}
