# React Hooks in Practice

This document explains how React hooks are used in our application for state management and side effects.

## useState: Managing Component State

The `useState` hook is the primary way we manage state in functional components:

```tsx
// From Login.tsx
const [email, setEmail] = useState('');
const [name, setName] = useState('');
const [company, setCompany] = useState('');
const [error, setError] = useState('');
const [isLoading, setIsLoading] = useState(false);
```

Key patterns:
- Each piece of state gets its own state variable
- State variables come with setter functions
- Initial values are passed to useState
- State updates trigger component re-renders

## useEffect: Managing Side Effects

The `useEffect` hook handles side effects like data fetching, subscriptions, and DOM manipulations:

```tsx
// From App.tsx - Run once on mount
useEffect(() => {
  // Clear any existing authentication on app load
  authService.logout();
  setIsAuthenticated(false);
}, []); // Empty dependency array = run once on mount

// Example with dependencies - runs when dependencies change
useEffect(() => {
  // This would run whenever user or projectId changes
  fetchProjectDetails(user.id, projectId);
}, [user, projectId]);
```

Common useEffect patterns in our app:

1. **Data fetching**:
   ```tsx
   useEffect(() => {
     const fetchData = async () => {
       setIsLoading(true);
       try {
         const response = await fetch('/api/data');
         const data = await response.json();
         setData(data);
       } catch (error) {
         setError(error.message);
       } finally {
         setIsLoading(false);
       }
     };
     
     fetchData();
   }, []);
   ```

2. **Cleanup operations**:
   ```tsx
   useEffect(() => {
     const subscription = someService.subscribe();
     
     // Return cleanup function
     return () => {
       subscription.unsubscribe();
     };
   }, []);
   ```

## useCallback: Memoizing Functions

The `useCallback` hook prevents unnecessary function recreations:

```tsx
// From App.tsx
const updateAuthState = useCallback((state: boolean) => {
  setIsAuthenticated(state);
}, []);
```

This is useful when:
- Passing functions as props to child components
- Including functions in dependency arrays of other hooks
- Optimizing performance for complex components

## useRef: Accessing DOM Elements

The `useRef` hook provides a way to access DOM elements directly:

```tsx
// Example of useRef for DOM access
const inputRef = useRef<HTMLInputElement>(null);

// Focus the input element
const focusInput = () => {
  if (inputRef.current) {
    inputRef.current.focus();
  }
};

// In JSX
<TextField inputRef={inputRef} />
```

## useNavigate: Programmatic Routing

From React Router, we use the `useNavigate` hook for programmatic navigation:

```tsx
// From Login.tsx
const navigate = useNavigate();

const handleGuestLogin = async (e: React.FormEvent) => {
  // ... authentication logic ...
  navigate('/dashboard');
};
```

## useParams: Accessing Route Parameters

For dynamic routes, we use the `useParams` hook:

```tsx
// For a route like /projects/:projectId
const { projectId } = useParams();
```

## Custom Hooks: Reusing Logic

Custom hooks allow us to extract and reuse stateful logic across components:

```tsx
// Example custom hook for API calls
function useApi(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(url);
        const json = await response.json();
        setData(json);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, loading, error };
}

// Usage in a component
const { data, loading, error } = useApi('/api/projects');
```

## useTheme: Accessing Theme in Material UI

Material UI provides the `useTheme` hook to access the theme:

```tsx
// From Login.tsx
const theme = useTheme();

// Using theme values in styles
sx={{
  '&:hover fieldset': {
    borderColor: theme.palette.primary.main,
  },
}}
```

## Hook Rules

Remember the Rules of Hooks:
1. Only call hooks at the top level of your component
2. Only call hooks from React function components or custom hooks
3. Don't call hooks inside loops, conditions, or nested functions

These rules ensure that hooks maintain their state correctly between renders.
