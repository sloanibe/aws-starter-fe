import { useState, useEffect } from 'react';
import DocsNavigation from './DocsNavigation';
import DocsViewer from './DocsViewer';

function Documentation() {
  const [selectedDocPath, setSelectedDocPath] = useState<string>('/docs/index.md');

  // Add a global function to load docs that can be called from the markdown links
  useEffect(() => {
    // Extend the window interface to include our custom function
    (window as any).loadDoc = (path: string) => {
      setSelectedDocPath(path);
    };

    return () => {
      // Clean up when component unmounts
      delete (window as any).loadDoc;
    };
  }, []);

  return (
    <div className="documentation-container">
      <DocsNavigation onSelectDoc={setSelectedDocPath} />
      <DocsViewer docPath={selectedDocPath} />
    </div>
  );
}

export default Documentation;
