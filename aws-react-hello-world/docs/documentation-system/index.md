---
title: "Documentation System"
category: "documentation-system"
order: 1
tags: "documentation,overview,system"
---

# Documentation System

Welcome to the AWS Starter Documentation System. This guide explains how our documentation system works and how to contribute new documentation efficiently.

## Overview

Our documentation system is designed to be:

1. **Easy to use** - Simple processes for adding and updating documentation
2. **Maintainable** - Automated navigation generation and consistent structure
3. **Extensible** - Supports different types of documentation through templates
4. **Organized** - Clear categorization and metadata for all documentation

## Key Features

- **Frontmatter Support**: All documentation files include metadata in YAML format at the top of the file
- **Automated Navigation**: The navigation structure is generated automatically based on the file system and frontmatter
- **Documentation Templates**: Predefined templates for different types of documentation
- **CLI Tool**: A command-line tool for creating new documentation files with the correct structure

## Documentation Structure

Documentation is organized into categories, with each category containing multiple documents:

```
docs/
├── application-architecture/
│   ├── index.md
│   ├── deployment-process.md
│   └── ...
├── aws-infrastructure/
│   ├── index.md
│   ├── s3-cloudfront-setup.md
│   └── ...
└── ...
```

Each category has an `index.md` file that provides an overview of the category.

## Getting Started

To get started with our documentation system, check out these guides:

- [Creating Documentation](./creating-documentation.md) - How to add new documentation
- [Documentation Templates](./documentation-templates.md) - Overview of available templates
- [Frontmatter Guide](./frontmatter-guide.md) - How to use frontmatter in your documentation
- [Technical Implementation](./technical-implementation.md) - How the documentation system works
