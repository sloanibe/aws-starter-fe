package awsstarter

import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import software.amazon.awssdk.services.costexplorer.CostExplorerClient
import software.amazon.awssdk.services.costexplorer.model.DateInterval
import software.amazon.awssdk.services.costexplorer.model.GetCostAndUsageRequest
import java.time.LocalDate
import java.time.format.DateTimeFormatter

@RestController
@RequestMapping("/api/aws/billing")
class AwsBillingController {
    @GetMapping
    fun getCurrentMonthCharges(): Map<String, Any> {
        val client = CostExplorerClient.create()
        val today = LocalDate.now()
        val startOfMonth = today.withDayOfMonth(1)
        val formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd")

        val request = GetCostAndUsageRequest.builder()
            .timePeriod(DateInterval.builder()
                .start(startOfMonth.format(formatter))
                .end(today.format(formatter))
                .build())
            .granularity("MONTHLY")
            .metrics("UnblendedCost")
            .build()

        val result = client.getCostAndUsage(request)
        val amount = result.resultsByTime().firstOrNull()?.total()?.get("UnblendedCost")?.amount() ?: "0.00"
        val unit = result.resultsByTime().firstOrNull()?.total()?.get("UnblendedCost")?.unit() ?: "USD"

        return mapOf(
            "amount" to amount,
            "unit" to unit,
            "start" to startOfMonth.toString(),
            "end" to today.toString()
        )
    }
}
