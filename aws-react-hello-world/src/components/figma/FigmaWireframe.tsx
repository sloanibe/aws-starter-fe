import React from 'react';
import {
  AppBar, Toolbar, IconButton, Typography, Box, Card, CardContent, 
  CardMedia, Button, List, ListItem, ListItemText, ListItemIcon,
  Divider, Paper, Avatar, Container, Fab
} from '@mui/material';
import {
  Menu, ArrowBack, Bookmark, MoreVert, PlayArrow, Pause, 
  NavigateNext, FiberManualRecord, Add
} from '@mui/icons-material';

const FigmaWireframe = () => {
  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Left Navigation Panel */}
      <Box sx={{ 
        width: 80, 
        backgroundColor: '#f8f9fa',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pt: 2,
        boxShadow: '0px 0px 10px rgba(0,0,0,0.1)'
      }}>
        {/* Add Button */}
        <Fab 
          size="small" 
          color="primary" 
          aria-label="add"
          sx={{ mb: 3, bgcolor: '#f8f9fa', color: '#000', boxShadow: 'none' }}
        >
          <Add />
        </Fab>
        
        {/* Navigation Items */}
        {[1, 2, 3, 4].map((item) => (
          <Box 
            key={item}
            sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              mb: 3
            }}
          >
            <IconButton 
              sx={{ 
                bgcolor: '#e0e0e0', 
                mb: 1,
                '&:hover': { bgcolor: '#d5d5d5' }
              }}
            >
              <FiberManualRecord sx={{ fontSize: 16 }} />
            </IconButton>
            <Typography variant="caption" color="textSecondary">
              Label
            </Typography>
          </Box>
        ))}
      </Box>
      
      {/* Main Content */}
      <Container maxWidth="sm" disableGutters sx={{ flexGrow: 1 }}>
      {/* App Bar */}
      <AppBar position="static" color="default" elevation={0}>
        <Toolbar>
          <IconButton edge="start" color="inherit">
            <Menu />
          </IconButton>
          <IconButton color="inherit">
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" style={{ flexGrow: 1 }}>
            Title
          </Typography>
          <IconButton color="inherit">
            <Bookmark />
          </IconButton>
          <IconButton color="inherit">
            <MoreVert />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box p={2}>
        {/* Featured Article */}
        <Card elevation={0} style={{ marginBottom: 24 }}>
          <Box display="flex">
            <CardMedia
              style={{ 
                width: 150, 
                height: 150, 
                backgroundColor: '#e0e0e0',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <Box 
                width={40} 
                height={40} 
                bgcolor="grey.400" 
                style={{ transform: 'rotate(45deg)' }} 
              />
              <Box display="flex" mt={2}>
                <Box width={30} height={30} bgcolor="grey.400" mr={1} />
                <Box width={30} height={30} bgcolor="grey.400" borderRadius="50%" />
              </Box>
            </CardMedia>
            <CardContent>
              <Typography variant="h5" component="h2">
                Headline
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Published date
              </Typography>
              <Typography variant="body2" component="p">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                incididunt ut labore et dolore magna aliqua.
              </Typography>
            </CardContent>
          </Box>
          <Box px={2} pb={2}>
            <Typography variant="body2" component="p">
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat
              nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui
              officia deserunt mollit anim id est laborum.
            </Typography>
            <Box mt={2} display="flex" justifyContent="center">
              <Button variant="contained" color="primary" style={{ backgroundColor: '#673ab7' }}>
                Download
              </Button>
            </Box>
          </Box>
        </Card>

        {/* Section Title */}
        <Box display="flex" alignItems="center" mb={2}>
          <Typography variant="h6" component="h2" style={{ flexGrow: 1 }}>
            Section title
          </Typography>
          <NavigateNext />
        </Box>

        {/* List Item */}
        <Card elevation={0} style={{ marginBottom: 16 }}>
          <Box display="flex">
            <CardMedia
              style={{ 
                width: 80, 
                height: 80, 
                backgroundColor: '#e0e0e0',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <Box 
                width={20} 
                height={20} 
                bgcolor="grey.400" 
                style={{ transform: 'rotate(45deg)' }} 
              />
              <Box display="flex" mt={1}>
                <Box width={15} height={15} bgcolor="grey.400" mr={1} />
                <Box width={15} height={15} bgcolor="grey.400" borderRadius="50%" />
              </Box>
            </CardMedia>
            <CardContent>
              <Typography variant="subtitle1">
                Title
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Description duis aute irure dolor in reprehenderit in voluptate velit.
              </Typography>
              <Box display="flex" alignItems="center" mt={1}>
                <FiberManualRecord style={{ fontSize: 12, marginRight: 4 }} />
                <Typography variant="caption" color="textSecondary">
                  Today • 00:00
                </Typography>
              </Box>
            </CardContent>
          </Box>
        </Card>
      </Box>

      {/* Player Bar */}
      <Paper 
        elevation={4} 
        style={{ 
          position: 'fixed', 
          bottom: 0, 
          width: '100%', 
          maxWidth: 600,
          display: 'flex',
          alignItems: 'center',
          padding: 8
        }}
      >
        <Box 
          display="flex" 
          alignItems="center" 
          justifyContent="center" 
          mr={2}
          width={40}
          height={40}
          bgcolor="grey.300"
        >
          <Box width={10} height={10} bgcolor="grey.500" mr={0.5} />
          <Box width={10} height={10} bgcolor="grey.500" style={{ transform: 'rotate(45deg)' }} mr={0.5} />
          <Box width={10} height={10} bgcolor="grey.500" borderRadius="50%" />
        </Box>
        <Box flexGrow={1}>
          <Typography variant="subtitle2">Title</Typography>
          <Typography variant="caption" color="textSecondary">Artist</Typography>
        </Box>
        <IconButton size="small">
          <Pause />
        </IconButton>
        <IconButton size="small">
          <PlayArrow />
        </IconButton>
      </Paper>
    </Container>
    </Box>
  );
};

export default FigmaWireframe;
