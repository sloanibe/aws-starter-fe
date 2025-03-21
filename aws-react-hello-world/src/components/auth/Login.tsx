import React, { useState } from 'react';
import sloanImage from '../../assets/sloanimage.jpg';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth/AuthService';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  useTheme,
  InputAdornment,
} from '@mui/material';

interface LoginProps {
  onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
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

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'flex-start', // Changed from 'center' to 'flex-start'
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
        pt: { xs: 4, sm: 6 }, // Added padding top for small screens
        overflowY: 'auto',
        minHeight: '100vh', // Ensure minimum height
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
          my: { xs: 4, sm: 6 }, // Add margin top and bottom
          maxHeight: { xs: 'calc(100vh - 32px)', sm: 'calc(100vh - 64px)' }, // Limit max height based on viewport
          overflowY: 'auto', // Enable scrolling within the card
        }}
      >
        <Box sx={{ position: 'relative', mt: { xs: 5, sm: 6 } }}>
          <Box
            component="img"
            src={sloanImage}
            alt="Profile"
            sx={{
              position: 'absolute',
              top: { xs: -35, sm: -40 }, // Smaller top position on small screens
              left: '50%',
              transform: 'translateX(-50%)',
              width: { xs: 80, sm: 100 }, // Smaller image on small screens
              height: { xs: 80, sm: 100 }, // Smaller image on small screens
              borderRadius: '50%',
              border: '2px solid #e0e0e0',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              zIndex: 2
            }}
          />
          <CardContent sx={{ p: { xs: 3, sm: 4 }, pt: { xs: 6, sm: 8 }, mt: 2 }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            mb: { xs: 2, sm: 4 },
            mt: { xs: 1, sm: 2 }
          }}>
            <Typography 
              variant="h5" 
              sx={{
                fontSize: { xs: '1.5rem', sm: '2.125rem' }, // Responsive font size
                fontWeight: 'bold',
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                backgroundClip: 'text',
                textFillColor: 'transparent',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
              component="h1" 
              gutterBottom 
              textAlign="center"

            >
              Welcome to My Tech Sandbox! ✨
            </Typography>
            
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                backgroundColor: 'rgba(33, 150, 243, 0.1)',
                borderRadius: '16px',
                px: 2,
                py: 0.5,
                border: '1px solid rgba(33, 150, 243, 0.3)',
              }}
            >
              <Typography
                variant="caption"
                sx={{ 
                  fontWeight: 'medium',
                  color: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5
                }}
              >
                <span style={{ fontSize: '10px' }}>⚡</span> EXPERIMENTAL <span style={{ fontSize: '10px' }}>⚡</span>
              </Typography>
            </Box>
          </Box>
          
          <Typography 
            variant="body1" 
            color="text.secondary" 
            textAlign="center" 
            sx={{ mb: { xs: 1, sm: 2 } }}
          >
            This is my full-stack development sandbox where I experiment with modern enterprise technologies.
            It's a work in progress designed to showcase state-of-the-art trends in enterprise software architecture.
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            textAlign="center"
            component="div"
            sx={{ mb: { xs: 2, sm: 3 } }}
          >
            <Box component="ul" sx={{ 
              listStyle: 'none', 
              p: 0,
              m: 0,
              '& li': { 
                mb: { xs: 0.25, sm: 0.5 },
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
              <li>🧩 Microservices with Service Discovery</li>
            </Box>
          </Typography>
          
          <Typography
            variant="subtitle2"
            color="primary.dark"
            textAlign="center"
            sx={{ mb: { xs: 0.5, sm: 1 }, fontWeight: 'bold' }}
          >
            Coming Soon:
          </Typography>
          
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mb: { xs: 1.5, sm: 2 },
            }}
          >
            <Box
              sx={{
                backgroundColor: 'rgba(25, 118, 210, 0.08)',
                borderRadius: 1,
                p: { xs: 1, sm: 1.5 },
                maxWidth: '95%',
                border: '1px dashed rgba(25, 118, 210, 0.3)',
              }}
            >
              <Typography
                variant="caption"
                color="primary.dark"
                sx={{ display: 'block', fontWeight: 'medium', mb: { xs: 0.25, sm: 0.5 }, fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
              >
                💡 SPOTLIGHT: Microservices Architecture
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
              >
                Our implementation features distributed services with dynamic service discovery using Eureka/Consul,
                allowing seamless scaling, resilience, and zero-downtime deployments in a cloud-native environment.
              </Typography>
            </Box>
          </Box>
          
          <Typography
            variant="body2"
            color="text.secondary"
            textAlign="center"
            component="div"
            sx={{ mb: { xs: 2, sm: 3 } }}
          >
            <Box component="ul" sx={{ 
              listStyle: 'none', 
              p: 0,
              m: 0,
              '& li': { 
                mb: { xs: 0.25, sm: 0.5 },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                fontStyle: 'italic',
                opacity: 0.85
              }
            }}>
              <li>🔄 Real-time Collaboration Features</li>
              <li>🧠 AI-Powered Insights & Recommendations</li>
              <li>📊 Advanced Analytics Dashboard</li>
              <li>🔐 Enhanced Security & Compliance</li>
              <li>🧩 Advanced Microservices Architecture with Eureka/Consul</li>
            </Box>
          </Typography>

          <Typography 
            variant="body2" 
            color="primary.main" 
            textAlign="center" 
            sx={{ mb: { xs: 1, sm: 2 }, fontWeight: 'medium' }}
          >
            Sign in below to explore the features! ✨
          </Typography>
          
          <Typography 
            variant="body2" 
            color="text.secondary" 
            textAlign="center" 
            sx={{ mb: { xs: 2, sm: 4 }, fontStyle: 'italic' }}
          >
            In the upcoming weeks, this site will be updated with more demos that showcase current trends in
            enterprise software development, cloud architecture, microservices with service discovery, and modern UI/UX patterns.
          </Typography>

          <Box
            component="form"
            onSubmit={handleGuestLogin}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: { xs: 2, sm: 3 },
            }}
          >
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
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
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
            <TextField
              fullWidth
              label="Company (Optional)"
              variant="outlined"
              value={company}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCompany(e.target.value)}
              disabled={isLoading}
              placeholder="Enter your company name"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <BusinessIcon color="primary" />
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
