
/**
 * Simple service for loading documentation files
 */
class DocumentationService {
  /**
   * Initialize the documentation service
   */
  public async initialize(): Promise<void> {
    // No initialization needed anymore
    return Promise.resolve();
  }

  /**
   * Generate a title from the path if no title is provided
   */
  private generateTitleFromPath(path: string): string {
    // Extract the filename without extension
    const filename = path.split('/').pop()?.replace(/\.md$/, '') || '';
    
    // Convert to title case with spaces
    return filename
      .replace(/-/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase());
  }
}

// Create and export a singleton instance
export const documentationService = new DocumentationService();
