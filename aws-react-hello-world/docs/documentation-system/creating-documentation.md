---
title: "Creating Documentation"
category: "documentation-system"
order: 2
tags: "documentation,guide,creation"
---

# Creating Documentation

This guide explains how to create new documentation using our streamlined documentation system.

## Using the CLI Tool

The easiest way to create new documentation is to use our CLI tool. This tool will:

1. Create a new markdown file with the correct frontmatter
2. Place it in the appropriate category folder
3. Update the navigation structure automatically
4. Copy the documentation to the public directory

### Basic Usage

```bash
npm run docs:create -- --category=<category-name> --name="<Document Title>" --template=<template-name>
```

### Parameters

- `--category`: The category folder where the document will be placed (e.g., `backend-development`)
- `--name`: The title of the document (will be used for both the title in frontmatter and the filename)
- `--template`: The template to use (options: `general`, `api`, `tutorial`)
- `--tags`: Optional comma-separated list of tags (e.g., `"api,auth,security"`)

### Examples

Create a general documentation page:
```bash
npm run docs:create -- --category=backend-development --name="Database Schema" --template=general
```

Create an API documentation page:
```bash
npm run docs:create -- --category=backend-development --name="Authentication API" --template=api --tags="api,auth,security"
```

Create a tutorial:
```bash
npm run docs:create -- --category=frontend-development --name="Setting Up React Components" --template=tutorial --tags="react,components,tutorial"
```

## Manual Creation

If you prefer to create documentation manually:

1. Create a markdown file in the appropriate category folder
2. Add the required frontmatter at the top of the file
3. Add your content
4. Run `npm run docs:update` to update the navigation and copy to the public directory

### Required Frontmatter

```yaml
---
title: "Your Document Title"
category: "category-name"
order: 10
tags: "tag1,tag2,tag3"
---
```

- `title`: The display title of the document
- `category`: The category this document belongs to (should match the folder name)
- `order`: The order in which this document appears in the navigation (lower numbers appear first)
- `tags`: Comma-separated list of tags for categorization

## After Creating Documentation

After creating your documentation:

1. Edit the file to add your content
2. Run `npm run dev` to preview your changes locally
3. When ready to publish, run `npm run deploy` to deploy to production

## Best Practices

- Use descriptive titles that clearly indicate the content
- Place documentation in the most relevant category
- Use appropriate templates for different types of content
- Include relevant tags to help with future search functionality
- Keep the order numbers logical (e.g., use increments of 10 to allow for future insertions)
