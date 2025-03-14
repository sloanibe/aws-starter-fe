---
title: "Documentation Templates"
category: "documentation-system"
order: 3
tags: "documentation,templates,structure"
---

# Documentation Templates

Our documentation system provides several templates to ensure consistency and make it easier to create new documentation. This guide explains the available templates and when to use them.

## Available Templates

### General Template

The general template is suitable for most documentation needs. It provides a basic structure for explaining concepts, processes, or components.

**Structure:**
- Title
- Overview
- Main content sections
- Related resources

**When to use:**
- Explaining concepts
- Describing system components
- Documenting processes that don't fit the tutorial format
- General reference information

**Example usage:**
```bash
npm run docs:create -- --category=backend-development --name="Database Schema" --template=general
```

### API Template

The API template is specifically designed for documenting APIs. It includes sections for endpoints, parameters, authentication, and examples.

**Structure:**
- API Overview
- Base URL
- Authentication
- Endpoints (with request/response examples)
- Error codes
- Rate limiting information
- Example implementations

**When to use:**
- Documenting REST APIs
- Describing service endpoints
- Explaining API authentication methods
- Providing API integration examples

**Example usage:**
```bash
npm run docs:create -- --category=backend-development --name="Task API" --template=api --tags="api,tasks,endpoints"
```

### Tutorial Template

The tutorial template provides a step-by-step guide format. It's ideal for walkthroughs and how-to guides.

**Structure:**
- Introduction
- Prerequisites
- Learning objectives
- Step-by-step instructions
- Troubleshooting
- Next steps

**When to use:**
- Creating how-to guides
- Providing step-by-step instructions
- Onboarding documentation
- Feature implementation guides

**Example usage:**
```bash
npm run docs:create -- --category=frontend-development --name="Implementing Authentication UI" --template=tutorial --tags="tutorial,authentication,ui"
```

## Customizing Templates

The templates are located in the `scripts/templates` directory. If you need to modify or create new templates:

1. Navigate to `scripts/templates/`
2. Edit an existing template or create a new one with a `.md` extension
3. Include appropriate frontmatter and placeholder content

## Template Frontmatter

All templates include frontmatter with placeholders that will be replaced when creating a new document:

```yaml
---
title: "{{title}}"
category: "{{category}}"
order: 10
tags: "{{tags}}"
---
```

These placeholders will be replaced with the values provided when running the `docs:create` command.
