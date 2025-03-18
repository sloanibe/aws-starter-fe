import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjectDetailService } from '../services/ServiceFactory';
import { ProjectDetail as ProjectDetailModel, Activity } from '../models/ProjectDetail';
import { DropResult } from 'react-beautiful-dnd';
import {
  Box, Typography, Avatar, Chip, Paper, Tabs, Tab, IconButton,
  Button, AvatarGroup, Divider, List, ListItem, ListItemText,
  ListItemAvatar, Card, CardContent, Grid, LinearProgress, Toolbar,
  CircularProgress
} from '@mui/material';
import {
  ArrowBack, Add, Edit, Delete, Flag, Comment,
  AccessTime, People
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import Header from './Header';

const statusColumns = ['To Do', 'In Progress', 'Done'];

const ProjectDetailComponent: React.FC = () => {
  const navigate = useNavigate();
  const projectId = useParams<{ projectId: string }>().projectId || '';
  const { getProjectDetails } = useProjectDetailService();
  const [project, setProject] = useState<ProjectDetailModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        console.log('Fetching project details for ID:', projectId);
        const data = await getProjectDetails(projectId);
        console.log('Received project data:', data);
        if (!data) {
          setError('Project not found');
          return;
        }
        setProject(data);
      } catch (err) {
        setError('Failed to load project details');
        console.error('Error fetching project details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [projectId, getProjectDetails]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [isDocumentationOpen, setIsDocumentationOpen] = useState(false);

  const handleToggleDocumentation = () => {
    setIsDocumentationOpen(!isDocumentationOpen);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <Header
          onToggleDocumentation={handleToggleDocumentation}
          isDocumentationOpen={isDocumentationOpen}
        />
        <Box sx={{ p: 3, mt: 8, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <Header
          onToggleDocumentation={handleToggleDocumentation}
          isDocumentationOpen={isDocumentationOpen}
        />
        <Box sx={{ p: 3, mt: 8 }}>
          <Button startIcon={<ArrowBack />} onClick={() => navigate('/')} sx={{ mb: 2 }}>
            Back to Dashboard
          </Button>
          <Typography color="error">{error}</Typography>
        </Box>
      </Box>
    );
  }

  if (!project) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <Header
          onToggleDocumentation={handleToggleDocumentation}
          isDocumentationOpen={isDocumentationOpen}
        />
        <Box sx={{ p: 3, mt: 8 }}>
          <Button startIcon={<ArrowBack />} onClick={() => navigate('/')} sx={{ mb: 2 }}>
            Back to Dashboard
          </Button>
          <Typography variant="h5">Project not found</Typography>
        </Box>
      </Box>
    );
  }

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const onDragEnd = (result: DropResult) => {
    // Handle drag and drop logic here
    console.log('Task moved:', result);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <Header
        onToggleDocumentation={handleToggleDocumentation}
        isDocumentationOpen={isDocumentationOpen}
      />
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Box sx={{ flexGrow: 1, p: 3, overflow: 'auto' }}>
          <Toolbar />
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <IconButton onClick={() => navigate('/')} sx={{ mr: 2 }}>
              <ArrowBack />
            </IconButton>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h4" sx={{ mb: 1 }}>{project.name}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Chip
                  label={project.status}
                  color={project.status === 'ACTIVE' ? 'success' : 'default'}
                  size="small"
                />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <People fontSize="small" />
                  <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 24, height: 24, fontSize: '0.875rem' } }}>
                    {project.members.map((member: string, index: number) => (
                      <Avatar key={index} sx={{ bgcolor: `primary.${index % 2 ? 'light' : 'main'}` }}>
                        {member.charAt(0)}
                      </Avatar>
                    ))}
                  </AvatarGroup>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <AccessTime fontSize="small" />
                  Last updated: {new Date(project.updatedAt).toLocaleDateString()}
                </Typography>
              </Box>
            </Box>
            <Box sx={{
              display: 'flex',
              gap: { xs: 0.5, sm: 1 },
              flexWrap: { xs: 'wrap', sm: 'nowrap' },
              '& .MuiButton-root': {
                minWidth: { xs: '100%', sm: 'auto' }
              }
            }}>
              <Button startIcon={<Edit />} variant="outlined">
                Edit
              </Button>
              <Button startIcon={<Delete />} variant="outlined" color="error">
                Delete
              </Button>
            </Box>
          </Box>

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={selectedTab} onChange={handleTabChange}>
              <Tab label="Overview" />
              <Tab label="Tasks" />
              <Tab label="Team" />
              <Tab label="Activity" />
            </Tabs>
          </Box>

          {/* Tab Content */}
          <Box sx={{ mt: 2 }}>
            {selectedTab === 0 && (
              <Box>
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Project Overview</Typography>
                    <Typography variant="body1" sx={{ mb: 3 }}>{project.description}</Typography>
                    
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" gutterBottom>Project Progress</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ flexGrow: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={project.progress}
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {project.progress}%
                        </Typography>
                      </Box>
                    </Box>

                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <Paper sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="h4" sx={{ mb: 1, color: 'primary.main' }}>
                            {project.tasks.length}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Total Tasks
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Paper sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="h4" sx={{ mb: 1, color: 'primary.main' }}>
                            {project.members.length}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Team Members
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Recent Activity</Typography>
                    {project.activities.length > 0 ? (
                      <List>
                        {project.activities.slice(0, 5).map((activity: Activity, index: number) => (
                          <ListItem key={index} alignItems="flex-start">
                            <ListItemAvatar>
                              <Avatar sx={{ bgcolor: `primary.${index % 2 ? 'light' : 'main'}` }}>
                                {activity.user.charAt(0)}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={activity.action}
                              secondary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <Typography component="span" variant="body2" color="text.primary">
                                    {activity.user}
                                  </Typography>
                                  <Typography component="span" variant="body2" color="text.secondary">
                                    — {new Date(activity.timestamp).toLocaleString()}
                                  </Typography>
                                </Box>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                          No recent activity
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Box>
            )}

            {selectedTab === 1 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box>
                <Typography variant="h6" sx={{ mb: 0.5 }}>Tasks Board</Typography>
                <Typography variant="body2" color="text.secondary">
                  {project?.tasks?.length || 0} tasks in total
                </Typography>
              </Box>
              <Button 
                startIcon={<Add />} 
                variant="contained" 
                sx={{ 
                  borderRadius: 2,
                  textTransform: 'none',
                  boxShadow: 2
                }}
              >
                Add Task
              </Button>
            </Box>

            {!project?.tasks?.length ? (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                py: 8,
                bgcolor: 'background.paper',
                borderRadius: 2,
                border: 1,
                borderColor: 'divider'
              }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No tasks yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Get started by adding your first task using the button above
                </Typography>
              </Box>
            ) : (
              <DragDropContext onDragEnd={onDragEnd}>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    gap: 3,
                    overflowX: 'auto',
                    pb: 2,
                    '&::-webkit-scrollbar': {
                      height: 8,
                    },
                    '&::-webkit-scrollbar-track': {
                      backgroundColor: 'background.paper',
                      borderRadius: 4,
                    },
                    '&::-webkit-scrollbar-thumb': {
                      backgroundColor: 'grey.300',
                      borderRadius: 4,
                      '&:hover': {
                        backgroundColor: 'grey.400',
                      },
                    },
                  }}
                >
                  {statusColumns.map((status) => (
                    <Droppable droppableId={status} key={status}>
                      {(provided, snapshot) => (
                        <Paper
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          elevation={0}
                          sx={{
                            p: 2,
                            width: 320,
                            minWidth: 320,
                            minHeight: '500px',
                            bgcolor: snapshot.isDraggingOver ? 'grey.50' : 'background.default',
                            borderRadius: 3,
                            border: 1,
                            borderColor: 'divider',
                            transition: 'background-color 0.2s ease'
                          }}
                        >
                          <Box sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: 2
                          }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box
                                sx={{
                                  width: 3,
                                  height: 24,
                                  borderRadius: 1,
                                  bgcolor: status === 'To Do' ? 'info.main' : 
                                          status === 'In Progress' ? 'warning.main' : 'success.main'
                                }}
                              />
                              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                {status}
                              </Typography>
                            </Box>
                            <Chip
                              label={project?.tasks?.filter(t => t.status === status)?.length || 0}
                              size="small"
                              sx={{
                                bgcolor: 'background.paper',
                                fontWeight: 600,
                                '& .MuiChip-label': { px: 2 }
                              }}
                            />
                          </Box>

                        {project?.tasks
                          ?.filter((task) => task.status === status)
                          ?.map((task, index) => (
                            <Draggable key={task.id} draggableId={task.id} index={index}>
                              {(provided, snapshot) => (
                                <Paper
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  ref={provided.innerRef}
                                  elevation={snapshot.isDragging ? 8 : 1}
                                  sx={{
                                    p: 2,
                                    mb: 2,
                                    borderRadius: 2,
                                    bgcolor: 'background.paper',
                                    border: 1,
                                    borderColor: snapshot.isDragging ? 'primary.main' : 'transparent',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                      transform: 'translateY(-2px)',
                                      boxShadow: 4,
                                      cursor: 'grab'
                                    }
                                  }}
                                >
                                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                                    <Avatar
                                      sx={{
                                        width: 28,
                                        height: 28,
                                        mr: 1.5,
                                        bgcolor: task.priority === 'High' ? 'error.light' : 
                                                task.priority === 'Medium' ? 'warning.light' : 'success.light',
                                        color: task.priority === 'High' ? 'error.dark' : 
                                               task.priority === 'Medium' ? 'warning.dark' : 'success.dark',
                                        fontSize: '0.875rem',
                                        fontWeight: 600
                                      }}
                                    >
                                      {task.assignee?.charAt(0)}
                                    </Avatar>
                                    <Typography
                                      variant="subtitle2"
                                      sx={{
                                        fontWeight: 600,
                                        color: 'text.primary',
                                        flexGrow: 1
                                      }}
                                    >
                                      {task.name}
                                    </Typography>
                                  </Box>

                                  <Typography
                                    variant="body2"
                                    sx={{ 
                                      mb: 2,
                                      color: 'text.secondary',
                                      display: '-webkit-box',
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: 'vertical',
                                      overflow: 'hidden'
                                    }}
                                  >
                                    {task.description}
                                  </Typography>

                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Chip
                                      label={task.priority}
                                      size="small"
                                      icon={<Flag sx={{ fontSize: '0.875rem !important' }} />}
                                      sx={{
                                        bgcolor: task.priority === 'High' ? 'error.50' : 
                                                task.priority === 'Medium' ? 'warning.50' : 'success.50',
                                        color: task.priority === 'High' ? 'error.700' : 
                                               task.priority === 'Medium' ? 'warning.700' : 'success.700',
                                        '& .MuiChip-icon': {
                                          color: 'inherit'
                                        },
                                        fontWeight: 500
                                      }}
                                    />
                                    <Box sx={{ flexGrow: 1 }} />
                                    {task.dueDate && (
                                      <Chip
                                        icon={<AccessTime fontSize="small" />}
                                        label={new Date(task.dueDate).toLocaleDateString()}
                                        size="small"
                                        sx={{ 
                                          bgcolor: 'grey.50',
                                          color: 'text.secondary'
                                        }}
                                      />
                                    )}
                                    <IconButton 
                                      size="small" 
                                      sx={{ 
                                        color: 'text.secondary',
                                        '&:hover': { color: 'primary.main' }
                                      }}
                                    >
                                      <Comment sx={{ fontSize: '1.25rem' }} />
                                    </IconButton>
                                  </Box>
                                </Paper>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </Paper>
                      )}
                    </Droppable>
                  ))}
                </Box>
              </DragDropContext>
            )}
          </Box>
        )}

        {selectedTab === 2 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6">Team Members</Typography>
              <Button startIcon={<Add />} variant="contained">Add Member</Button>
            </Box>

            <List>
              {project.members.map((member: string, index: number) => (
                <ListItem
                  key={index}
                  secondaryAction={
                    <IconButton edge="end" aria-label="delete">
                      <Delete />
                    </IconButton>
                  }
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: `primary.${index % 2 ? 'light' : 'main'}` }}>
                      {member.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={member}
                    secondary={index === 0 ? 'Project Owner' : 'Team Member'}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {selectedTab === 3 && (
          <Box>
            <Typography variant="h6" gutterBottom>Activity Feed</Typography>
            <List>
              {project.activities.map((activity: Activity, index: number) => (
                <ListItem key={index} alignItems="flex-start">
                  <ListItemAvatar>
                    <Avatar>{activity.user.charAt(0)}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={activity.action}
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="text.primary">
                          {activity.user}
                        </Typography>
                        {' — '}{new Date(activity.timestamp).toLocaleString()}
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ProjectDetailComponent;
