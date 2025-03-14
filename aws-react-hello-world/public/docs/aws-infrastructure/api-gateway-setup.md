# API Gateway HTTPS Setup for Spring Boot API

This document outlines how the Spring Boot API is secured with HTTPS using API Gateway and AWS Certificate Manager (ACM).

## What is an API Gateway?

An API Gateway is a "front door" for your APIs that sits between clients and your backend services. It acts as a specialized reverse proxy that handles common tasks involved in accepting and processing API calls before routing them to your actual service.

### Core Concepts of API Gateway

1. **Traffic Management**
   - Routes incoming requests to the appropriate backend service
   - Acts as a single entry point for multiple APIs or microservices
   - Handles load balancing across multiple instances

2. **Protocol Translation**
   - Converts between different protocols (e.g., HTTP, WebSocket, gRPC)
   - Transforms request/response formats when needed (JSON to XML, etc.)

3. **Security Layer**
   - Handles authentication and authorization
   - Validates API keys and tokens
   - Provides protection against common attacks

4. **Request Processing**
   - Rate limiting and throttling to prevent abuse
   - Request validation to ensure proper formatting
   - Caching responses to improve performance

### Benefits for Your Application

- **Simplified Architecture**: You don't need to implement HTTPS, rate limiting, etc. in your Spring Boot code
- **Enhanced Security**: The gateway handles SSL termination and can block malicious traffic
- **Scalability**: Your API can scale independently of the gateway
- **Monitoring**: Provides detailed metrics on API usage and performance
- **Cost Efficiency**: For a demo app, it's much cheaper than running a load balancer

## Architecture Overview

```
                  HTTPS                HTTP
┌─────────┐    ┌─────────┐         ┌─────────┐
│  User   │───▶│   API   │────────▶│ Spring  │
│ Browser │    │ Gateway │         │  Boot   │
└─────────┘    └─────────┘         └─────────┘
                  │
                  │
             ┌────▼────┐
             │   ACM   │
             │Certificate│
             └─────────┘
```

The setup uses the following components:
1. **API Gateway**: Provides HTTPS endpoint and rate limiting
2. **ACM Certificate**: Manages SSL/TLS certificate (auto-renewed)
3. **Spring Boot API**: Runs on EC2 (HTTP only internally)

## How It Works in Our Architecture

1. **Client Request Flow**:
   - User makes a request to `https://api.sloandev.net`
   - Request is received by API Gateway with proper SSL/TLS encryption
   - API Gateway applies rate limiting (20 requests per second)
   - If within limits, the request is forwarded to your Spring Boot API over HTTP
   - Spring Boot processes the request and returns a response
   - API Gateway forwards the response back to the client

2. **Security Handling**:
   - External traffic is always encrypted with HTTPS
   - Internal traffic (within AWS) uses HTTP for better performance
   - API Gateway acts as a shield, protecting your API from direct exposure

## Security Features

### HTTPS Encryption
- All external traffic uses HTTPS via API Gateway
- ACM certificate provides trusted SSL/TLS encryption
- Certificate is automatically renewed by AWS

### Rate Limiting
- **Rate limit**: 20 requests per second
- **Burst limit**: 40 requests
- **Daily quota**: 86,400 requests per day

### Benefits Over Direct Let's Encrypt
- No manual certificate renewal required
- Built-in rate limiting protects against attacks
- AWS manages certificate lifecycle

## Deployment

The API Gateway is deployed using CloudFormation:

```bash
cd /home/msloan/gitprojects/aws-starter/infrastructure
./deploy-api-gateway.sh
```

## DNS Configuration

After deployment, a DNS A record must be created in Route 53:
- **Record type**: A (Alias)
- **Name**: api.sloandev.net
- **Target**: API Gateway regional domain name

## Cost Considerations

This setup is cost-effective for a demo application:
- **API Gateway**: ~$3.50 per million requests
- **ACM Certificate**: Free with AWS services
- **Data transfer**: $0.09/GB

For a typical demo with low traffic, costs should be under $1/month.

## Monitoring

API Gateway provides CloudWatch metrics for:
- Request count
- Latency
- Error rates
- Throttled requests

## Troubleshooting

If you encounter issues:
1. Check CloudWatch logs for API Gateway
2. Verify EC2 instance is accessible from API Gateway
3. Ensure DNS is correctly configured
4. Confirm the Spring Boot API is running on port 8080
