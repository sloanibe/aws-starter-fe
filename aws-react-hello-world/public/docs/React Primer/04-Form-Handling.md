# Form Handling with Material UI

This document explains how forms are implemented in our application using Material UI components.

## Basic Form Structure

Our application uses Material UI's form components with React's state management. Here's the pattern from the Login component:

```tsx
// From Login.tsx
<Box
  component="form"
  onSubmit={handleGuestLogin}
  sx={{
    display: 'flex',
    flexDirection: 'column',
    gap: { xs: 2, sm: 3 },
    maxWidth: { md: '80%' },
    mx: 'auto',
    width: '100%'
  }}
>
  {/* Form fields go here */}
  <TextField
    fullWidth
    label="Name"
    variant="outlined"
    value={name}
    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
    required
    disabled={isLoading}
    placeholder="Enter your name"
    InputProps={{
      startAdornment: (
        <InputAdornment position="start">
          <PersonIcon color="primary" />
        </InputAdornment>
      ),
    }}
  />
  
  {/* More fields... */}
  
  <Button
    fullWidth
    variant="contained"
    color="primary"
    size="large"
    type="submit"
    disabled={isLoading}
  >
    {isLoading ? 'Logging in...' : 'Continue as Guest'}
  </Button>
</Box>
```

Key elements:
- `Box` component with `component="form"` to render as an HTML form
- `onSubmit` handler to process form submission
- `TextField` components for input fields
- State variables connected to each input via `value` and `onChange`
- Submit button with `type="submit"`

## Form State Management

Each form field is connected to a state variable:

```tsx
// State declarations
const [email, setEmail] = useState('');
const [name, setName] = useState('');
const [company, setCompany] = useState('');

// Input field with state connection
<TextField
  value={email}
  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
  // ...other props
/>
```

This creates a controlled component where React state is the "single source of truth" for the input value.

## Form Submission Handling

Form submission is handled by a function that:
1. Prevents the default form submission behavior
2. Validates inputs (if needed)
3. Processes the form data (e.g., API calls)
4. Handles success/error states
5. Performs post-submission actions (e.g., navigation)

```tsx
// From Login.tsx
const handleGuestLogin = async (e: React.FormEvent) => {
  e.preventDefault(); // Prevent default form submission
  setError('');
  setIsLoading(true);

  try {
    // Process form data (API call)
    const guestUser = await authService.loginAsGuest(email, name, company);
    
    // Handle success
    localStorage.setItem('user', JSON.stringify(guestUser));
    onLoginSuccess();
    navigate('/dashboard'); // Post-submission navigation
  } catch (err) {
    // Handle error
    setError('Failed to login. Please try again.');
    console.error('Login error:', err);
  } finally {
    // Reset loading state
    setIsLoading(false);
  }
};
```

## Material UI Form Components

Our application uses various Material UI components for forms:

### TextField

```tsx
<TextField
  fullWidth
  label="Email"
  variant="outlined"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  required
  disabled={isLoading}
  placeholder="Enter your email"
  InputProps={{
    startAdornment: (
      <InputAdornment position="start">
        <EmailIcon color="primary" />
      </InputAdornment>
    ),
  }}
  sx={{
    '& .MuiOutlinedInput-root': {
      '&:hover fieldset': {
        borderColor: theme.palette.primary.main,
      },
    },
  }}
/>
```

### Button

```tsx
<Button
  fullWidth
  variant="contained"
  color="primary"
  size="large"
  type="submit"
  disabled={isLoading}
  sx={{
    mt: { xs: 1, md: 2 },
    py: 1.5,
    fontWeight: 'bold',
    borderRadius: 2,
    textTransform: 'none',
    fontSize: '1rem',
  }}
>
  {isLoading ? 'Logging in...' : 'Continue as Guest'}
</Button>
```

### Form Layout with Box and Grid

Material UI provides flexible layout components for organizing forms:

```tsx
<Box sx={{ 
  display: 'flex', 
  flexDirection: { xs: 'column', md: 'row' },
  gap: { xs: 2, md: 3 },
  width: '100%'
}}>
  {/* First column */}
  <Box sx={{ flex: { md: 1 }, width: '100%' }}>
    <TextField /* ... */ />
  </Box>
  
  {/* Second column */}
  <Box sx={{ flex: { md: 1 }, width: '100%' }}>
    <TextField /* ... */ />
  </Box>
</Box>
```

## Form Validation

Our application implements form validation through:

1. **HTML5 validation attributes**:
   ```tsx
   <TextField
     required
     type="email"
     // ...
   />
   ```

2. **Custom validation logic** in the submission handler:
   ```tsx
   const handleSubmit = (e) => {
     e.preventDefault();
     
     // Custom validation
     if (!email.includes('@')) {
       setError('Please enter a valid email');
       return;
     }
     
     // Proceed with submission
     // ...
   };
   ```

3. **Error state display**:
   ```tsx
   {error && (
     <Alert 
       severity="error"
       variant="filled"
     >
       {error}
     </Alert>
   )}
   ```

## Loading States

Our forms handle loading states to provide feedback during async operations:

```tsx
// Loading state
const [isLoading, setIsLoading] = useState(false);

// In the submission handler
const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  
  try {
    // Async operations
  } finally {
    setIsLoading(false);
  }
};

// Disable inputs during loading
<TextField disabled={isLoading} />

// Change button text during loading
<Button disabled={isLoading}>
  {isLoading ? 'Processing...' : 'Submit'}
</Button>
```

This provides a responsive user experience during form submission.
