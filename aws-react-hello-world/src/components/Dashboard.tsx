import React, { useState } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Button,
  Typography,
  Toolbar,
  IconButton,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Assignment,
  Add,
  FilterList,
  Notifications,
} from '@mui/icons-material';
import { useMockProjectService } from '../services/mock/MockProjectService';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import { Project, ProjectStatus } from '../models/Project';

const Dashboard: React.FC = () => {
  const projectService = useMockProjectService();
  const navigate = useNavigate();
  const [isDocumentationOpen, setIsDocumentationOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);

  React.useEffect(() => {
    console.log('Fetching projects...');
    projectService.getAllProjects().then(data => {
      console.log('Fetched projects:', data);
      setProjects(data || []);
    }).catch(error => {
      console.error('Error fetching projects:', error);
      setProjects([]);
    });
  }, [projectService]);

  const handleProjectClick = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  const handleToggleDocumentation = () => {
    setIsDocumentationOpen(!isDocumentationOpen);
  };

  const getStatusColor = (status: ProjectStatus): string => {
    switch (status) {
      case 'ACTIVE':
        return 'success.main';
      case 'COMPLETED':
        return 'info.main';
      case 'ARCHIVED':
        return 'text.disabled';
      default:
        return 'text.disabled';
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <Header 
        onToggleDocumentation={handleToggleDocumentation}
        isDocumentationOpen={isDocumentationOpen}
      />

      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Side Navigation */}
        <Drawer
          variant="permanent"
          sx={{
            width: 240,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: 240,
              boxSizing: 'border-box',
              bgcolor: 'background.paper',
              boxShadow: 1,
            },
          }}
        >
          <Toolbar />
          <Box sx={{ overflow: 'auto', p: 2 }}>
            <Typography variant="overline" sx={{ color: 'text.secondary', px: 2 }}>
              NAVIGATION
            </Typography>
            <List>
              <ListItem 
                button
                selected
                sx={{ borderRadius: 1, mb: 0.5 }}
              >
                <ListItemIcon>
                  <DashboardIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Dashboard" />
              </ListItem>
              <ListItem 
                button
                sx={{ borderRadius: 1, mb: 0.5 }}
              >
                <ListItemIcon>
                  <Assignment />
                </ListItemIcon>
                <ListItemText primary="My Tasks" />
              </ListItem>
              <ListItem 
                button
                sx={{ borderRadius: 1 }}
              >
                <ListItemIcon>
                  <Notifications />
                </ListItemIcon>
                <ListItemText primary="Notifications" />
              </ListItem>
            </List>

            <Box sx={{ mt: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, mb: 1 }}>
                <Typography variant="overline" sx={{ color: 'text.secondary' }}>
                  PROJECTS
                </Typography>
                <IconButton size="small" color="primary">
                  <Add fontSize="small" />
                </IconButton>
              </Box>
              <List>
                {projects.map((project) => (
                  <ListItem 
                    key={project.id}
                    button
                    onClick={() => handleProjectClick(project.id)}
                    sx={{ 
                      borderRadius: 1,
                      mb: 0.5,
                      '&:hover': {
                        bgcolor: 'action.hover'
                      }
                    }}
                  >
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: 1,
                        bgcolor: project.color,
                        mr: 2
                      }}
                    />
                    <ListItemText 
                      primary={project.name}
                      secondary={`${project.tasks.length} tasks`}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Box>
        </Drawer>

        {/* Main Content */}
        <Box component="main" sx={{ flexGrow: 1, p: 3, overflow: 'auto' }}>
          <Toolbar />
          
          {/* Page Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4">Dashboard</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button variant="outlined" startIcon={<FilterList />}>
                Filter
              </Button>
              <Button variant="contained" startIcon={<Add />}>
                New Project
              </Button>
            </Box>
          </Box>

          {/* Project Statistics */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Total Projects
                  </Typography>
                  <Typography variant="h4">
                    {projects.length}
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={70} 
                    sx={{ mt: 2 }} 
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Active Projects
                  </Typography>
                  <Typography variant="h4">
                    {projects.filter(p => p.status === 'ACTIVE').length}
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={50} 
                    sx={{ mt: 2 }} 
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Completed Projects
                  </Typography>
                  <Typography variant="h4">
                    {projects.filter(p => p.status === 'COMPLETED').length}
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={30} 
                    sx={{ mt: 2 }} 
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Archived Projects
                  </Typography>
                  <Typography variant="h4">
                    {projects.filter(p => p.status === 'ARCHIVED').length}
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={20} 
                    sx={{ mt: 2 }} 
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Project Grid */}
          <Grid container spacing={3}>
            {projects.map((project) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={project.id}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': { 
                      transform: 'translateY(-4px)',
                      boxShadow: 3 
                    },
                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out'
                  }}
                  onClick={() => handleProjectClick(project.id)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: 1,
                          bgcolor: project.color,
                          mr: 2
                        }}
                      />
                      <Typography variant="h6" noWrap>
                        {project.name}
                      </Typography>
                    </Box>
                    <Typography 
                      color="text.secondary" 
                      sx={{ 
                        mb: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        height: '40px'
                      }}
                    >
                      {project.description}
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Progress
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={project.progress} 
                        sx={{ 
                          mt: 1,
                          height: 6,
                          borderRadius: 1
                        }} 
                      />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        {project.tasks.length} tasks
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: 'white',
                          bgcolor: getStatusColor(project.status),
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          fontSize: '0.75rem'
                        }}
                      >
                        {project.status}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
