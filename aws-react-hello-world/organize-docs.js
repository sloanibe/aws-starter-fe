// Script to organize documentation files into hierarchical structure
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the structure
const structure = {
  'aws-infrastructure': [
    'infrastructure-setup.md',
    's3-cloudfront-setup.md',
    'ec2-springboot-setup.md',
    'https-configuration.md',
    'elastic-ip-setup.md'
  ],
  'application-architecture': [
    'deployment-process.md',
    'troubleshooting-guide.md'
  ]
};

// Create index files for each category
const awsInfrastructureIndex = `# AWS Infrastructure Documentation

This section contains documentation related to the AWS infrastructure setup and configuration for the AWS Starter Project.

## Contents

- [Infrastructure Setup](./infrastructure-setup.md) - Overview of the AWS infrastructure setup
- [S3 and CloudFront Setup](./s3-cloudfront-setup.md) - Setting up S3 bucket and CloudFront distribution for frontend hosting
- [EC2 and Spring Boot Setup](./ec2-springboot-setup.md) - Setting up EC2 instance for Spring Boot backend
- [HTTPS Configuration](./https-configuration.md) - Configuring HTTPS for secure communication
- [Elastic IP Setup](./elastic-ip-setup.md) - Setting up Elastic IP for consistent addressing

## Getting Started

Start with the [Infrastructure Setup](./infrastructure-setup.md) guide for an overview of the AWS infrastructure components used in this project.`;

const appArchitectureIndex = `# Application Architecture Documentation

This section contains documentation related to the application architecture and development processes for the AWS Starter Project.

## Contents

- [Deployment Process](./deployment-process.md) - Guide to deploying the application
- [Troubleshooting Guide](./troubleshooting-guide.md) - Common issues and their solutions

## Getting Started

Review the [Deployment Process](./deployment-process.md) to understand how the application is deployed to AWS.`;

// Paths
const docsDir = path.join(__dirname, 'docs');
const publicDocsDir = path.join(__dirname, 'public', 'docs');

// Create directories if they don't exist
for (const category of Object.keys(structure)) {
  const docsCategoryDir = path.join(docsDir, category);
  const publicCategoryDir = path.join(publicDocsDir, category);
  
  if (!fs.existsSync(docsCategoryDir)) {
    fs.mkdirSync(docsCategoryDir, { recursive: true });
    console.log(`Created ${docsCategoryDir}`);
  }
  
  if (!fs.existsSync(publicCategoryDir)) {
    fs.mkdirSync(publicCategoryDir, { recursive: true });
    console.log(`Created ${publicCategoryDir}`);
  }
}

// Write index files
fs.writeFileSync(path.join(docsDir, 'aws-infrastructure', 'index.md'), awsInfrastructureIndex);
fs.writeFileSync(path.join(docsDir, 'application-architecture', 'index.md'), appArchitectureIndex);
fs.writeFileSync(path.join(publicDocsDir, 'aws-infrastructure', 'index.md'), awsInfrastructureIndex);
fs.writeFileSync(path.join(publicDocsDir, 'application-architecture', 'index.md'), appArchitectureIndex);

// Move files to their respective directories
for (const [category, files] of Object.entries(structure)) {
  for (const file of files) {
    // Move in docs directory
    const sourceDocsPath = path.join(docsDir, file);
    const destDocsPath = path.join(docsDir, category, file);
    
    if (fs.existsSync(sourceDocsPath)) {
      fs.renameSync(sourceDocsPath, destDocsPath);
      console.log(`Moved ${file} to ${category} in docs`);
    }
    
    // Move in public/docs directory
    const sourcePublicPath = path.join(publicDocsDir, file);
    const destPublicPath = path.join(publicDocsDir, category, file);
    
    if (fs.existsSync(sourcePublicPath)) {
      fs.renameSync(sourcePublicPath, destPublicPath);
      console.log(`Moved ${file} to ${category} in public/docs`);
    }
  }
}

console.log('Documentation organization complete!');
