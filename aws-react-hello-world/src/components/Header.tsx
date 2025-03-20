import React, { useState, useRef, useCallback } from 'react';
import generatePDF from 'react-to-pdf';
import { useNavigate } from 'react-router-dom';
import {
  AppBar, Toolbar, IconButton, Avatar, Typography, Box,
  InputBase, Menu, MenuItem, Divider, Badge, Tooltip,
  Button, Drawer
} from '@mui/material';
import {
  Notifications, Search, AccountCircle, Settings,
  ExitToApp, FilterList, MenuBook, Close, Description,
  Print
} from '@mui/icons-material';
import Documentation from './Documentation';

interface HeaderProps {
  title?: string;
  onToggleDocumentation?: () => void;
  isDocumentationOpen?: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  title = 'ProjectHub'
}) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [isDocumentationOpen, setIsDocumentationOpen] = useState(false);
  const [drawerWidth, setDrawerWidth] = useState(800);
  const [isResizing, setIsResizing] = useState(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(800);

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    setIsResizing(true);
    startXRef.current = e.clientX;
    startWidthRef.current = drawerWidth;
  }, [drawerWidth]);

  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;
    const diff = startXRef.current - e.clientX;
    const newWidth = Math.min(Math.max(startWidthRef.current + diff, 400), window.innerWidth * 0.9);
    setDrawerWidth(newWidth);
  }, [isResizing]);

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
  }, []);

  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);
      return () => {
        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [isResizing, handleResizeMove, handleResizeEnd]);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleFilterMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setFilterAnchorEl(null);
  };

  return (
    <>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          {/* Logo/Title */}
          <Typography
            variant="h6"
            noWrap
            component="div"
            onClick={() => navigate('/')}
            sx={{ 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              color: 'inherit',
              textDecoration: 'none',
              mr: 2
            }}
          >
            {title}
          </Typography>

          {/* Search Bar */}
          <Box sx={{
            position: 'relative',
            bgcolor: 'rgba(255, 255, 255, 0.15)',
            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.25)' },
            borderRadius: 1,
            width: '100%',
            maxWidth: 400,
            mx: 2
          }}>
            <Box sx={{ position: 'absolute', pl: 2, height: '100%', display: 'flex', alignItems: 'center' }}>
              <Search />
            </Box>
            <InputBase
              placeholder="Search projects..."
              sx={{
                color: 'inherit',
                width: '100%',
                '& .MuiInputBase-input': {
                  pl: 6,
                  py: 1
                }
              }}
            />
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {/* Right Side Icons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              color="inherit"
              startIcon={<MenuBook />}
              onClick={() => setIsDocumentationOpen(!isDocumentationOpen)}
              sx={{
                borderRadius: 2,
                bgcolor: isDocumentationOpen ? 'action.selected' : 'transparent',
                '&:hover': {
                  bgcolor: isDocumentationOpen ? 'action.selected' : 'action.hover'
                }
              }}
            >
              Documentation
            </Button>
            <Button
              color="inherit"
              startIcon={<Description />}
              onClick={() => navigate('/resume')}
              sx={{
                borderRadius: 2,
                '&:hover': {
                  bgcolor: 'action.hover'
                }
              }}
            >
              Resume
            </Button>
            {window.location.pathname === '/resume' && (
              <>
                <Tooltip title="Export to PDF">
                  <Button 
                    color="inherit" 
                    endIcon={<Description />}
                    onClick={() => {
                      const getTargetElement = () => document.getElementById('resume-content');
                      generatePDF(getTargetElement, {
                        filename: 'resume.pdf',
                        page: { margin: 20 },
                        overrides: {
                          pdf: {
                            compress: true
                            // Remove pdfOptions as it's causing TypeScript errors
                          },
                          canvas: {
                            useCORS: true,
                            scale: 2,
                            logging: true
                          }
                        }
                      });
                    }}
                    sx={{
                      borderRadius: 2,
                      '&:hover': {
                        bgcolor: 'action.hover'
                      }
                    }}
                  >
                    PDF
                  </Button>
                </Tooltip>
                <Tooltip title="Print Resume">
                  <IconButton 
                    color="inherit" 
                    onClick={() => {
                      // Create an iframe for printing to avoid conflicts with react-to-pdf
                      const iframe = document.createElement('iframe');
                      iframe.style.display = 'none';
                      document.body.appendChild(iframe);
                      
                      // Get the resume content
                      const resumeContent = document.getElementById('resume-content');
                      
                      if (resumeContent && iframe.contentWindow) {
                        // Write the content to the iframe
                        iframe.contentWindow.document.open();
                        iframe.contentWindow.document.write(`
                          <!DOCTYPE html>
                          <html>
                          <head>
                            <title>Resume Print</title>
                            <style>
                              @page { size: letter portrait; margin: 0.4in; }
                              body { margin: 0; padding: 0; font-size: 90% !important; }
                              * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                              
                              /* Force page breaks */
                              .page-break-before { page-break-before: always !important; break-before: page !important; display: block !important; height: 0 !important; }
                              .page-break-after { page-break-after: always !important; break-after: page !important; display: block !important; height: 0 !important; }
                              
                              /* Ensure content is properly sized for print */
                              #resume-content { height: auto !important; overflow: visible !important; }
                              
                              /* Avoid breaking inside elements */
                              .no-break-inside { page-break-inside: avoid !important; break-inside: avoid !important; }
                              
                              /* Ensure spacers create page breaks */
                              [class*="Spacer-"] { height: 0 !important; page-break-before: always !important; break-before: page !important; display: block !important; }
                              
                              /* Compact print layout */
                              #resume-content * {
                                font-size: 90% !important;
                                margin: 0.1rem 0 !important;
                                padding-top: 0.1rem !important;
                                padding-bottom: 0.1rem !important;
                              }
                              
                              /* Adjust line height for compact text */
                              p, li, div { line-height: 1.3 !important; }
                              
                              /* Make experience entries more compact */
                              .experience-entry { margin-bottom: 0.3rem !important; }
                              
                              /* Reduce spacing between sections */
                              .section-header { margin-bottom: 0.2rem !important; }
                              
                              /* Reduce padding in columns */
                              .left-column, .right-column { padding: 0.3rem !important; }
                            </style>
                            <link rel="stylesheet" href="${window.location.origin}/static/css/main.css">
                            <link rel="stylesheet" href="${window.location.origin}/index.css">
                          </head>
                          <body>
                            ${resumeContent.outerHTML}
                          </body>
                          </html>
                        `);
                        iframe.contentWindow.document.close();
                        
                        // Print the iframe
                        setTimeout(() => {
                          iframe.contentWindow?.focus();
                          iframe.contentWindow?.print();
                          
                          // Remove the iframe after printing
                          iframe.contentWindow?.addEventListener('afterprint', () => {
                            document.body.removeChild(iframe);
                          });
                        }, 500);
                      } else {
                        console.error('Resume content not found');
                        window.print(); // Fallback to regular print
                      }
                    }}
                  >
                    <Print />
                  </IconButton>
                </Tooltip>
              </>
            )}

            <Tooltip title="Filter projects">
              <IconButton color="inherit" onClick={handleFilterMenuOpen}>
                <FilterList />
              </IconButton>
            </Tooltip>
            <Tooltip title="Notifications">
              <IconButton color="inherit">
                <Badge badgeContent={3} color="error">
                  <Notifications />
                </Badge>
              </IconButton>
            </Tooltip>
            <Tooltip title="Account settings">
              <IconButton
                onClick={handleProfileMenuOpen}
                sx={{ p: 0 }}
              >
                <Avatar sx={{ bgcolor: 'primary.dark' }}>MS</Avatar>
              </IconButton>
            </Tooltip>
          </Box>

          {/* Profile Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            onClick={handleMenuClose}
            PaperProps={{
              sx: { mt: 1, minWidth: 200 }
            }}
          >
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="subtitle1">Mike Sloan</Typography>
              <Typography variant="body2" color="text.secondary">mike@example.com</Typography>
            </Box>
            <Divider />
            <MenuItem>
              <AccountCircle sx={{ mr: 2 }} /> Profile
            </MenuItem>
            <MenuItem>
              <Settings sx={{ mr: 2 }} /> Settings
            </MenuItem>
            <Divider />
            <MenuItem>
              <ExitToApp sx={{ mr: 2 }} /> Sign out
            </MenuItem>
          </Menu>

          {/* Filter Menu */}
          <Menu
            anchorEl={filterAnchorEl}
            open={Boolean(filterAnchorEl)}
            onClose={handleMenuClose}
            onClick={handleMenuClose}
            PaperProps={{
              sx: { mt: 1, minWidth: 180 }
            }}
          >
            <MenuItem selected>All Projects</MenuItem>
            <MenuItem>Active Projects</MenuItem>
            <MenuItem>Completed Projects</MenuItem>
            <MenuItem>Archived Projects</MenuItem>
            <Divider />
            <MenuItem>My Projects</MenuItem>
            <MenuItem>Shared with me</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Documentation Drawer */}
      <Drawer
        variant="temporary"
        anchor="right"
        open={isDocumentationOpen}
        onClose={() => setIsDocumentationOpen(false)}
        ModalProps={{
          keepMounted: true
        }}
        sx={{
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            p: 2
          }
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '8px',
            cursor: 'col-resize',
            backgroundColor: isResizing ? 'primary.main' : 'transparent',
            '&:hover': {
              backgroundColor: 'primary.light',
              opacity: 0.3
            }
          }}
          onMouseDown={handleResizeStart}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Documentation</Typography>
          <IconButton onClick={() => setIsDocumentationOpen(false)}>
            <Close />
          </IconButton>
        </Box>
        <Documentation />
      </Drawer>
    </>
  );
};

export default Header;
