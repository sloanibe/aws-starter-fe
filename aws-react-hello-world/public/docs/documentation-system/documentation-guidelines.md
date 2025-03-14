# Documentation Guidelines

This guide provides style and formatting guidelines for creating and updating documentation in the AWS Starter Project.

## General Principles

Our documentation follows these core principles:

1. **Clarity**: Information should be easy to understand
2. **Accuracy**: Content must be technically correct and up-to-date
3. **Completeness**: Cover all necessary information without overwhelming detail
4. **Consistency**: Maintain consistent style, tone, and formatting
5. **Accessibility**: Write for a diverse audience with varying technical backgrounds

## Document Structure

### Standard Document Structure

Each document should follow this general structure:

1. **Title**: A clear, descriptive H1 heading
2. **Introduction**: Brief overview of the topic
3. **Main Content**: Organized into logical sections with H2 headings
4. **Subsections**: Use H3 and H4 headings as needed
5. **Conclusion/Next Steps**: Summary and/or follow-up actions

Example:

```markdown
# Document Title

Brief introduction to the topic.

## Main Section 1

Content for section 1...

### Subsection 1.1

More detailed content...

## Main Section 2

Content for section 2...

## Next Steps

What to do after reading this document...
```

### Headings

- Use sentence case for headings (capitalize first word and proper nouns only)
- Keep headings concise and descriptive
- Maintain a logical hierarchy (H1 → H2 → H3 → H4)
- Don't skip heading levels (e.g., don't go from H2 to H4)
- Avoid having only one subsection under a section

## Writing Style

### Voice and Tone

- Use a professional, conversational tone
- Write in the present tense
- Use active voice when possible
- Address the reader directly using "you"
- Use "we" when referring to the project team or organization

### Language Guidelines

- Be concise: Use short, clear sentences
- Avoid jargon and acronyms without explanation
- Define technical terms when first used
- Use consistent terminology throughout
- Avoid ambiguous pronouns (it, they, this, that)
- Use inclusive language

## Formatting

### Text Formatting

- Use **bold** for emphasis or UI elements
- Use *italics* sparingly for introduced terms
- Use `code formatting` for:
  - Code snippets
  - File names
  - Directory paths
  - Command line commands
  - Configuration values

### Lists

- Use ordered lists (1, 2, 3) for sequential steps
- Use unordered lists (bullet points) for non-sequential items
- Keep list items parallel in structure
- Capitalize the first word of each list item
- End each list item with a period if it's a complete sentence

### Code Blocks

- Always specify the language for syntax highlighting
- Include comments for complex code
- Show complete, working examples when possible
- Format code according to language-specific standards

Example:

```javascript
// This is a JavaScript example
function greet(name) {
  // Return a greeting message
  return `Hello, ${name}!`;
}
```

### Tables

- Use tables for structured, comparative information
- Include a header row
- Keep table content concise
- Align content for readability

Example:

```markdown
| Parameter | Type   | Description           | Required |
|-----------|--------|-----------------------|----------|
| name      | string | The user's full name  | Yes      |
| email     | string | The user's email      | Yes      |
| role      | string | The user's role       | No       |
```

### Links

- Use descriptive link text (not "click here" or "this link")
- Link to relevant internal documentation
- For external links, consider if they might change
- Verify all links work before committing

## Images and Diagrams

- Include alt text for all images
- Use clear, high-quality images
- Optimize image size for web viewing
- Include captions for complex diagrams
- Place images in the `public/images` directory

Example:

```markdown
![Architecture diagram showing the connection between frontend and backend components](../images/architecture-diagram.png)
```

## Examples and Tutorials

- Provide complete, working examples
- Break tutorials into clear, sequential steps
- Include expected outcomes or results
- Consider including troubleshooting tips
- Test all examples to ensure they work as described

## Versioning and Updates

- Note when content was last updated
- Indicate which version of the software the documentation applies to
- Mark deprecated features or approaches
- Consider adding a "What's New" section for major updates

## Accessibility Considerations

- Use descriptive alt text for images
- Maintain a logical heading structure
- Ensure sufficient color contrast
- Don't rely solely on color to convey information
- Use descriptive link text

## Review Process

Before submitting documentation:

1. **Self-review**: Check for technical accuracy, clarity, and completeness
2. **Peer review**: Have a colleague review for technical accuracy
3. **Editorial review**: Check for style, grammar, and formatting
4. **User testing**: If possible, have someone unfamiliar with the topic test the instructions

## Common Mistakes to Avoid

- Assuming too much or too little technical knowledge
- Using inconsistent terminology
- Writing overly complex explanations
- Omitting prerequisites or assumptions
- Providing outdated information
- Using screenshots that quickly become outdated
- Creating orphaned content (not linked from anywhere)

## Additional Resources

- [GitHub Markdown Guide](https://guides.github.com/features/mastering-markdown/)
- [Google Developer Documentation Style Guide](https://developers.google.com/style)
- [Microsoft Writing Style Guide](https://docs.microsoft.com/en-us/style-guide/welcome/)
