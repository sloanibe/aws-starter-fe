# Data Fetching with React

This document explains how components in our application fetch and manage data from APIs.

## Basic Data Fetching Pattern

The standard pattern we use for data fetching includes:
1. Creating state variables for data, loading state, and errors
2. Using useEffect to trigger the API call
3. Updating state based on the API response
4. Rendering different UI based on the current state

```tsx
import React, { useState, useEffect } from 'react';

const DataFetchingExample = () => {
  // State declarations
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('https://api.example.com/data');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        setData(result);
        setError(null);
      } catch (err) {
        setError('Failed to fetch data: ' + err.message);
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array = run once on mount

  // Conditional rendering based on state
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>No data found</div>;

  return (
    <div>
      {/* Render data here */}
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};
```

## Real Example: Guest Login in AuthService

Our application uses services to encapsulate API calls. Here's how the AuthService handles guest login:

```tsx
// From AuthService.ts
async loginAsGuest(email: string, name: string, company?: string): Promise<GuestUser> {
  try {
    const response = await fetch(`${apiConfig.apiBaseUrl}${apiConfig.endpoints.users}/guest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        name: name,
        displayName: name,
        username: 'guest',
        organization: company || ''
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const user = await response.json();
    this.setUser(user);
    return user;
  } catch (error) {
    console.error('Error during guest login:', error);
    throw error;
  }
}
```

## Using the Service in a Component

The Login component uses this service:

```tsx
// From Login.tsx
const handleGuestLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setIsLoading(true);

  try {
    // Login as guest and send notification
    const guestUser = await authService.loginAsGuest(email, name, company);
    console.log('Guest login successful:', guestUser);
    // Store guest user in local storage
    localStorage.setItem('user', JSON.stringify(guestUser));
    onLoginSuccess();
    navigate('/dashboard');
  } catch (err) {
    setError('Failed to login. Please try again.');
    console.error('Login error:', err);
  } finally {
    setIsLoading(false);
  }
};
```

## Best Practices for Data Fetching

1. **Always handle loading states** to provide feedback to users
2. **Always handle errors** to prevent silent failures
3. **Use try/catch/finally** for proper error handling and cleanup
4. **Abstract API calls into services** for reusability
5. **Use dependency arrays in useEffect** to control when fetches happen
6. **Cancel fetch requests** when components unmount to prevent memory leaks

```tsx
// Example of cancelling fetch requests
useEffect(() => {
  let isMounted = true;
  
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('https://api.example.com/data');
      const result = await response.json();
      
      // Only update state if component is still mounted
      if (isMounted) {
        setData(result);
        setIsLoading(false);
      }
    } catch (err) {
      if (isMounted) {
        setError(err.message);
        setIsLoading(false);
      }
    }
  };

  fetchData();
  
  // Cleanup function
  return () => {
    isMounted = false;
  };
}, []);
```

This pattern ensures we don't update state on unmounted components, which would cause React warnings.
