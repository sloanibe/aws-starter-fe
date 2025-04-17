# AWS DNS, Route 53, and Creating Subdomains for EC2

## Overview
Amazon Route 53 is AWS’s scalable Domain Name System (DNS) web service. It allows you to manage domain names, subdomains, and DNS routing for your AWS resources (and beyond).

In this primer, we explain:
- How DNS and Route 53 work in AWS
- How we use Route 53 to manage custom domains and subdomains
- How we created a subdomain pointing to our EC2 instance for SSH access

---

## What is DNS?
DNS (Domain Name System) is the system that translates human-friendly domain names (like `example.com`) into IP addresses (like `192.0.2.1`) that computers use to communicate.

## What is Amazon Route 53?
Amazon Route 53 is AWS’s DNS service. It lets you:
- Register domain names
- Manage DNS records (A, CNAME, MX, etc.)
- Route traffic to AWS resources (EC2, S3, CloudFront, etc.)
- Configure health checks and routing policies

---

## Common DNS Record Types

| Type   | Meaning & Usage                                                                 |
|--------|---------------------------------------------------------------------------------|
| **A**      | Maps a domain or subdomain to an IPv4 address (e.g., EC2 public IP).             |
| **AAAA**   | Maps a domain or subdomain to an IPv6 address.                                   |
| **CNAME**  | Canonical Name. Points a domain/subdomain to another domain name (not an IP).    |
| **MX**     | Mail Exchange. Directs email to mail servers for the domain.                     |
| **TXT**    | Stores arbitrary text. Used for domain verification, SPF, DKIM, etc.             |
| **NS**     | Name Server. Specifies the DNS servers authoritative for the domain.              |
| **Alias**  | AWS-specific. Points a domain to AWS resources (e.g., CloudFront, S3) like an A record, but works with AWS-managed resources. |

### Examples:
- **A Record:** `ec2.sloandev.net` → `13.52.157.48`
- **CNAME Record:** `www.sloandev.net` → `sloandev.net`
- **Alias Record:** `sloandev.net` → `d23g2ah1oukxrw.cloudfront.net` (CloudFront)

---

## How We Use Route 53 in Our Project

### 1. Custom Domain for the Frontend
- Our main domain (e.g., `sloandev.net`) is managed in Route 53.
- The root domain points to a CloudFront distribution that serves our frontend static site.

### 2. Subdomain for EC2 SSH Access
- We needed a way to SSH into our EC2 instance without disrupting the main website.
- Instead of pointing `sloandev.net` directly to the EC2 instance (which broke the frontend), we created a **subdomain** (e.g., `ec2.sloandev.net`).
- This subdomain points directly to the EC2 instance’s public IP address, allowing us to SSH using a friendly name.

#### Why Use a Subdomain?
- Keeps main website (frontend) and backend/admin access separate
- Prevents DNS changes for SSH from affecting the frontend
- Easier management and clearer architecture

### 3. How We Created the Subdomain in Route 53

#### Step-by-Step:
1. **Identify your EC2 instance’s public IP address.**
   - You can find this in the EC2 Console or with:
     ```bash
     aws ec2 describe-instances --instance-ids <INSTANCE_ID> --query 'Reservations[0].Instances[0].PublicIpAddress' --output text
     ```
2. **Go to the Route 53 Console** and select your hosted zone (e.g., `sloandev.net`).
3. **Create a new Record Set**:
   - **Name:** `ec2` (for `ec2.sloandev.net`)
   - **Type:** `A` (IPv4 address)
   - **Value:** `<YOUR_EC2_PUBLIC_IP>`
   - **TTL:** 300 (default is fine)
4. **Save the record.**
5. Wait a few minutes for DNS propagation.

#### Example AWS CLI Command:
```bash
aws route53 change-resource-record-sets --hosted-zone-id <HOSTED_ZONE_ID> --change-batch '{
  "Changes": [{
    "Action": "UPSERT",
    "ResourceRecordSet": {
      "Name": "ec2.sloandev.net.",
      "Type": "A",
      "TTL": 300,
      "ResourceRecords": [{"Value": "<YOUR_EC2_PUBLIC_IP>"}]
    }
  }]
}'
```

### 4. Verifying the Subdomain
- Use `nslookup ec2.sloandev.net` or `dig ec2.sloandev.net` to verify DNS is pointing to your EC2 IP.
- Then, SSH using:
  ```bash
  ssh -i <path/to/key.pem> ubuntu@ec2.sloandev.net
  ```

---

## Best Practices
- Use subdomains for different services (e.g., `api.sloandev.net`, `ec2.sloandev.net`, `www.sloandev.net`).
- Never point your root domain directly to an EC2 instance if it’s serving a frontend via CloudFront or S3.
- Document your DNS changes and architecture for future reference.

---

**Summary:**
- Route 53 makes it easy to manage DNS for AWS resources.
- Subdomains allow you to separate frontend, backend, and admin access cleanly.
- Use the AWS Console or CLI to create and manage DNS records for your infrastructure.
