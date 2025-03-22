# Reducers in React

This document explains what reducers are, why they're useful, and how to implement them in React applications.

## What is a Reducer?

A reducer is a pure function that takes the current state and an action as arguments, and returns a new state. The concept comes from functional programming and is popularized by Redux, but is now built into React via the `useReducer` hook.

```tsx
// Basic reducer structure
function reducer(state, action) {
  switch (action.type) {
    case 'ACTION_TYPE_1':
      return { ...state, /* changes based on action */ };
    case 'ACTION_TYPE_2':
      return { ...state, /* different changes */ };
    default:
      return state; // Return unchanged state for unknown actions
  }
}
```

Key characteristics:
- **Pure function**: Same inputs always produce the same output
- **No side effects**: Doesn't modify the original state or perform other operations
- **Immutable updates**: Creates a new state object rather than modifying the existing one

## Why Use Reducers?

Reducers offer several advantages over simple `useState` for complex state management:

1. **Centralized Logic**: All state transitions are defined in one place
2. **Predictable State Changes**: Actions clearly describe how state changes
3. **Easier Debugging**: State changes are explicit and traceable
4. **Complex State Relationships**: Manage multiple related state values together
5. **Testable**: Pure functions are easy to test without mocking

## When to Use Reducers

Use reducers when:
- State logic involves multiple sub-values
- Next state depends on previous state
- State transitions are complex
- State logic needs to be shared between components
- You need a clear history of state changes

## useReducer Hook

React's `useReducer` hook provides reducer functionality:

```tsx
import { useReducer } from 'react';

// Initial state
const initialState = {
  count: 0,
  isLoading: false,
  error: null
};

// Reducer function
function counterReducer(state, action) {
  switch (action.type) {
    case 'INCREMENT':
      return { ...state, count: state.count + 1 };
    case 'DECREMENT':
      return { ...state, count: state.count - 1 };
    case 'RESET':
      return { ...state, count: 0 };
    case 'LOADING':
      return { ...state, isLoading: true, error: null };
    case 'SUCCESS':
      return { ...state, isLoading: false, count: action.payload };
    case 'ERROR':
      return { ...state, isLoading: false, error: action.payload };
    default:
      return state;
  }
}

// Component using the reducer
function Counter() {
  const [state, dispatch] = useReducer(counterReducer, initialState);
  
  const increment = () => dispatch({ type: 'INCREMENT' });
  const decrement = () => dispatch({ type: 'DECREMENT' });
  const reset = () => dispatch({ type: 'RESET' });
  
  const fetchCount = async () => {
    dispatch({ type: 'LOADING' });
    try {
      const response = await fetch('/api/count');
      const data = await response.json();
      dispatch({ type: 'SUCCESS', payload: data.count });
    } catch (error) {
      dispatch({ type: 'ERROR', payload: error.message });
    }
  };
  
  return (
    <div>
      <p>Count: {state.count}</p>
      {state.isLoading && <p>Loading...</p>}
      {state.error && <p>Error: {state.error}</p>}
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
      <button onClick={reset}>Reset</button>
      <button onClick={fetchCount}>Fetch Count</button>
    </div>
  );
}
```

## Action Structure

Actions typically follow a standard structure:
- `type`: A string that identifies the action (required)
- `payload`: Any data needed for the state change (optional)

```tsx
// Action examples
{ type: 'ADD_TODO', payload: { id: 1, text: 'Learn React', completed: false } }
{ type: 'TOGGLE_TODO', payload: 1 } // Just the ID is needed
{ type: 'CLEAR_COMPLETED' } // No payload needed
```

## Combining Reducers

For complex applications, you can split reducers by concern and combine them:

```tsx
// User reducer
function userReducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, isLoggedIn: true, user: action.payload };
    case 'LOGOUT':
      return { ...state, isLoggedIn: false, user: null };
    default:
      return state;
  }
}

// Tasks reducer
function tasksReducer(state, action) {
  switch (action.type) {
    case 'ADD_TASK':
      return [...state, action.payload];
    case 'REMOVE_TASK':
      return state.filter(task => task.id !== action.payload);
    default:
      return state;
  }
}

// Combined reducer
function appReducer(state, action) {
  return {
    user: userReducer(state.user, action),
    tasks: tasksReducer(state.tasks, action)
  };
}

// Usage
const initialState = {
  user: { isLoggedIn: false, user: null },
  tasks: []
};

function App() {
  const [state, dispatch] = useReducer(appReducer, initialState);
  // ...
}
```

## Reducers with Context

Combining reducers with Context API creates a powerful state management solution:

```tsx
// Create context
const AppContext = createContext();

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  theme: 'light',
  notifications: []
};

// Reducer
function appReducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, user: action.payload, isAuthenticated: true };
    case 'LOGOUT':
      return { ...state, user: null, isAuthenticated: false };
    case 'TOGGLE_THEME':
      return { ...state, theme: state.theme === 'light' ? 'dark' : 'light' };
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [...state.notifications, action.payload] };
    case 'REMOVE_NOTIFICATION':
      return { 
        ...state, 
        notifications: state.notifications.filter(n => n.id !== action.payload) 
      };
    default:
      return state;
  }
}

// Provider component
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => {
    return { state, dispatch };
  }, [state]);
  
  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

// Custom hook to use the context
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

// Usage in a component
function Profile() {
  const { state, dispatch } = useApp();
  
  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };
  
  return (
    <div className={`theme-${state.theme}`}>
      <h1>Welcome, {state.user.name}</h1>
      <button onClick={logout}>Logout</button>
      <button onClick={() => dispatch({ type: 'TOGGLE_THEME' })}>
        Toggle Theme
      </button>
    </div>
  );
}
```

This pattern provides a Redux-like state management solution without additional libraries.

## Reducers vs. useState

| Feature | useState | useReducer |
|---------|----------|------------|
| Complexity | Simple state | Complex state logic |
| Predictability | Less structured | More structured |
| Related state | Separate | Grouped together |
| Testing | More difficult | Easier (pure functions) |
| Code organization | Scattered | Centralized |
| Learning curve | Lower | Higher |
| Debugging | Harder to trace | Easier to trace |

## Best Practices

1. **Use descriptive action types**: `'FETCH_USERS_SUCCESS'` is better than `'SUCCESS'`
2. **Keep reducers pure**: No side effects, API calls, or direct state mutation
3. **Normalize complex state**: Avoid deeply nested objects
4. **Use action creators** for frequently used or complex actions
5. **Split reducers** by domain or feature
6. **Consider immer** for simpler immutable updates:
   ```tsx
   import produce from 'immer';
   
   function todoReducer(state, action) {
     return produce(state, draft => {
       switch (action.type) {
         case 'ADD_TODO':
           draft.push(action.payload);
           break;
         case 'TOGGLE_TODO':
           const todo = draft.find(t => t.id === action.payload);
           if (todo) todo.completed = !todo.completed;
           break;
       }
     });
   }
   ```

Reducers provide a powerful pattern for managing complex state in React applications, especially when combined with the Context API for global state management.
