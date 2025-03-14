import { Task } from './TaskApp';

// Material UI imports
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';

// Material UI icons
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface TaskItemProps {
  task: Task;
  onToggleCompletion: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}



function TaskItem({ task, onToggleCompletion, onEdit, onDelete }: TaskItemProps) {
  // Format the due date if it exists
  const formattedDueDate = task.dueDate 
    ? new Date(task.dueDate).toLocaleDateString() 
    : 'No due date';

  // Determine if task is overdue
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Get status color
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'TODO': return 'info';
      case 'IN_PROGRESS': return 'warning';
      case 'DONE': return 'success';
      default: return 'default';
    }
  };
  
  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'HIGH': return 'error';
      case 'MEDIUM': return 'warning';
      case 'LOW': return 'success';
      default: return 'default';
    }
  };

  return (
    <Card sx={{ 
      position: 'relative', 
      mb: 2, 
      borderLeft: '8px solid transparent',
      borderColor: 
        task.priority === 'HIGH' ? 'error.main' : 
        task.priority === 'MEDIUM' ? 'warning.main' : 
        'success.main',
      opacity: task.completed ? 0.8 : 1,
      boxShadow: isOverdue ? '0 0 0 2px rgba(211, 47, 47, 0.3)' : undefined,
    }}>
      <CardContent sx={{ p: 2 }}>
        {/* Task Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Checkbox 
              checked={task.completed}
              onChange={() => onToggleCompletion(task.id)}
              sx={{ ml: -1, mr: 1 }}
            />
            <Typography 
              variant="h6" 
              component="h3" 
              sx={{ 
                textDecoration: task.completed ? 'line-through' : 'none',
                color: task.completed ? 'text.secondary' : 'text.primary',
                fontWeight: 500,
                fontSize: '1.1rem'
              }}
            >
              {task.title}
            </Typography>
          </Box>
          
          <Box>
            <IconButton 
              size="small" 
              onClick={() => onEdit(task)} 
              aria-label="Edit task"
              sx={{ mr: 0.5 }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton 
              size="small" 
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this task?')) {
                  onDelete(task.id);
                }
              }} 
              aria-label="Delete task"
              color="error"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
        
        {/* Task Metadata */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
          <Chip 
            label={task.status.replace('_', ' ')} 
            size="small" 
            color={getStatusColor(task.status) as any}
            variant="outlined"
          />
          <Chip 
            label={task.priority} 
            size="small" 
            color={getPriorityColor(task.priority) as any}
            variant="outlined"
          />
          {task.category && (
            <Chip 
              label={task.category} 
              size="small" 
              color="default"
              variant="outlined"
            />
          )}
          <Chip 
            label={formattedDueDate}
            size="small" 
            color={isOverdue ? 'error' : 'default'}
            variant="outlined"
            icon={isOverdue ? undefined : undefined}
            sx={isOverdue ? { borderColor: 'error.main' } : undefined}
          />
        </Box>
        
        {/* Task Description */}
        {task.description && (
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ 
              mb: 1.5,
              backgroundColor: 'rgba(0, 0, 0, 0.03)',
              p: 1.5,
              borderRadius: 1,
              whiteSpace: 'pre-wrap'
            }}
          >
            {task.description}
          </Typography>
        )}
        
        {/* Task Timestamps */}
        <Divider sx={{ my: 1 }} />
        <Grid container spacing={1} sx={{ mt: 0.5, color: 'text.secondary', fontSize: '0.75rem' }}>
          <Grid item xs={6}>
            <Typography variant="caption" title={formatDate(task.createdAt)}>
              Created: {new Date(task.createdAt).toLocaleDateString()}
            </Typography>
          </Grid>
          <Grid item xs={6} sx={{ textAlign: 'right' }}>
            <Typography variant="caption" title={formatDate(task.updatedAt)}>
              Updated: {new Date(task.updatedAt).toLocaleDateString()}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

export default TaskItem;
