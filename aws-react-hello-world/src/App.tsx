import { useState } from 'react'
import './App.css'
import './Documentation.css'
import './components/tasks/TaskStyles.css'
import packageJson from '../package.json'
import Documentation from './components/Documentation'
import TaskApp from './components/tasks/TaskApp'

// Material UI imports
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'

// This will help us see how the version is processed
console.log('VERSION_INFO_MARKER', { 
  version: packageJson.version,
  packageJsonType: typeof packageJson,
  isDirectString: packageJson.version === '0.0.1'
});

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  const [showDocs, setShowDocs] = useState<boolean>(false);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="container">
      <div className="app-header">
        <div className="app-title-section">
          <h1>AWS Starter Project</h1>
          <div className="version-info">Version {packageJson.version}</div>
        </div>
        <div className="header-actions">
          <button 
            className={`toggle-docs-button ${showDocs ? 'active' : ''}`}
            onClick={() => setShowDocs(!showDocs)}
          >
            {showDocs ? 'Hide Documentation' : 'Documentation'}
          </button>
          <div className="api-status">
            <div className="status-indicator online"></div>
            <span>API: <a href="https://api.sloandev.net/api/test" target="_blank" rel="noopener noreferrer">api.sloandev.net</a></span>
          </div>
        </div>
      </div>
      
      {/* Error message container removed as it's now handled in TaskApp */}
      
      <div className="app-content">
        <div className="task-section" style={{ flex: showDocs ? '1' : '2' }}>
          <TaskApp />  
        </div>
        
        {showDocs && (
          <div className="docs-container">
            <Documentation />
          </div>
        )}
      </div>
    </div>
    </ThemeProvider>
  )
}

export default App
