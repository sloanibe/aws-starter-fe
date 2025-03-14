import { useState, useEffect } from 'react';

interface DocsViewerProps {
  docPath: string;
}

function DocsViewer({ docPath }: DocsViewerProps) {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDoc() {
      try {
        setLoading(true);
        const response = await fetch(docPath);
        if (!response.ok) {
          throw new Error(`Failed to fetch document: ${response.status}`);
        }
        const text = await response.text();
        setContent(text);
        setError(null);
      } catch (err) {
        console.error('Error fetching document:', err);
        setError('Failed to load documentation');
      } finally {
        setLoading(false);
      }
    }

    fetchDoc();
  }, [docPath]);

  // Parse frontmatter and return the content without frontmatter
  const parseFrontmatter = (text: string) => {
    // Check if the text starts with frontmatter (---)
    if (text.trim().startsWith('---')) {
      const parts = text.split('---');
      if (parts.length >= 3) {
        // Return the content without frontmatter
        return parts.slice(2).join('---').trim();
      }
    }
    return text;
  };

  // Enhanced markdown renderer
  const renderMarkdown = (text: string) => {
    // Remove frontmatter before rendering
    const contentWithoutFrontmatter = parseFrontmatter(text);
    
    // Process the text line by line for better control
    const lines = contentWithoutFrontmatter.split('\n');
    let html = '';
    let inCodeBlock = false;
    let inList = false;
    let codeBlockContent = '';
    let listContent = '';
    
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      
      // Handle code blocks
      if (line.trim().startsWith('```')) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeBlockContent = '';
          continue;
        } else {
          inCodeBlock = false;
          html += `<pre><code>${codeBlockContent}</code></pre>`;
          continue;
        }
      }
      
      if (inCodeBlock) {
        codeBlockContent += line + '\n';
        continue;
      }
      
      // Handle lists
      if (line.trim().match(/^\s*[\*\-]\s/)) {
        if (!inList) {
          inList = true;
          listContent = '<ul>';
        }
        listContent += `<li>${line.replace(/^\s*[\*\-]\s/, '')}</li>`;
        
        // Check if next line is not a list item
        if (i === lines.length - 1 || !lines[i + 1].trim().match(/^\s*[\*\-]\s/)) {
          inList = false;
          listContent += '</ul>';
          html += listContent;
        }
        continue;
      }
      
      // Handle headers
      if (line.startsWith('# ')) {
        html += `<h1>${line.substring(2)}</h1>`;
        continue;
      }
      if (line.startsWith('## ')) {
        html += `<h2>${line.substring(3)}</h2>`;
        continue;
      }
      if (line.startsWith('### ')) {
        html += `<h3>${line.substring(4)}</h3>`;
        continue;
      }
      
      // Handle links - make sure they open in a new tab and have proper security attributes
      line = line.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, text, url) => {
        // Check if it's an internal link to another doc file
        if (url.startsWith('./') || url.startsWith('../') || (url.startsWith('/') && !url.startsWith('//')) || !url.includes('://')) {
          // Convert relative paths to absolute
          let docUrl = url;
          if (url.startsWith('./')) {
            docUrl = url.substring(2);
          } else if (!url.startsWith('/')) {
            docUrl = url;
          }
          
          // If it's a markdown file, make it a client-side navigation
          if (docUrl.endsWith('.md')) {
            return `<a href="javascript:void(0)" onclick="window.loadDoc('/docs/${docUrl}')">${text}</a>`;
          }
        }
        
        // External link - open in new tab with security attributes
        return `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`;
      });
      
      // Handle inline code
      line = line.replace(/`([^`]+)`/g, '<code>$1</code>');
      
      // Handle paragraphs
      if (line.trim() !== '') {
        if (!line.startsWith('<')) {
          html += `<p>${line}</p>`;
        } else {
          html += line;
        }
      } else if (i > 0 && lines[i-1].trim() !== '') {
        // Add spacing between paragraphs
        html += '<br/>';
      }
    }
    
    return html;
  };

  if (loading) {
    return <div className="docs-loading">Loading documentation...</div>;
  }

  if (error) {
    return <div className="docs-error">{error}</div>;
  }



  return (
    <div className="docs-viewer" style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 70px)' }}>
      <div className="docs-content" dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }} />
    </div>
  );
}

export default DocsViewer;
