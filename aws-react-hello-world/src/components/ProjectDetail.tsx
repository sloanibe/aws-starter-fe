import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMockProjectDetailService } from '../services/mock/MockProjectDetailService.old';
import { ProjectDetail as ProjectDetailModel, Activity } from '../models/ProjectDetail';
import { DropResult } from 'react-beautiful-dnd';
import {
  Box, Typography, Avatar, Chip, Paper, Tabs, Tab, IconButton,
  Button, AvatarGroup, Divider, List, ListItem, ListItemText,
  ListItemAvatar, Card, CardContent, Grid, LinearProgress, Toolbar
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
  const { getProjectDetails } = useMockProjectDetailService();
  const project: ProjectDetailModel | undefined = getProjectDetails(projectId);
  const [selectedTab, setSelectedTab] = useState(0);
  const [isDocumentationOpen, setIsDocumentationOpen] = useState(false);

  const handleToggleDocumentation = () => {
    setIsDocumentationOpen(!isDocumentationOpen);
  };

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
            <Typography variant="h6" gutterBottom>Project Overview</Typography>
            <Typography variant="body1" paragraph>{project.description}</Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Recent Activity</Typography>
                    <List>
                      {project.activities.slice(0, 5).map((activity: Activity, index: number) => (
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
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Project Stats</Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Progress</Typography>
                      <LinearProgress
                        variant="determinate"
                        value={project.progress}
                        sx={{ mt: 1, mb: 1 }}
                      />
                      <Typography variant="body2">{project.progress}% Complete</Typography>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">Tasks</Typography>
                      <Typography variant="body2">{project.tasks.length}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">Team Members</Typography>
                      <Typography variant="body2">{project.members.length}</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
              </Box>
            )}

            {selectedTab === 1 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6">Tasks</Typography>
              <Button startIcon={<Add />} variant="contained">Add Task</Button>
            </Box>

            <DragDropContext onDragEnd={onDragEnd}>
              <Box sx={{ display: 'flex', gap: 3 }}>
                {statusColumns.map((status) => (
                  <Droppable droppableId={status} key={status}>
                    {(provided) => (
                      <Paper
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        sx={{
                          p: 2,
                          width: 300,
                          minHeight: '500px',
                          bgcolor: 'background.paper',
                          borderRadius: 2
                        }}
                      >
                        <Box sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          mb: 2
                        }}>
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{status}</Typography>
                          <Typography variant="caption" sx={{
                            bgcolor: 'action.hover',
                            px: 1,
                            py: 0.5,
                            borderRadius: 1
                          }}>
                            {project.tasks.filter(t => t.status === status).length}
                          </Typography>
                        </Box>

                        {project.tasks
                          .filter((task) => task.status === status)
                          .map((task, index) => (
                            <Draggable key={task.id} draggableId={task.id} index={index}>
                              {(provided) => (
                                <Paper
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  ref={provided.innerRef}
                                  sx={{
                                    p: 2,
                                    mb: 2,
                                    borderRadius: 2,
                                    boxShadow: 1,
                                    '&:hover': {
                                      boxShadow: 2,
                                      cursor: 'grab'
                                    }
                                  }}
                                >
                                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <Avatar
                                      sx={{
                                        width: 24,
                                        height: 24,
                                        mr: 1,
                                        bgcolor: task.priority === 'High' ? 'error.main' : 'primary.main'
                                      }}
                                    >
                                      {task.assignee?.charAt(0)}
                                    </Avatar>
                                    <Typography
                                      variant="subtitle2"
                                      sx={{
                                        fontWeight: 'medium',
                                        flexGrow: 1
                                      }}
                                    >
                                      {task.name}
                                    </Typography>
                                  </Box>

                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ mb: 2 }}
                                  >
                                    {task.description}
                                  </Typography>

                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Chip
                                      label={task.priority}
                                      size="small"
                                      color={task.priority === 'High' ? 'error' : 'default'}
                                      icon={<Flag />}
                                    />
                                    <Box sx={{ flexGrow: 1 }} />
                                    <IconButton size="small">
                                      <Comment fontSize="small" />
                                    </IconButton>
                                    <Typography variant="caption" sx={{
                                      color: 'text.secondary',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 0.5
                                    }}>
                                      <AccessTime fontSize="small" />
                                      {new Date(task.dueDate).toLocaleDateString()}
                                    </Typography>
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
