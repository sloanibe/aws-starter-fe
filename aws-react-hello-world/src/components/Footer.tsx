import React from 'react';
import { Box, Typography, Container, Link } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import CopyrightIcon from '@mui/icons-material/Copyright';

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        px: 2,
        backgroundColor: (theme) => theme.palette.mode === 'light' ? theme.palette.grey[200] : theme.palette.grey[800],
        borderTop: '1px solid',
        borderColor: 'divider',
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        width: '100%',
        height: '50px',
        boxShadow: '0px -2px 4px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center', // This centers content vertically
      }}
    >
      <Container maxWidth="lg" sx={{ height: '100%', display: 'flex', alignItems: 'center' }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CopyrightIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {new Date().getFullYear()} SloanDev
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 3,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EmailIcon fontSize="small" color="primary" />
              <Link
                href="mailto:sloanibe@gmail.com"
                underline="hover"
                color="text.primary"
                sx={{ fontWeight: 500, fontSize: '0.875rem' }}
              >
                sloanibe@gmail.com
              </Link>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PhoneIcon fontSize="small" color="primary" />
              <Link
                href="tel:+19515844460"
                underline="hover"
                color="text.primary"
                sx={{ fontWeight: 500, fontSize: '0.875rem' }}
              >
                951.584.4460
              </Link>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
