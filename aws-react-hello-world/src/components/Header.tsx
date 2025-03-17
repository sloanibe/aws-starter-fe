import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar, Toolbar, IconButton, Avatar, Typography, Box,
  InputBase, Menu, MenuItem, Divider, Badge, Tooltip,
  Button, Drawer
} from '@mui/material';
import {
  Notifications, Search, AccountCircle, Settings,
  ExitToApp, FilterList, MenuBook, Close
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
