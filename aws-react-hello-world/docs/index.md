# AWS Starter Project Documentation

Welcome to the AWS Starter Project documentation! This project demonstrates a full-stack application deployed on AWS with a React frontend and Spring Boot backend.

## Overview

This project showcases a simple message board application with the following components:
- React frontend hosted on AWS S3 and CloudFront (https://sloandev.net)
- Spring Boot backend API running on EC2 with MongoDB (https://api.sloandev.net)
- Secure HTTPS communication between frontend and backend
- AWS infrastructure managed with CloudFormation

## Documentation Sections

### AWS Infrastructure

- [Infrastructure Setup](./aws-infrastructure/infrastructure-setup.md) - How the AWS infrastructure is provisioned using CloudFormation
- [S3 and CloudFront Setup](./aws-infrastructure/s3-cloudfront-setup.md) - How the frontend is hosted on S3 and delivered via CloudFront
- [EC2 and Spring Boot Setup](./aws-infrastructure/ec2-springboot-setup.md) - How the backend is deployed on EC2
- [HTTPS Configuration](./aws-infrastructure/https-configuration.md) - How HTTPS is configured for secure communication
- [Elastic IP Setup](./aws-infrastructure/elastic-ip-setup.md) - How Elastic IP is used for stable addressing
- [NGINX Configuration](./aws-infrastructure/nginx-configuration.md) - Detailed guide on NGINX setup, configuration, and troubleshooting

### Application Architecture

- [Deployment Process](./application-architecture/deployment-process.md) - How to deploy updates to the application
- [Troubleshooting Guide](./application-architecture/troubleshooting-guide.md) - Common issues and their solutions

## Getting Started

To run this project locally:
1. Clone the repository
2. Start the Spring Boot backend
3. Start the React frontend
4. Access the application at http://localhost:5173

To deploy the application to AWS, follow the instructions in the [Deployment Process](./deployment-process.md) document.
