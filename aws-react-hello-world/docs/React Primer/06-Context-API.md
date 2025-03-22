# Context API and State Management

This document explains how the Context API is used in our application to avoid prop drilling and manage global state.

## The Problem: Prop Drilling

Without context, passing data through multiple component levels creates "prop drilling":

```tsx
// Without Context - Prop Drilling
<App>
  <Header user={user} />
  <Main>
    <Sidebar user={user} />
    <Content>
      <Profile user={user} />
    </Content>
  </Main>
</App>
```

This becomes unwieldy as the component tree grows deeper.

## The Solution: React Context

Context provides a way to share values between components without explicitly passing props through every level:

```tsx
// Create a context
const UserContext = React.createContext(null);

// Provider at a high level
function App() {
  const [user, setUser] = useState(null);
  
  return (
    <UserContext.Provider value={{ user, setUser }}>
      <Header />
      <Main />
    </UserContext.Provider>
  );
}

// Consumer in a deeply nested component
function Profile() {
  const { user } = useContext(UserContext);
  
  return <div>Hello, {user.name}</div>;
}
```

## Context Implementation Pattern

Our application follows this pattern for creating and using context:

1. **Create a context file**:
   ```tsx
   // Example: AuthContext.tsx
   import React, { createContext, useState, useContext, ReactNode } from 'react';

   interface AuthContextType {
     isAuthenticated: boolean;
     user: any | null;
     login: (userData: any) => void;
     logout: () => void;
   }

   const AuthContext = createContext<AuthContextType | undefined>(undefined);

   export const AuthProvider: React.FC<{children: ReactNode}> = ({ children }) => {
     const [isAuthenticated, setIsAuthenticated] = useState(false);
     const [user, setUser] = useState(null);

     const login = (userData: any) => {
       setUser(userData);
       setIsAuthenticated(true);
     };

     const logout = () => {
       setUser(null);
       setIsAuthenticated(false);
     };

     return (
       <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
         {children}
       </AuthContext.Provider>
     );
   };

   // Custom hook for using this context
   export const useAuth = () => {
     const context = useContext(AuthContext);
     if (context === undefined) {
       throw new Error('useAuth must be used within an AuthProvider');
     }
     return context;
   };
   ```

2. **Wrap the application with the provider**:
   ```tsx
   // In App.tsx
   import { AuthProvider } from './contexts/AuthContext';

   function App() {
     return (
       <AuthProvider>
         <Router>
           <AppContent />
         </Router>
       </AuthProvider>
     );
   }
   ```

3. **Use the context in components**:
   ```tsx
   // In any component
   import { useAuth } from './contexts/AuthContext';

   function Profile() {
     const { user, logout } = useAuth();
     
     return (
       <div>
         <h2>Welcome, {user.name}</h2>
         <button onClick={logout}>Logout</button>
       </div>
     );
   }
   ```

## When to Use Context

Context is ideal for:

1. **Authentication state**: User info, login status
2. **Theme data**: Colors, typography, spacing
3. **Localization**: Language, translations
4. **Feature flags**: Enabling/disabling features
5. **Global UI state**: Sidebar open/closed, modal visibility

## Context vs. Props

Use context when:
- Data needs to be accessed by many components at different nesting levels
- Passing props would create excessive prop drilling
- The data changes infrequently

Use props when:
- Data is only needed by direct children
- You want to maintain clear data flow
- Component reusability is important

## Performance Considerations

Context triggers re-renders in all consuming components when its value changes. To optimize:

1. **Split contexts by purpose**:
   ```tsx
   // Instead of one large context
   <AppContext.Provider value={{ user, theme, notifications, settings }}>
   
   // Use multiple focused contexts
   <UserContext.Provider value={user}>
     <ThemeContext.Provider value={theme}>
       <NotificationContext.Provider value={notifications}>
         {children}
       </NotificationContext.Provider>
     </ThemeContext.Provider>
   </UserContext.Provider>
   ```

2. **Memoize context values**:
   ```tsx
   const memoizedValue = useMemo(() => ({
     user,
     login,
     logout
   }), [user]);
   
   return (
     <AuthContext.Provider value={memoizedValue}>
       {children}
     </AuthContext.Provider>
   );
   ```

## Context with useReducer

For complex state logic, combine context with useReducer:

```tsx
// Example of context with reducer
const initialState = { count: 0 };

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    default:
      throw new Error();
  }
}

const CountContext = createContext();

function CountProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  
  return (
    <CountContext.Provider value={{ state, dispatch }}>
      {children}
    </CountContext.Provider>
  );
}
```

This pattern provides a Redux-like state management approach without additional libraries.
