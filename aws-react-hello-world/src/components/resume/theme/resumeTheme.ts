import { createTheme, Theme } from '@mui/material/styles';

// Create a theme instance specifically for the resume component
export const resumeTheme: Theme = createTheme({

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#ffffff'
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          background: 'transparent',
          padding: 0 // Remove default padding
        }
      }
    },
    MuiTypography: {
      styleOverrides: {
        h2: {
          background: 'transparent',
          color: '#ffffff',
          padding: 0,
          marginBottom: 0,
          borderBottom: '1px solid currentColor'
        }
      }
    },
    MuiList: {
      styleOverrides: {
        root: {
          '& li': {
            fontSize: '0.9rem',
            lineHeight: 1.5,
            marginBottom: '0.5rem',
            paddingLeft: '1.5rem',
            position: 'relative',
            '&::before': {
              content: '"•"',
              position: 'absolute',
              left: '0.5rem'
            }
          }
        }
      }
    }
  },

  palette: {
    primary: {
      main: '#a5b1c2',    // Header background color
      light: '#dfe6e9',   // Light grey for subtle backgrounds
    },
    grey: {
      500: '#2d3436',    // Dark grey for main text
      300: '#333333',    // Left column background
      100: '#f5f6fa',    // Very light grey for name section
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',   // White background for right column
    },
    text: {
      primary: '#2d3436', // Dark text color for right column
      secondary: '#ffffff', // White text for left column
    }
  },
  typography: {
    fontFamily: '"Arial", "Helvetica", sans-serif',
    h1: {
      fontSize: '24px',
      fontWeight: 700,
      textAlign: 'center',
    },
    h3: {
      fontSize: '16px',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    body1: {
      fontSize: '14px',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '13px',
      lineHeight: 1.4,
    }
  },
  spacing: (factor: number) => `${8 * factor}px`
});
