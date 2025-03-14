---
title: "Frontmatter Guide"
category: "documentation-system"
order: 4
tags: "documentation,frontmatter,metadata"
---

# Frontmatter Guide

Frontmatter is a powerful feature that allows you to include metadata at the top of your markdown documentation files. This guide explains how to use frontmatter effectively in our documentation system.

## What is Frontmatter?

Frontmatter is a section at the beginning of a markdown file that contains metadata in YAML format. It is enclosed between triple dashes (`---`):

```yaml
---
title: "Document Title"
category: "category-name"
order: 10
tags: "tag1,tag2,tag3"
---
```

This metadata is used by our documentation system to organize, categorize, and display your documentation correctly.

## Required Frontmatter Fields

Every documentation file must include the following frontmatter fields:

### Title

The display title of the document. This will be shown in the navigation and as the main heading.

```yaml
title: "API Authentication Guide"
```

### Category

The category this document belongs to. This should match the folder name where the document is stored.

```yaml
category: "backend-development"
```

### Order

A number that determines the position of this document within its category in the navigation. Lower numbers appear first.

```yaml
order: 10
```

**Tip:** Use increments of 10 (10, 20, 30) to allow for future documents to be inserted between existing ones.

### Tags

Comma-separated list of tags that describe the content. These will be used for search and filtering.

```yaml
tags: "api,authentication,security"
```

## Optional Frontmatter Fields

You can add additional frontmatter fields for specific purposes:

### Author

The name of the document author.

```yaml
author: "Jane Smith"
```

### Date

The creation or last update date.

```yaml
date: "2025-03-13"
```

### Version

Document version information.

```yaml
version: "1.2"
```

## How Frontmatter is Used

Our documentation system uses frontmatter in several ways:

1. **Navigation Generation**: The title, category, and order fields are used to automatically generate the navigation structure.

2. **Metadata Display**: Metadata like author and date can be displayed on the documentation page.

3. **Search and Filtering**: Tags are used to enable search and filtering capabilities.

4. **Organization**: Category information helps organize documentation into logical sections.

## Example Frontmatter

Here's a complete example of frontmatter for an API documentation page:

```yaml
---
title: "Task API Reference"
category: "backend-development"
order: 30
tags: "api,tasks,endpoints,reference"
author: "Development Team"
date: "2025-03-13"
version: "1.0"
---
```

## Troubleshooting

If your documentation isn't appearing correctly in the navigation or has formatting issues, check these common frontmatter problems:

- **Missing dashes**: Ensure you have triple dashes (`---`) both before and after the frontmatter.
- **Incorrect YAML format**: Check for proper YAML syntax (e.g., quotes around values with special characters).
- **Missing required fields**: Ensure all required fields (title, category, order, tags) are present.
- **Category mismatch**: Make sure the category in frontmatter matches the folder name.
