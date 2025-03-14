#!/usr/bin/env node
/**
 * CLI tool for creating new documentation files
 * Usage: node create-doc.js --category=backend-development --name="API Authentication" --template=api
 */
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse command line arguments
const args = process.argv.slice(2);
const params = {};

args.forEach(arg => {
  if (arg.startsWith('--')) {
    const [key, value] = arg.substring(2).split('=');
    params[key] = value || true;
  }
});

// Validate required parameters
if (!params.category || !params.name) {
  console.error('Error: Missing required parameters');
  console.log('Usage: node create-doc.js --category=backend-development --name="API Authentication" [--template=api]');
  console.log('\nAvailable templates:');
  console.log('  general   - General documentation (default)');
  console.log('  api       - API documentation');
  console.log('  tutorial  - Step-by-step tutorial');
  process.exit(1);
}

// Convert name to kebab-case for filename
const fileName = params.name
  .toLowerCase()
  .replace(/[^\w\s-]/g, '')
  .replace(/\s+/g, '-');

// Define paths
const DOCS_DIR = path.join(__dirname, '..', 'docs');
const TEMPLATES_DIR = path.join(__dirname, 'templates');
const categoryDir = path.join(DOCS_DIR, params.category);
const filePath = path.join(categoryDir, `${fileName}.md`);

// Determine which template to use
const templateType = params.template || 'general';
const templatePath = path.join(TEMPLATES_DIR, `${templateType}.md`);

// Check if template exists
if (!fs.existsSync(templatePath)) {
  console.error(`Error: Template '${templateType}' not found`);
  console.log('Available templates:');
  console.log('  general   - General documentation (default)');
  console.log('  api       - API documentation');
  console.log('  tutorial  - Step-by-step tutorial');
  process.exit(1);
}

// Create category directory if it doesn't exist
if (!fs.existsSync(categoryDir)) {
  console.log(`Creating category directory: ${params.category}`);
  fs.mkdirSync(categoryDir, { recursive: true });
  
  // Create index.md for the category if it doesn't exist
  const indexPath = path.join(categoryDir, 'index.md');
  if (!fs.existsSync(indexPath)) {
    const categoryTitle = params.category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    const indexContent = `---
title: "${categoryTitle}"
category: "${params.category}"
order: 1
---

# ${categoryTitle}

This section contains documentation related to ${categoryTitle.toLowerCase()}.

## Overview

[Add an overview of this documentation category]

## Documents in this Section

[This will be populated with links to documents in this category]
`;
    
    fs.writeFileSync(indexPath, indexContent);
    console.log(`Created category index: ${indexPath}`);
  }
}

// Check if file already exists
if (fs.existsSync(filePath)) {
  console.error(`Error: Document already exists: ${filePath}`);
  process.exit(1);
}

// Read template and replace placeholders
let templateContent = fs.readFileSync(templatePath, 'utf8');
const documentTitle = params.name;
const order = params.order || 10;
const tags = params.tags ? params.tags : '';

// Replace template placeholders
templateContent = templateContent
  .replace(/{{title}}/g, documentTitle)
  .replace(/{{category}}/g, params.category)
  .replace(/{{order}}/g, order)
  .replace(/{{tags}}/g, tags);

// Write the document
fs.writeFileSync(filePath, templateContent);
console.log(`Created document: ${filePath}`);

// Generate navigation
try {
  console.log('Updating navigation...');
  execSync('node scripts/generate-doc-navigation.js', { cwd: path.join(__dirname, '..') });
  console.log('Navigation updated successfully');
} catch (error) {
  console.error('Error updating navigation:', error.message);
}

// Copy docs to public directory
try {
  console.log('Copying docs to public directory...');
  execSync('node copy-docs.js', { cwd: path.join(__dirname, '..') });
  console.log('Docs copied successfully');
} catch (error) {
  console.error('Error copying docs:', error.message);
}

// Try to open the file in the default editor if requested
if (params.open) {
  try {
    const platform = process.platform;
    let command;
    
    if (platform === 'win32') {
      command = `start "" "${filePath}"`;
    } else if (platform === 'darwin') {
      command = `open "${filePath}"`;
    } else {
      // Linux and others
      command = `xdg-open "${filePath}"`;
    }
    
    execSync(command);
    console.log('Opened document in editor');
  } catch (error) {
    console.error('Could not open document in editor:', error.message);
  }
}

console.log('\nDocument created successfully!');
console.log(`You can now edit: ${filePath}`);
console.log('Run the development server to preview your changes: npm run dev');
