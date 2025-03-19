import { useState, useEffect, useCallback } from 'react'
import './App.css'
import './Documentation.css'
import './components/tasks/TaskStyles.css'
import packageJson from '../package.json'
import Documentation from './components/Documentation'
import Dashboard from './components/Dashboard';
import ProjectDetailComponent from './components/ProjectDetail';
import Login from './components/auth/Login';
import { authService } from './services/auth/AuthService';

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

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Resume from './components/resume/Resume';

function App() {
  const [showDocs, setShowDocs] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const updateAuthState = useCallback((state: boolean) => {
    setIsAuthenticated(state);
  }, []);

  useEffect(() => {
    // Clear any existing authentication on app load
    authService.logout();
    setIsAuthenticated(false);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className="container">
          {isAuthenticated && (
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
                <button
                  className="logout-button"
                  onClick={() => {
                    authService.logout();
                    setIsAuthenticated(false);
                  }}
                >
                  Logout
                </button>
                <div className="api-status">
                  <div className="status-indicator online"></div>
                  <span>API: <a href="https://tylsa7bs12.execute-api.us-west-1.amazonaws.com/prod/api/health" target="_blank" rel="noopener noreferrer">AWS API Gateway</a></span>
                </div>
              </div>
            </div>
          )}
          
          {/* Error message container removed as it's now handled in TaskApp */}
          
          <div className="app-content">
            <Routes>
              <Route path="/" element={isAuthenticated ? <Dashboard /> : <Login onLoginSuccess={() => updateAuthState(true)} />} />
              <Route path="/login" element={<Login onLoginSuccess={() => updateAuthState(true)} />} />
              <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Login onLoginSuccess={() => updateAuthState(true)} />} />
              <Route path="/projects/:projectId" element={isAuthenticated ? <ProjectDetailComponent /> : <Login onLoginSuccess={() => updateAuthState(true)} />} />
              <Route path="/resume" element={<Resume />} />
            </Routes>

            {showDocs && (
              <div className="docs-container">
                <Documentation />
              </div>
            )}
          </div>
        </div>
      </Router>
    </ThemeProvider>
  )
}

export default App
