import { useState, useEffect } from 'react';
import TaskList from './TaskList';
import TaskForm from './TaskForm';
import TaskFilter from './TaskFilter';

// Define the Task interface to match the backend model
export interface Task {
  id: string;
  title: string;
  description: string;
  status: string; // "TODO", "IN_PROGRESS", "DONE"
  priority: string; // "HIGH", "MEDIUM", "LOW"
  dueDate: string | null;
  category: string | null;
  createdAt: string;
  updatedAt: string;
  completed: boolean;
}

// Define filter state interface
export interface TaskFilters {
  status: string | null;
  priority: string | null;
  category: string | null;
  searchQuery: string;
}

// API base URL
const API_BASE_URL = 'https://api.sloandev.net';

function TaskApp() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TaskFilters>({
    status: null,
    priority: null,
    category: null,
    searchQuery: '',
  });
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Fetch tasks on component mount
  useEffect(() => {
    fetchTasks();
  }, []);

  // Fetch all tasks from the API
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks`);
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      const data = await response.json();
      setTasks(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError('Failed to load tasks. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Create a new task
  const createTask = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(task),
      });

      if (!response.ok) {
        throw new Error('Failed to create task');
      }

      const newTask = await response.json();
      setTasks([...tasks, newTask]);
      setShowForm(false);
      setError(null);
    } catch (error) {
      console.error('Error creating task:', error);
      setError('Failed to create task. Please try again.');
    }
  };

  // Update an existing task
  const updateTask = async (id: string, taskUpdate: Partial<Task>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskUpdate),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      const updatedTask = await response.json();
      setTasks(tasks.map(task => task.id === id ? updatedTask : task));
      setEditingTask(null);
      setShowForm(false);
      setError(null);
    } catch (error) {
      console.error('Error updating task:', error);
      setError('Failed to update task. Please try again.');
    }
  };

  // Delete a task
  const deleteTask = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      setTasks(tasks.filter(task => task.id !== id));
      setError(null);
    } catch (error) {
      console.error('Error deleting task:', error);
      setError('Failed to delete task. Please try again.');
    }
  };

  // Toggle task completion status
  const toggleTaskCompletion = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks/${id}/toggle`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error('Failed to toggle task completion');
      }

      const updatedTask = await response.json();
      setTasks(tasks.map(task => task.id === id ? updatedTask : task));
      setError(null);
    } catch (error) {
      console.error('Error toggling task completion:', error);
      setError('Failed to update task status. Please try again.');
    }
  };

  // Apply filters to tasks
  const filteredTasks = tasks.filter(task => {
    // Filter by status if a status filter is selected
    if (filters.status && task.status !== filters.status) {
      return false;
    }
    
    // Filter by priority if a priority filter is selected
    if (filters.priority && task.priority !== filters.priority) {
      return false;
    }
    
    // Filter by category if a category filter is selected
    if (filters.category && task.category !== filters.category) {
      return false;
    }
    
    // Filter by search query if one is provided
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      return (
        task.title.toLowerCase().includes(query) ||
        (task.description && task.description.toLowerCase().includes(query))
      );
    }
    
    return true;
  });

  // Handle editing a task
  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  // Handle canceling the form
  const handleCancelForm = () => {
    setEditingTask(null);
    setShowForm(false);
  };

  return (
    <div className="task-app">
      <div className="task-app-header">
        <h2>Task Management</h2>
        <button 
          className="new-task-button"
          onClick={() => {
            setEditingTask(null);
            setShowForm(true);
          }}
        >
          New Task
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <TaskFilter 
        filters={filters} 
        setFilters={setFilters} 
        categories={Array.from(new Set(tasks.map(task => task.category).filter(Boolean) as string[]))}
      />

      {showForm && (
        <TaskForm 
          onSubmit={editingTask ? 
            (taskData: Partial<Task>) => updateTask(editingTask.id, taskData) : 
            createTask
          }
          onCancel={handleCancelForm}
          initialData={editingTask || undefined}
        />
      )}

      {loading ? (
        <div className="loading">Loading tasks...</div>
      ) : (
        <TaskList 
          tasks={filteredTasks} 
          onToggleCompletion={toggleTaskCompletion}
          onEdit={handleEditTask}
          onDelete={deleteTask}
        />
      )}
    </div>
  );
}

export default TaskApp;
