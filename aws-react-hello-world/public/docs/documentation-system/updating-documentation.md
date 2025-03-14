# Updating Documentation

This guide explains how to update existing documentation in the AWS Starter Project.

## When to Update Documentation

Documentation should be updated when:

- New features are added to the application
- Existing features change or are removed
- Processes or workflows are modified
- Errors or inaccuracies are found
- Additional examples or clarifications are needed

## Step 1: Locate the Documentation File

1. Identify which document needs to be updated
2. Find the corresponding Markdown file in the `docs` directory:

```bash
cd /path/to/aws-starter/aws-react-hello-world/docs/
```

Documentation is organized by category (e.g., `aws-infrastructure`, `backend-development`, `testing`).

## Step 2: Make Your Changes

1. Open the Markdown file in your preferred text editor
2. Make the necessary changes following the [Documentation Guidelines](./documentation-guidelines.md)
3. Save the file

### Common Update Scenarios

#### Adding New Sections

When adding new sections, maintain the heading hierarchy:

```markdown
## Existing Section

Content...

### New Subsection

New content...

## Another New Section

More new content...
```

#### Updating Code Examples

When updating code examples, ensure they:
- Reflect the current codebase
- Include all necessary imports and dependencies
- Follow project coding standards
- Have proper syntax highlighting

#### Updating Screenshots or Diagrams

If updating visual elements:
1. Create new images if necessary
2. Place them in the appropriate directory in `public/images/`
3. Update image references in the Markdown

## Step 3: Test Your Changes

1. Run the copy-docs.js script to copy your updated documentation to the public directory:

```bash
cd /path/to/aws-starter/aws-react-hello-world
node copy-docs.js
```

2. Start the development server:

```bash
npm run dev
```

3. Open the application in a browser and navigate to your updated documentation.

4. Verify that:
   - Content renders correctly
   - Any new sections appear in the expected location
   - Links work as expected
   - Code blocks have proper syntax highlighting

## Step 4: Update Related Documentation

Consider if your changes affect other documentation:

1. Check for cross-references to the updated content
2. Update related documents for consistency
3. If you've made significant changes, consider updating the category index page

## Step 5: Commit Your Changes

Once you're satisfied with your updates:

```bash
git add docs/category-name/updated-document.md
# Add any other changed files
git commit -m "Update documentation for [topic]"
git push
```

## Best Practices for Documentation Updates

- **Track changes**: Keep a record of significant documentation updates
- **Maintain consistency**: Ensure tone and style match existing documentation
- **Avoid duplication**: Update existing content rather than creating duplicates
- **Remove obsolete information**: Delete outdated content that is no longer relevant
- **Preserve structure**: Maintain the established document structure
- **Incremental improvements**: Small, regular updates are better than infrequent overhauls

## Handling Major Revisions

For major documentation revisions:

1. Consider creating a new document if changes are extensive
2. Update navigation links and references to the old document
3. Consider adding a note indicating when the major revision occurred
4. If appropriate, archive the old version rather than deleting it

## Next Steps

After updating documentation:

- Consider asking for a review from team members
- If you've made significant changes, announce them to the team
- Monitor for feedback and be prepared to make additional adjustments

For information on creating new documentation, see [Creating Documentation](./creating-documentation.md).
