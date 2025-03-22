import { useState, useEffect } from 'react';
import { Box, Paper, Typography } from '@mui/material';

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

  const handleSelectDoc = (path: string) => {
    setSelectedDocPath(path);
  };

  return (
    <div className="documentation-container">
      <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
        <Typography variant="h4" gutterBottom>Documentation</Typography>
      </Paper>
      
      <Box sx={{ display: 'flex', height: 'calc(100vh - 200px)' }}>
        <Box sx={{ width: '250px', borderRight: 1, borderColor: 'divider' }}>
          <DocsNavigation onSelectDoc={handleSelectDoc} />
        </Box>
        
        <Box sx={{ flexGrow: 1, p: 2 }}>
          <DocsViewer docPath={selectedDocPath} />
        </Box>
      </Box>
    </div>
  );
}

export default Documentation;
