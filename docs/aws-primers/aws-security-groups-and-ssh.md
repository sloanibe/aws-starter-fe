# AWS Security Groups and Enabling SSH Access to EC2 Instances

## What is an AWS Security Group?

An **AWS Security Group** acts as a virtual firewall for your EC2 instances to control inbound and outbound traffic. Security groups are attached to EC2 instances and determine which network traffic is allowed to and from those resources.

- **Inbound rules** control incoming traffic (e.g., SSH, HTTP, HTTPS).
- **Outbound rules** control outgoing traffic from the instance.
- Rules are defined by protocol (TCP/UDP), port range, and source/destination IP or CIDR block.
- Security groups are stateful: if you allow incoming traffic from an IP, the response is automatically allowed out, regardless of outbound rules.

## Why Update Security Groups for SSH?

By default, AWS security groups may not allow SSH (port 22) from your current public IP address. If your IP changes (e.g., you move locations or your ISP changes your address), you may lose SSH access and see errors like:

```
ssh: connect to host <host> port 22: Connection timed out
```

To regain access, you must update the security group to allow SSH from your new IP.

## How We Updated the Security Group for EC2 SSH Access

### 1. Identifying the Security Group
- We found the security group attached to our EC2 instance by running:
  ```bash
  aws ec2 describe-instances --instance-ids <INSTANCE_ID> --query 'Reservations[0].Instances[0].SecurityGroups' --output json
  ```
- Example output:
  ```json
  [
    { "GroupName": "aws-starter-stack-CombinedSecurityGroup-DfT5Oz3M9rgI", "GroupId": "sg-04a28d3509034f21f" }
  ]
  ```

### 2. Checking Existing SSH Rules
- We reviewed the current rules with:
  ```bash
  aws ec2 describe-security-groups --group-ids <SECURITY_GROUP_ID> --output json
  ```
- We confirmed that our current public IP was NOT listed for port 22.

### 3. Finding Our Current Public IP
- We used the following command to determine our public IP address:
  ```bash
  curl -s https://checkip.amazonaws.com
  ```
- This command returns your public IP as seen by external services.

### 4. Adding a Rule for SSH from Our IP
- We added an inbound rule to allow SSH (port 22) from our current IP:
  ```bash
  aws ec2 authorize-security-group-ingress \
    --group-id <SECURITY_GROUP_ID> \
    --protocol tcp --port 22 --cidr <YOUR_PUBLIC_IP>/32
  ```
- Example:
  ```bash
  aws ec2 authorize-security-group-ingress --group-id <SECURITY_GROUP_ID> --protocol tcp --port 22 --cidr <YOUR_PUBLIC_IP>/32
  ```

### 5. Verifying Access
- After updating the rule, we were able to SSH into the instance:
  ```bash
  ssh -i <path/to/key.pem> ubuntu@<your-domain>
  ```

## Security Best Practices
- Only allow SSH from specific IPs, not `0.0.0.0/0` (anywhere), to reduce attack surface.
- Remove old or unused rules to keep your security group clean.
- Consider using AWS Systems Manager (SSM) for remote access without opening SSH to the internet.

---

**Summary:**
- Security groups control network access to AWS resources.
- To enable SSH, you must explicitly allow your current public IP on port 22.
- Always verify your public IP before updating rules and use the principle of least privilege for security.
