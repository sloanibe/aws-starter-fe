# AWS Starter Project

A full-stack application deployed on AWS with a React frontend and Spring Boot backend, demonstrating AWS infrastructure setup and application architecture.

## Project Overview

- **Frontend**: React with TypeScript, hosted on AWS S3 and CloudFront (https://sloandev.net)
- **Backend**: Spring Boot API, running on EC2 (https://api.sloandev.net)
- **Database**: MongoDB running on the EC2 instance
- **Infrastructure**: Managed with CloudFormation templates

## CI/CD Setup

This project uses GitHub Actions for continuous integration and deployment:

- **Frontend Deployment**: Automatically builds and deploys the React application to S3 when changes are pushed to the main branch
- **CloudFront Invalidation**: Automatically invalidates the CloudFront cache to ensure users get the latest version

## Repository Structure

- `/aws-react-hello-world/` - React frontend application
- `/aws-starter-api/` - Spring Boot backend API
- `/infrastructure/` - CloudFormation templates and deployment scripts
- `/docs/` - Project documentation
- `/AIContext/` - Context files for AI assistance

## Getting Started

### Prerequisites

- Node.js and npm
- Java 17
- Maven
- AWS CLI configured with appropriate credentials
- Docker (for local MongoDB development)

### Local Development

1. **Start MongoDB locally**:
   ```bash
   cd aws-starter-api
   ./setup-test-env.sh
   ```

2. **Run the backend**:
   ```bash
   cd aws-starter-api
   ./mvnw spring-boot:run
   ```

3. **Run the frontend**:
   ```bash
   cd aws-react-hello-world
   npm run dev
   ```

## Deployment

### Manual Deployment

#### Frontend
```bash
cd aws-react-hello-world
npm run deploy
```

#### Backend
```bash
./deploy-backend.sh
```

#### Infrastructure
```bash
cd infrastructure
./manage-stack.sh deploy
```

### Automated Deployment

Push changes to the main branch, and GitHub Actions will automatically deploy the frontend to S3.

## Documentation

Comprehensive documentation is available in the application at https://sloandev.net/docs
