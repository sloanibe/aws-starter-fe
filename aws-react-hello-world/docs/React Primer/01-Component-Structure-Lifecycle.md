# Component Structure and Lifecycle

## Functional Components

This project primarily uses functional components with hooks, which is the modern approach to React development.

### Basic Component Structure

```tsx
// From Login.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface LoginProps {
  onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  // State declarations
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  
  // Component logic
  
  // Return JSX
  return (
    <div>
      {/* Component UI */}
    </div>
  );
};

export default Login;
```

Key elements:
- TypeScript interface for props
- React.FC type annotation
- State declarations using useState hook
- JSX return

## Component Lifecycle with Hooks

In class components, we had lifecycle methods like `componentDidMount`. In functional components, we use the `useEffect` hook:

```tsx
// Example from AppContent component in App.tsx
useEffect(() => {
  // Clear any existing authentication on app load
  authService.logout();
  setIsAuthenticated(false);
}, []); // Empty dependency array = run once on mount
```

### Different useEffect Patterns

1. **Run once on mount** (similar to componentDidMount):
   ```tsx
   useEffect(() => {
     // Code to run once when component mounts
   }, []);
   ```

2. **Run when specific values change**:
   ```tsx
   useEffect(() => {
     // Code to run when dependencies change
   }, [dependency1, dependency2]);
   ```

3. **Cleanup on unmount** (similar to componentWillUnmount):
   ```tsx
   useEffect(() => {
     // Setup code
     
     return () => {
       // Cleanup code runs when component unmounts
     };
   }, []);
   ```

## Component Composition

Our project uses component composition to build complex UIs from simpler components:

```tsx
// From App.tsx
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
```

This pattern of nesting components creates a component tree that efficiently updates when state changes.

## Conditional Rendering

We use conditional rendering extensively to show different UI based on state:

```tsx
// From App.tsx - Conditional rendering based on authentication
<Route 
  path="/dashboard" 
  element={isAuthenticated ? <Dashboard /> : <Login onLoginSuccess={() => updateAuthState(true)} />} 
/>

// From Login.tsx - Conditional rendering for error messages
{error && (
  <Alert 
    severity="error"
    variant="filled"
    sx={{ 
      borderRadius: 1,
      maxWidth: { md: '80%' },
      mx: 'auto',
      width: '100%'
    }}
  >
    {error}
  </Alert>
)}
```

These patterns form the foundation of our React component architecture.
