# Routing in React

This document explains how routing works in our React application using React Router.

## Route Configuration

In our application, routes are defined in the `App.tsx` file within the `AppContent` component:

```tsx
// From App.tsx
<Routes>
  <Route path="/" element={isAuthenticated ? <Dashboard /> : <Login onLoginSuccess={() => updateAuthState(true)} />} />
  <Route path="/login" element={<Login onLoginSuccess={() => updateAuthState(true)} />} />
  <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Login onLoginSuccess={() => updateAuthState(true)} />} />
  <Route path="/projects/:projectId" element={isAuthenticated ? <ProjectDetailComponent /> : <Login onLoginSuccess={() => updateAuthState(true)} />} />
  <Route path="/resume" element={isAuthenticated ? <Resume /> : <Login onLoginSuccess={() => updateAuthState(true)} />} />
  <Route path="/figma" element={isAuthenticated ? <FigmaWireframe /> : <Login onLoginSuccess={() => updateAuthState(true)} />} />
</Routes>
```

Key concepts:
- `Routes` is a container for all route definitions
- Each `Route` maps a URL path to a React component
- The `path` prop defines the URL pattern to match
- The `element` prop specifies what component to render when that path is matched

## Route Parameters

Dynamic segments in routes are defined with a colon prefix:

```tsx
<Route path="/projects/:projectId" element={isAuthenticated ? <ProjectDetailComponent /> : <Login onLoginSuccess={() => updateAuthState(true)} />} />
```

This creates a route parameter named `projectId` that can be accessed in the component using the `useParams` hook:

```tsx
import { useParams } from 'react-router-dom';

const ProjectDetailComponent = () => {
  const { projectId } = useParams();
  
  // Now you can use projectId to fetch specific project data
  // ...
};
```

## Programmatic Navigation

To navigate between routes programmatically (e.g., after form submission), we use the `useNavigate` hook:

```tsx
// From Login.tsx
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  
  const handleGuestLogin = async (e) => {
    // ... authentication logic ...
    
    // After successful login, navigate to dashboard
    navigate('/dashboard');
  };
  
  // ...
};
```

The `navigate` function:
- Changes the URL in the browser's address bar
- Uses the browser's History API to avoid full page reloads
- Triggers React Router to render the matching component

## Authentication-Based Routing

Our application implements a simple route guard pattern using conditional rendering:

```tsx
<Route 
  path="/dashboard" 
  element={isAuthenticated ? <Dashboard /> : <Login onLoginSuccess={() => updateAuthState(true)} />} 
/>
```

This pattern:
- Checks the `isAuthenticated` state
- If true, renders the protected component (Dashboard)
- If false, renders the Login component
- Passes a callback to update authentication state after successful login

## How URLs Work in React Router

When using React Router:

1. The browser URL might be `http://localhost:3000/dashboard`
2. React Router only cares about the path portion (`/dashboard`)
3. It finds the Route with the matching path
4. It renders the component specified in that Route's element prop

The domain part (`http://localhost:3000`) is handled by the web server, not React Router.

## Link Component for Navigation

For navigation triggered by user clicks, we use the `Link` component:

```tsx
import { Link } from 'react-router-dom';

// Example navigation link
<Link to="/dashboard">Go to Dashboard</Link>
```

The `Link` component:
- Renders as an `<a>` tag in the HTML
- Intercepts clicks to prevent default browser navigation
- Uses the History API to update the URL
- Prevents page reloads, maintaining the single-page application experience

## Router Setup

The entire routing system is wrapped in a `Router` component in the main App function:

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

This provides the routing context to all child components.
