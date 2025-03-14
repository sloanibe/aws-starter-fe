import { Task } from './TaskApp';
import TaskItem from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  onToggleCompletion: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

function TaskList({ tasks, onToggleCompletion, onEdit, onDelete }: TaskListProps) {
  // Group tasks by status
  const tasksByStatus = tasks.reduce<Record<string, Task[]>>((groups, task) => {
    const status = task.status || 'TODO';
    if (!groups[status]) {
      groups[status] = [];
    }
    groups[status].push(task);
    return groups;
  }, {});

  // Sort tasks within each status group by priority
  const priorityOrder: Record<string, number> = { 'HIGH': 0, 'MEDIUM': 1, 'LOW': 2 };
  Object.keys(tasksByStatus).forEach(status => {
    tasksByStatus[status].sort((a, b) => {
      return (priorityOrder[a.priority] || 1) - (priorityOrder[b.priority] || 1);
    });
  });

  // Define the order of status groups
  const statusOrder = ['TODO', 'IN_PROGRESS', 'DONE'];
  
  if (tasks.length === 0) {
    return (
      <div className="no-tasks">
        <p>No tasks found.</p>
        <p className="hint">Create a new task to get started.</p>
      </div>
    );
  }

  return (
    <div className="task-list-container">
      {statusOrder.map(status => {
        const tasksInStatus = tasksByStatus[status] || [];
        if (tasksInStatus.length === 0) return null;
        
        return (
          <div key={status} className={`task-group status-${status.toLowerCase()}`}>
            <div className="task-group-header">
              <h3>{status.replace('_', ' ')}</h3>
              <span className="task-count">{tasksInStatus.length}</span>
            </div>
            <div className="task-list">
              {tasksInStatus.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggleCompletion={onToggleCompletion}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default TaskList;
