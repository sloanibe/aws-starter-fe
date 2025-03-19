import { useState, useEffect, useCallback } from 'react'
import './App.css'
import './Documentation.css'
import './components/tasks/TaskStyles.css'
import packageJson from '../package.json'
import Header from './components/Header'
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

const AppContent = () => {
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
    <div className="container">
      {isAuthenticated && <Header />}
      {/* Show header only when authenticated or on resume page */}
      
      {/* Error message container removed as it's now handled in TaskApp */}
      
      <div className="app-content">
        <Routes>
          <Route path="/" element={isAuthenticated ? <Dashboard /> : <Login onLoginSuccess={() => updateAuthState(true)} />} />
          <Route path="/login" element={<Login onLoginSuccess={() => updateAuthState(true)} />} />
          <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Login onLoginSuccess={() => updateAuthState(true)} />} />
          <Route path="/projects/:projectId" element={isAuthenticated ? <ProjectDetailComponent /> : <Login onLoginSuccess={() => updateAuthState(true)} />} />
          <Route path="/resume" element={isAuthenticated ? <Resume /> : <Login onLoginSuccess={() => updateAuthState(true)} />} />
        </Routes>
      </div>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App
