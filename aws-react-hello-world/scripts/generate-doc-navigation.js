/**
 * Script to automatically generate the documentation navigation structure
 * based on the file system and frontmatter in markdown files.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the docs directory
const DOCS_DIR = path.join(__dirname, '..', 'docs');
const NAV_COMPONENT_PATH = path.join(__dirname, '..', 'src', 'components', 'DocsNavigation.tsx');

/**
 * Simple frontmatter parser
 * This is a basic implementation until we can install gray-matter
 */
function extractFrontmatter(content) {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
  const match = content.match(frontmatterRegex);
  
  if (!match) return {};
  
  const frontmatter = {};
  const lines = match[1].split('\n');
  
  lines.forEach(line => {
    const parts = line.split(':');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const value = parts.slice(1).join(':').trim();
      // Remove quotes if present
      frontmatter[key] = value.replace(/^["'](.*)["']$/, '$1');
    }
  });
  
  return frontmatter;
}

/**
 * Read a markdown file and extract its frontmatter and title
 */
function getDocumentInfo(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const frontmatter = extractFrontmatter(content);
    
    // If no title in frontmatter, try to extract from first heading
    if (!frontmatter.title) {
      const titleMatch = content.match(/^#\s+(.*)$/m);
      if (titleMatch) {
        frontmatter.title = titleMatch[1].trim();
      } else {
        // Use filename as fallback
        frontmatter.title = path.basename(filePath, '.md')
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      }
    }
    
    return {
      id: path.basename(filePath, '.md'),
      title: frontmatter.title,
      order: frontmatter.order ? parseInt(frontmatter.order, 10) : 999,
      path: '/docs/' + path.relative(DOCS_DIR, filePath).replace(/\\/g, '/'),
      category: frontmatter.category
    };
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return null;
  }
}

/**
 * Scan the docs directory and build the navigation structure
 */
function scanDocsDirectory() {
  const categories = {};
  const expandedCategories = {};
  
  // Helper function to scan a directory recursively
  function scanDir(dir, categoryPath = '') {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        // Skip hidden directories
        if (entry.name.startsWith('.')) continue;
        
        const categoryId = entry.name;
        const categoryRelativePath = path.join(categoryPath, categoryId);
        
        // Initialize category if it doesn't exist
        if (!categories[categoryId]) {
          categories[categoryId] = {
            id: categoryId,
            title: categoryId
              .split('-')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' '),
            path: `/docs/${categoryRelativePath}/index.md`,
            items: []
          };
          expandedCategories[categoryId] = true;
        }
        
        // Recursively scan subdirectory
        scanDir(fullPath, path.join(categoryPath, categoryId));
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        // Skip hidden files
        if (entry.name.startsWith('.')) continue;
        
        const docInfo = getDocumentInfo(fullPath);
        if (!docInfo) continue;
        
        // Determine category from directory structure
        const dirCategory = path.relative(DOCS_DIR, dir).split(path.sep)[0];
        const category = docInfo.category || dirCategory || 'uncategorized';
        
        // Skip index files for the items array (they're used as category landing pages)
        if (entry.name !== 'index.md') {
          // Initialize category if it doesn't exist
          if (!categories[category]) {
            categories[category] = {
              id: category,
              title: category
                .split('-')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' '),
              path: `/docs/${category}/index.md`,
              items: []
            };
            expandedCategories[category] = true;
          }
          
          // Add document to category
          categories[category].items.push(docInfo);
        }
      }
    }
  }
  
  // Start scanning from the root docs directory
  scanDir(DOCS_DIR);
  
  // Sort items in each category by order then title
  Object.values(categories).forEach(category => {
    category.items.sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;
      return a.title.localeCompare(b.title);
    });
  });
  
  return {
    categories: Object.values(categories),
    expandedCategories
  };
}

/**
 * Generate the DocsNavigation.tsx content
 */
function generateNavigationComponent(navigationData) {
  const { categories, expandedCategories } = navigationData;
  
  // Sort categories alphabetically
  categories.sort((a, b) => a.title.localeCompare(b.title));
  
  // Generate expanded categories state
  const expandedCategoriesStr = Object.keys(expandedCategories)
    .map(key => `    '${key}': true`)
    .join(',\n');
  
  // Generate categories array
  const categoriesStr = categories
    .map(category => {
      const itemsStr = category.items
        .map(item => `        { id: '${item.id}', title: '${item.title}', path: '${item.path}' }`)
        .join(',\n');
      
      return `    {
      id: '${category.id}',
      title: '${category.title}',
      path: '${category.path}',
      items: [
${itemsStr}
      ]
    }`;
    })
    .join(',\n');
  
  // Read the current component file
  const currentContent = fs.readFileSync(NAV_COMPONENT_PATH, 'utf8');
  
  // Extract the imports and component definition
  const importsMatch = currentContent.match(/([\s\S]*?)(const \[expandedCategories)/);
  const endMatch = currentContent.match(/(\s*return[\s\S]*$)/);
  
  if (!importsMatch || !endMatch) {
    console.error('Could not parse the DocsNavigation.tsx file');
    return;
  }
  
  // Generate the new component content
  const newContent = `${importsMatch[1]}const [expandedCategories, setExpandedCategories] = useState<{[key: string]: boolean}>({
${expandedCategoriesStr}
  });

  // Define the documentation structure with categories
  const docCategories: DocCategory[] = [
${categoriesStr}
  ];

${endMatch[1]}`;
  
  // Write the updated component
  fs.writeFileSync(NAV_COMPONENT_PATH, newContent);
  console.log('Updated DocsNavigation.tsx successfully');
}

// Main execution
try {
  const navigationData = scanDocsDirectory();
  generateNavigationComponent(navigationData);
} catch (error) {
  console.error('Error generating navigation:', error);
  process.exit(1);
}
