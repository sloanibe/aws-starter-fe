import React, { useState } from 'react';
import sloanImage from '../../assets/sloanimage.jpg';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth/AuthService';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
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
        bottom: 50, // Exact height of footer
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
        pt: { xs: 4, sm: 6 }, // Added padding top for small screens
        overflowY: 'auto',
        zIndex: 1, // Higher than 0 but lower than footer
      }}
    >
      <Card
        elevation={24}
        sx={{
          position: 'relative',
          zIndex: 1,
          maxWidth: { xs: 450, md: 800 },
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
            mb: { xs: 2, sm: 3, md: 4 },
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
            sx={{ mb: { xs: 1, sm: 2 }, maxWidth: { md: '80%', lg: '70%' }, mx: 'auto' }}
          >
            This is my full-stack development sandbox where I experiment with modern enterprise technologies.
            It's a work in progress designed to showcase state-of-the-art trends in enterprise software architecture.
          </Typography>

          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'center',
            alignItems: { xs: 'center', md: 'flex-start' },
            mb: { xs: 2, sm: 3 },
            width: '100%',
            gap: { md: 4 }
          }}>
            {/* Current Technologies */}
            <Box sx={{ 
              flex: { md: 1 },
              width: '100%',
              maxWidth: { md: '50%' }
            }}>
              <Typography
                variant="subtitle2"
                color="primary.dark"
                textAlign={{ xs: 'center', md: 'left' }}
                sx={{ mb: { xs: 0.5, sm: 1 }, fontWeight: 'bold', pl: { md: 2 } }}
              >
                Current Technologies:
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                component="div"
                sx={{ mb: { xs: 2, md: 0 } }}
              >
                <Box component="ul" sx={{ 
                  listStyle: 'none', 
                  p: 0,
                  m: 0,
                  '& li': { 
                    mb: { xs: 0.25, sm: 0.5 },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: { xs: 'center', md: 'flex-start' },
                    gap: 1
                  }
                }}>
                  <li>🚀 React with TypeScript & Material UI</li>
                  <li>☁️ AWS (SES, API Gateway, EC2, CloudFormation)</li>
                  <li>🔒 Spring Boot Backend with JWT Auth</li>
                  <li>📧 Email Notifications with AWS SES</li>
                  <li>🌐 RESTful API Architecture</li>
                  <li>🧩 Microservices with Service Discovery</li>
                </Box>
              </Typography>
            </Box>
            
            {/* Coming Soon */}
            <Box sx={{ 
              flex: { md: 1 },
              width: '100%',
              maxWidth: { md: '50%' }
            }}>
              <Typography
                variant="subtitle2"
                color="primary.dark"
                textAlign={{ xs: 'center', md: 'left' }}
                sx={{ mb: { xs: 0.5, sm: 1 }, fontWeight: 'bold', pl: { md: 2 } }}
              >
                Coming Soon:
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                component="div"
              >
                <Box component="ul" sx={{ 
                  listStyle: 'none', 
                  p: 0,
                  m: 0,
                  '& li': { 
                    mb: { xs: 0.25, sm: 0.5 },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: { xs: 'center', md: 'flex-start' },
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
            </Box>
          </Box>
          
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mb: { xs: 1.5, sm: 2 },
              width: '100%'
            }}
          >
            <Box
              sx={{
                backgroundColor: 'rgba(25, 118, 210, 0.08)',
                borderRadius: 1,
                p: { xs: 1, sm: 1.5 },
                maxWidth: { xs: '95%', md: '80%' },
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
            color="primary.main" 
            textAlign="center"
            sx={{ 
              mb: { xs: 1, sm: 2 }, 
              fontWeight: 'medium',
              maxWidth: { md: '80%' },
              mx: 'auto'
            }}
          >
            Sign in below to explore the features! ✨
          </Typography>
          
          <Typography 
            variant="body2" 
            color="text.secondary" 
            textAlign="center"
            sx={{ 
              mb: { xs: 2, sm: 3 }, 
              fontStyle: 'italic',
              maxWidth: { md: '80%' },
              mx: 'auto'
            }}
          >
            In the upcoming weeks, this site will be updated with more demos that showcase current trends in
            enterprise software development, cloud architecture, microservices with service discovery, CI/CD with GitHub Actions, and modern UI/UX patterns.
          </Typography>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: { xs: 2, sm: 4 },
              backgroundColor: 'rgba(255, 193, 7, 0.1)',
              borderRadius: 2,
              p: 2,
              maxWidth: { md: '80%' },
              mx: 'auto',
              border: '1px dashed rgba(255, 193, 7, 0.5)',
            }}
          >
            <LightbulbIcon sx={{ color: 'warning.main', mr: 1.5, fontSize: '1.5rem' }} />
            <Typography
              variant="body2"
              color="text.primary"
              sx={{ fontWeight: 'medium' }}
            >
              Be sure to check out the documentation for my notes on various aspects of the design and implementation!
            </Typography>
          </Box>

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
            {/* Two-column layout for larger screens */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', md: 'row' },
              gap: { xs: 2, md: 3 },
              width: '100%'
            }}>
              {/* First column */}
              <Box sx={{ flex: { md: 1 }, width: '100%' }}>
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
                    mb: { md: 3 },
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
              </Box>
              
              {/* Second column */}
              <Box sx={{ flex: { md: 1 }, width: '100%' }}>
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
                    mb: { md: 3 },
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: theme.palette.primary.main,
                      },
                    },
                  }}
                />
                
                {/* Empty space to balance the layout */}
                <Box sx={{ 
                  display: { xs: 'none', md: 'flex' },
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '56px', // Approximate height of a TextField
                  opacity: 0.7
                }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    All fields are securely processed
                  </Typography>
                </Box>
              </Box>
            </Box>

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
                maxWidth: { md: '60%' },
                mx: 'auto',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                '&:hover': {
                  boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
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
