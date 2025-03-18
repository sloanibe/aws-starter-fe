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
  Chip,
  Paper,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Stack,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Assignment,
  Add,
  FilterList,
  Notifications,
  People,
} from '@mui/icons-material';
import { useProjectService } from '../services/ServiceFactory';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import { Project, ProjectStatus } from '../models/Project';

const Dashboard: React.FC = () => {
  const projectService = useProjectService();
  const navigate = useNavigate();
  const [isDocumentationOpen, setIsDocumentationOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isNewProjectDialogOpen, setIsNewProjectDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    status: 'ACTIVE' as ProjectStatus,
    color: '#1976d2',
    progress: 0,
    ownerId: 'current-user', // This would come from auth context in a real app
    members: [] as string[],
    tasks: [] as string[]
  });
  const [formErrors, setFormErrors] = useState({
    name: '',
    description: ''
  });

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

  const handleOpenNewProjectDialog = () => {
    setIsNewProjectDialogOpen(true);
  };

  const handleCloseNewProjectDialog = () => {
    setIsNewProjectDialogOpen(false);
    setNewProject({
      name: '',
      description: '',
      status: 'ACTIVE' as ProjectStatus,
      color: '#1976d2',
      progress: 0,
      ownerId: 'current-user',
      members: [],
      tasks: []
    });
    setFormErrors({ name: '', description: '' });
  };

  const validateForm = () => {
    const errors = {
      name: '',
      description: ''
    };
    let isValid = true;

    if (!newProject.name.trim()) {
      errors.name = 'Project name is required';
      isValid = false;
    }

    if (!newProject.description.trim()) {
      errors.description = 'Project description is required';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleCreateProject = async () => {
    if (!validateForm()) return;

    try {
      const createdProject = await projectService.createProject(newProject);
      setProjects([...projects, createdProject]);
      handleCloseNewProjectDialog();
    } catch (error) {
      console.error('Error creating project:', error);
      // You could add error handling UI here
    }
  };

  const handleProjectChange = (field: keyof typeof newProject) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewProject({
      ...newProject,
      [field]: event.target.value
    });
    // Clear error when user starts typing
    if (formErrors[field as keyof typeof formErrors]) {
      setFormErrors({
        ...formErrors,
        [field]: ''
      });
    }
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
                sx={{ 
                  borderRadius: 1, 
                  mb: 0.5,
                  cursor: 'pointer',
                  bgcolor: 'action.selected',
                  '&:hover': {
                    bgcolor: 'action.hover'
                  }
                }}
              >
                <ListItemIcon>
                  <DashboardIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Dashboard" />
              </ListItem>
              <ListItem 
                sx={{ 
                  borderRadius: 1, 
                  mb: 0.5,
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: 'action.hover'
                  }
                }}
              >
                <ListItemIcon>
                  <Assignment />
                </ListItemIcon>
                <ListItemText primary="My Tasks" />
              </ListItem>
              <ListItem 
                component="div"
                sx={{ 
                  borderRadius: 1,
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: 'action.hover'
                  }
                }}
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
                <IconButton size="small" color="primary" onClick={handleOpenNewProjectDialog}>
                  <Add fontSize="small" />
                </IconButton>
              </Box>
              <List>
                {projects.map((project) => (
                  <ListItem 
                    key={project.id}
                    onClick={() => handleProjectClick(project.id)}
                    sx={{ 
                      borderRadius: 1,
                      mb: 0.5,
                      cursor: 'pointer',
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
              <Button 
                variant="contained" 
                startIcon={<Add />} 
                onClick={handleOpenNewProjectDialog}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  boxShadow: 2
                }}
              >
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
              <Grid item xs={12} sm={6} md={4} key={project.id}>
                <Card 
                  onClick={() => handleProjectClick(project.id)}
                  sx={{ 
                    cursor: 'pointer',
                    overflow: 'visible',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 6,
                      transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out'
                    }
                  }}
                >
                  <Box
                    sx={{
                      height: 100,
                      bgcolor: project.color || '#1976d2',
                      borderRadius: '8px 8px 0 0',
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      px: 2,
                      backgroundImage: `linear-gradient(45deg, ${project.color || '#1976d2'}, ${alpha(project.color || '#1976d2', 0.8)})`,
                    }}
                  >
                    <Typography variant="h6" sx={{ color: 'white', flexGrow: 1 }}>
                      {project.name}
                    </Typography>
                    <Chip
                      label={project.status}
                      size="small"
                      sx={{
                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        '& .MuiChip-label': { fontWeight: 500 }
                      }}
                    />
                  </Box>
                  <CardContent sx={{ pt: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                      {project.description}
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          Progress
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {project.progress || 0}%
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={project.progress || 0}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          bgcolor: alpha(project.color || '#1976d2', 0.1),
                          '& .MuiLinearProgress-bar': {
                            bgcolor: project.color || '#1976d2',
                            borderRadius: 3
                          }
                        }}
                      />
                    </Box>
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        pt: 1,
                        borderTop: 1,
                        borderColor: 'divider'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <People sx={{ fontSize: 20, color: 'text.secondary', mr: 0.5 }} />
                        <Typography variant="caption" color="text.secondary">
                          {project.members?.length || 0} Members
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Assignment sx={{ fontSize: 20, color: 'text.secondary', mr: 0.5 }} />
                        <Typography variant="caption" color="text.secondary">
                          {project.tasks?.length || 0} Tasks
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* New Project Dialog */}
        <Dialog 
          open={isNewProjectDialogOpen} 
          onClose={handleCloseNewProjectDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Typography variant="h6" component="div">
              Create New Project
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Fill in the project details below
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <TextField
                label="Project Name"
                fullWidth
                value={newProject.name}
                onChange={handleProjectChange('name')}
                error={!!formErrors.name}
                helperText={formErrors.name}
                placeholder="Enter project name"
              />
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={newProject.description}
                onChange={handleProjectChange('description')}
                error={!!formErrors.description}
                helperText={formErrors.description}
                placeholder="Enter project description"
              />
              <TextField
                label="Status"
                select
                fullWidth
                value={newProject.status}
                onChange={handleProjectChange('status')}
              >
                <MenuItem value="ACTIVE">Active</MenuItem>
                <MenuItem value="COMPLETED">Completed</MenuItem>
                <MenuItem value="ARCHIVED">Archived</MenuItem>
              </TextField>
              <TextField
                label="Project Color"
                type="color"
                fullWidth
                value={newProject.color}
                onChange={handleProjectChange('color')}
                sx={{
                  '& input': {
                    height: 50,
                    padding: 1,
                    width: '100%'
                  }
                }}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button 
              onClick={handleCloseNewProjectDialog}
              variant="outlined"
              sx={{ borderRadius: 2, textTransform: 'none' }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateProject}
              variant="contained"
              sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
            >
              Create Project
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default Dashboard;
