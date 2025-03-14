# API Integration

This document describes how to integrate with the backend APIs in the frontend React application, focusing on the task tracking system.

## API Client Setup

For making HTTP requests to the backend API, we use Axios. Here's a basic setup for the API client:

```typescript
// src/api/apiClient.ts
import axios from 'axios';

// Determine the base URL based on environment
const getBaseUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return 'https://api.sloandev.net';
  }
  return 'http://localhost:8080';
};

const apiClient = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
```

## Task API Service

A dedicated service for task-related API calls:

```typescript
// src/api/taskService.ts
import apiClient from './apiClient';
import { Task } from '../types/Task';

export const TaskService = {
  // Get all tasks
  getAllTasks: async (): Promise<Task[]> => {
    const response = await apiClient.get('/api/tasks');
    return response.data;
  },

  // Get task by ID
  getTaskById: async (id: string): Promise<Task> => {
    const response = await apiClient.get(`/api/tasks/${id}`);
    return response.data;
  },

  // Create a new task
  createTask: async (task: Omit<Task, 'id'>): Promise<Task> => {
    const response = await apiClient.post('/api/tasks', task);
    return response.data;
  },

  // Update an existing task
  updateTask: async (id: string, task: Partial<Task>): Promise<Task> => {
    const response = await apiClient.put(`/api/tasks/${id}`, task);
    return response.data;
  },

  // Delete a task
  deleteTask: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/tasks/${id}`);
  },

  // Toggle task completion
  toggleTaskCompletion: async (id: string): Promise<Task> => {
    const response = await apiClient.patch(`/api/tasks/${id}/toggle`);
    return response.data;
  },

  // Get tasks by status
  getTasksByStatus: async (status: string): Promise<Task[]> => {
    const response = await apiClient.get(`/api/tasks/status/${status}`);
    return response.data;
  },

  // Get tasks by priority
  getTasksByPriority: async (priority: string): Promise<Task[]> => {
    const response = await apiClient.get(`/api/tasks/priority/${priority}`);
    return response.data;
  },

  // Get tasks by category
  getTasksByCategory: async (category: string): Promise<Task[]> => {
    const response = await apiClient.get(`/api/tasks/category/${category}`);
    return response.data;
  },

  // Search tasks
  searchTasks: async (query: string): Promise<Task[]> => {
    const response = await apiClient.get(`/api/tasks/search?query=${encodeURIComponent(query)}`);
    return response.data;
  },
};
```

## TypeScript Interfaces

Define TypeScript interfaces for the task data model:

```typescript
// src/types/Task.ts
export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  dueDate: string; // ISO date string
  category: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  completed: boolean;
}

// Constants for task status and priority
export const TaskStatus = {
  TODO: 'TODO' as const,
  IN_PROGRESS: 'IN_PROGRESS' as const,
  DONE: 'DONE' as const,
};

export const TaskPriority = {
  HIGH: 'HIGH' as const,
  MEDIUM: 'MEDIUM' as const,
  LOW: 'LOW' as const,
};
```

## Using the API in React Components

### Example: Fetching and Displaying Tasks

```tsx
import React, { useEffect, useState } from 'react';
import { TaskService } from '../api/taskService';
import { Task } from '../types/Task';

const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const data = await TaskService.getAllTasks();
        setTasks(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch tasks');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  if (loading) return <div>Loading tasks...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Tasks</h2>
      {tasks.length === 0 ? (
        <p>No tasks found</p>
      ) : (
        <ul>
          {tasks.map((task) => (
            <li key={task.id}>
              <h3>{task.title}</h3>
              <p>{task.description}</p>
              <p>Status: {task.status}</p>
              <p>Priority: {task.priority}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TaskList;
```

### Example: Creating a New Task

```tsx
import React, { useState } from 'react';
import { TaskService } from '../api/taskService';
import { Task, TaskStatus, TaskPriority } from '../types/Task';

const CreateTaskForm: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState(TaskStatus.TODO);
  const [priority, setPriority] = useState(TaskPriority.MEDIUM);
  const [category, setCategory] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      setError(null);
      
      const newTask = {
        title,
        description,
        status,
        priority,
        category,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      };
      
      await TaskService.createTask(newTask);
      
      // Reset form
      setTitle('');
      setDescription('');
      setStatus(TaskStatus.TODO);
      setPriority(TaskPriority.MEDIUM);
      setCategory('');
      setDueDate('');
      
      // Optionally, notify parent component or redirect
    } catch (err) {
      setError('Failed to create task');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Create New Task</h2>
      {error && <div className="error">{error}</div>}
      
      <div>
        <label htmlFor="title">Title:</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      
      <div>
        <label htmlFor="description">Description:</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      
      <div>
        <label htmlFor="status">Status:</label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value as Task['status'])}
        >
          <option value={TaskStatus.TODO}>To Do</option>
          <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
          <option value={TaskStatus.DONE}>Done</option>
        </select>
      </div>
      
      <div>
        <label htmlFor="priority">Priority:</label>
        <select
          id="priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value as Task['priority'])}
        >
          <option value={TaskPriority.HIGH}>High</option>
          <option value={TaskPriority.MEDIUM}>Medium</option>
          <option value={TaskPriority.LOW}>Low</option>
        </select>
      </div>
      
      <div>
        <label htmlFor="category">Category:</label>
        <input
          id="category"
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
      </div>
      
      <div>
        <label htmlFor="dueDate">Due Date:</label>
        <input
          id="dueDate"
          type="datetime-local"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>
      
      <button type="submit" disabled={submitting}>
        {submitting ? 'Creating...' : 'Create Task'}
      </button>
    </form>
  );
};

export default CreateTaskForm;
```

## Error Handling

Implement consistent error handling for API requests:

```typescript
// src/utils/errorHandler.ts
import axios, { AxiosError } from 'axios';

export interface ApiError {
  message: string;
  statusCode?: number;
  details?: string;
}

export const handleApiError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<any>;
    
    // Handle server error responses
    if (axiosError.response) {
      const { status, data } = axiosError.response;
      
      return {
        message: data.message || 'An error occurred',
        statusCode: status,
        details: data.details || data.error,
      };
    }
    
    // Handle network errors
    if (axiosError.request) {
      return {
        message: 'Network error - unable to connect to the server',
        details: 'Please check your internet connection',
      };
    }
  }
  
  // Handle other errors
  return {
    message: error instanceof Error ? error.message : 'An unknown error occurred',
  };
};
```

## Authentication (Future Implementation)

For future implementation of authentication:

```typescript
// src/api/authService.ts
import apiClient from './apiClient';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    username: string;
    // other user properties
  };
}

export const AuthService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post('/api/auth/login', credentials);
    const data = response.data;
    
    // Store token in localStorage or secure cookie
    localStorage.setItem('auth_token', data.token);
    
    // Add token to default headers for future requests
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    
    return data;
  },
  
  logout: async (): Promise<void> => {
    // Clear token from localStorage
    localStorage.removeItem('auth_token');
    
    // Remove token from default headers
    delete apiClient.defaults.headers.common['Authorization'];
    
    // Optionally call logout endpoint
    await apiClient.post('/api/auth/logout');
  },
  
  getCurrentUser: async (): Promise<AuthResponse['user']> => {
    const response = await apiClient.get('/api/auth/me');
    return response.data;
  },
};
```

## Conclusion

This API integration approach provides a clean, type-safe way to interact with the backend APIs from the React frontend. The service pattern encapsulates all API-related logic, making it easy to maintain and extend as the application grows.
