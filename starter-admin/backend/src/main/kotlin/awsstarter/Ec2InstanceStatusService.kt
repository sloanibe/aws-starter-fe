package awsstarter

import org.springframework.stereotype.Service
import software.amazon.awssdk.services.ec2.Ec2Client
import software.amazon.awssdk.services.ec2.model.DescribeInstancesRequest
import software.amazon.awssdk.services.ec2.model.InstanceStateName

@Service
class Ec2InstanceStatusService {
    private val ec2 = Ec2Client.create()

    fun getInstanceStatus(instanceId: String): String {
        val request = DescribeInstancesRequest.builder()
            .instanceIds(instanceId)
            .build()
        val response = ec2.describeInstances(request)
        val state = response.reservations().firstOrNull()?.instances()?.firstOrNull()?.state()?.nameAsString()
        return state ?: "unknown"
    }
}
