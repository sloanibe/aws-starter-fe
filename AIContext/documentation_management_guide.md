# Documentation Management Guide

This guide provides detailed instructions for managing documentation in the AWS Starter project, including adding new documentation and deploying updates to the documentation site.

## Documentation System Overview

The AWS Starter project uses an advanced documentation system with the following components:

1. **Markdown Files with Frontmatter**: All documentation is written in Markdown format with YAML frontmatter and stored in the `/aws-react-hello-world/docs/` directory.
2. **Automated Navigation Generation**: The `generate-doc-navigation.js` script automatically builds the navigation structure based on directory organization and frontmatter metadata.
3. **Documentation Navigation**: The `DocsNavigation.tsx` component provides the navigation menu for browsing documentation.
4. **Documentation Viewer**: The `DocsViewer.tsx` component renders Markdown content as HTML, properly handling frontmatter.
5. **Copy Script**: The `copy-docs.js` script copies Markdown files from the `docs` directory to the `public/docs` directory during the build process.

## Adding New Documentation

### 1. Create Documentation Files

1. Identify the appropriate section for your documentation (e.g., `aws-infrastructure`, `backend-development`, `testing`).
2. Create a new Markdown file in the corresponding directory:
   ```bash
   # Example: Creating a new testing document
   touch /home/msloan/gitprojects/aws-starter/aws-react-hello-world/docs/testing/new-document.md
   ```
3. Add YAML frontmatter at the top of your Markdown file:
   ```markdown
   ---
   title: "Your Document Title"
   category: "testing"
   order: 4
   tags: "testing,example,guide"
   ---

   # Your Document Title
   
   Content goes here...
   ```

4. Write your documentation content in Markdown format.

### 2. Navigation Generation (Automated)

The navigation structure is now automatically generated based on:

1. **Directory Structure**: Each directory under `/docs` becomes a category
2. **Frontmatter Metadata**: 
   - `title`: Defines the display name in the navigation
   - `category`: Can override the directory-based categorization
   - `order`: Controls the sorting order within a category (lower numbers appear first)

You no longer need to manually update the DocsNavigation component. The navigation is generated during the build process.

### 3. Generate Navigation and Copy Documentation Files

Run the navigation generation script and copy-docs.js script:

```bash
cd /home/msloan/gitprojects/aws-starter/aws-react-hello-world
node scripts/generate-doc-navigation.js
node copy-docs.js
```

Alternatively, you can use the npm scripts:

```bash
cd /home/msloan/gitprojects/aws-starter/aws-react-hello-world
npm run docs:generate-nav
npm run docs:update
```

### 4. Test Locally

1. Start the development server:
   ```bash
   cd /home/msloan/gitprojects/aws-starter/aws-react-hello-world
   npm run dev
   ```

2. Open the application in a browser (typically at http://localhost:5173 or similar).
3. Click the "Documentation" button.
4. Navigate to your new document in the documentation sidebar.
5. Verify that your document appears and renders correctly with frontmatter properly hidden.

## Building and Deploying Documentation

### 1. Build the Application

Build the React application with the updated documentation:

```bash
cd /home/msloan/gitprojects/aws-starter/aws-react-hello-world
npm run build
```

This command:
1. Runs the copy-docs.js script to copy documentation files
2. Compiles TypeScript code
3. Builds the application with Vite

### 2. Deploy to AWS

Deploy the updated application to AWS using the provided npm script:

```bash
cd /home/msloan/gitprojects/aws-starter/aws-react-hello-world
npm run deploy
```

This script:
1. Increments the patch version in package.json
2. Builds the application
3. Syncs the dist directory to the S3 bucket
4. Creates a CloudFront invalidation to refresh the CDN cache

For more control over versioning, you can use:
- `npm run deploy:patch` - Increment patch version (e.g., 1.0.0 → 1.0.1)
- `npm run deploy:minor` - Increment minor version (e.g., 1.0.0 → 1.1.0)
- `npm run deploy:major` - Increment major version (e.g., 1.0.0 → 2.0.0)

### 3. Verify Deployment

After deployment:
1. Wait for the CloudFront invalidation to complete (typically 5-10 minutes)
2. Visit the production site (https://aws-starter-app.sloandev.net)
3. Verify that your documentation is accessible and displays correctly

## Documentation Best Practices

### Structure and Organization

1. **Use Consistent Headers**: Start each document with a top-level heading (`# Title`).
2. **Organize with Sections**: Use second and third-level headings to organize content.
3. **Keep Related Content Together**: Group related documentation in the same category.
4. **Create Index Files**: Each category should have an index.md file providing an overview.

### Content Guidelines

1. **Be Concise**: Keep explanations clear and to the point.
2. **Use Code Examples**: Include relevant code snippets using Markdown code blocks.
3. **Add Diagrams When Helpful**: Use ASCII diagrams or link to image files.
4. **Link Related Documents**: Cross-reference related documentation.

### Frontmatter Guidelines

1. **Required Fields**:
   - `title`: The display title of the document
   - `category`: The category the document belongs to
   - `order`: The sorting order within the category (lower numbers first)

2. **Optional Fields**:
   - `tags`: Comma-separated list of tags for future search functionality
   - `author`: Document author
   - `date`: Creation or last updated date

3. **Format**:
   ```markdown
   ---
   title: "Document Title"
   category: "category-name"
   order: 5
   tags: "tag1,tag2,tag3"
   ---
   ```

### Markdown Features

The documentation viewer supports:
1. **Headers** (# to ######)
2. **Lists** (ordered and unordered)
3. **Code Blocks** (with syntax highlighting)
4. **Tables**
5. **Links** (both internal and external)
6. **Emphasis** (bold and italic)

## Troubleshooting

### Documentation Not Appearing

1. **Check File Path**: Ensure the Markdown file is in the correct location.
2. **Verify Frontmatter**: Check that the document has the correct frontmatter with title, category, and order.
3. **Run Navigation Generation**: Make sure the generate-doc-navigation.js script has been run.
4. **Run Copy Script**: Make sure the copy-docs.js script has been run.
5. **Check Build Output**: Verify the document appears in the public/docs directory after building.
6. **Check Navigation JSON**: Examine the generated navigation.json file in the public directory to ensure your document is included.

### Formatting Issues

1. **Preview Locally**: Use a Markdown previewer to check formatting before deploying.
2. **Check Markdown Syntax**: Ensure your Markdown follows standard syntax rules.
3. **Inspect Rendered HTML**: Use browser developer tools to inspect how the content is rendered.

### Deployment Issues

1. **Check AWS Credentials**: Ensure AWS credentials are correctly configured.
2. **Verify S3 Permissions**: Check that you have permission to write to the S3 bucket.
3. **Monitor CloudFront Invalidation**: Check the AWS Console for invalidation status.

## Example Workflow

Here's a complete example workflow for adding a new document with the automated navigation system:

```bash
# 1. Create the document directory if needed
mkdir -p /home/msloan/gitprojects/aws-starter/aws-react-hello-world/docs/new-category

# 2. Create the documents with frontmatter
cat > /home/msloan/gitprojects/aws-starter/aws-react-hello-world/docs/new-category/index.md << 'EOL'
---
title: "New Category"
category: "new-category"
order: 1
tags: "category,overview"
---

# New Category

This is an overview of the new category.
EOL

cat > /home/msloan/gitprojects/aws-starter/aws-react-hello-world/docs/new-category/new-document.md << 'EOL'
---
title: "New Document"
category: "new-category"
order: 2
tags: "example,guide"
---

# New Document

This is a new document in the new category.
EOL

# 3. Generate navigation and copy documentation files
cd /home/msloan/gitprojects/aws-starter/aws-react-hello-world
node scripts/generate-doc-navigation.js
node copy-docs.js

# 4. Test locally
npm run dev

# 5. Build and deploy
npm run deploy
```

Notice that we no longer need to manually update the DocsNavigation.tsx file, as the navigation structure is automatically generated based on the directory structure and frontmatter metadata.
