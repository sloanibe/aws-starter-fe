import React, { useState } from 'react';
import sloanImage from '../../assets/sloanimage.jpg';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth/AuthService';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  useTheme,
} from '@mui/material';

interface LoginProps {
  onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();

  const handleGuestLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Login as guest and send notification
      const user = await authService.loginAsGuest(email, name);
      console.log('Login successful:', user);
      onLoginSuccess();
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to login. Please try again.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#1a1a1a',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'url("https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=2940")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.4,
          filter: 'blur(2px) brightness(0.4)',
          zIndex: 0
        },
        p: 2,
        overflowY: 'auto',
      }}
    >
      <Card
        elevation={24}
        sx={{
          position: 'relative',
          zIndex: 1,
          maxWidth: 450,
          width: '100%',
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          borderRadius: 3,
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        }}
      >
        <Box sx={{ position: 'relative', mt: 6 }}>
          <Box
            component="img"
            src={sloanImage}
            alt="Profile"
            sx={{
              position: 'absolute',
              top: -40,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 100,
              height: 100,
              borderRadius: '50%',
              border: '4px solid white',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              backgroundColor: 'white',
              zIndex: 2
            }}
          />
          <CardContent sx={{ p: 4, pt: 8, mt: 2 }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            mb: 4,
            mt: 2
          }}>
            <Typography 
              variant="h4" 
              component="h1" 
              gutterBottom 
              textAlign="center"
              sx={{ 
                fontWeight: 'bold',
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                backgroundClip: 'text',
                textFillColor: 'transparent',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Welcome to My Tech Playground! ✨
            </Typography>
          </Box>
          
          <Typography 
            variant="body1" 
            color="text.secondary" 
            textAlign="center" 
            sx={{ mb: 2 }}
          >
            This is my full-stack development sandbox where I experiment with modern technologies:
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            textAlign="center"
            component="div"
            sx={{ mb: 4 }}
          >
            <Box component="ul" sx={{ 
              listStyle: 'none', 
              p: 0,
              m: 0,
              '& li': { 
                mb: 0.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1
              }
            }}>
              <li>🚀 React with TypeScript & Material UI</li>
              <li>☁️ AWS (SES, API Gateway, EC2)</li>
              <li>🔒 Spring Boot Backend with JWT Auth</li>
              <li>📧 Email Notifications with AWS SES</li>
              <li>🌐 RESTful API Architecture</li>
            </Box>
          </Typography>

          <Typography 
            variant="body2" 
            color="primary.main" 
            textAlign="center" 
            sx={{ mb: 4, fontWeight: 'medium' }}
          >
            Sign in below to explore the features! ✨
          </Typography>

          <Box
            component="form"
            onSubmit={handleGuestLogin}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
            }}
          >
            <TextField
              fullWidth
              label="Name"
              variant="outlined"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isLoading}
              placeholder="Enter your name"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: theme.palette.primary.main,
                  },
                },
              }}
            />
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
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: theme.palette.primary.main,
                  },
                },
              }}
            />

            {error && (
              <Alert 
                severity="error"
                variant="filled"
                sx={{ 
                  borderRadius: 1,
                }}
              >
                {error}
              </Alert>
            )}

            <Button
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              type="submit"
              disabled={isLoading}
              sx={{
                py: 1.5,
                textTransform: 'none',
                fontWeight: 'medium',
                boxShadow: 2,
                '&:hover': {
                  boxShadow: 4,
                },
              }}
            >
              {isLoading ? 'Logging in...' : 'Continue as Guest'}
            </Button>
          </Box>
        </CardContent>
        </Box>
      </Card>
    </Box>
  );
};

export default Login;
