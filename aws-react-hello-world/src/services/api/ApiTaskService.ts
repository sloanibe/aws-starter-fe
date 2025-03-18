import { Task } from '../../models/Task';
import { TaskService } from '../TaskService';
import { apiConfig } from '../../config/apiConfig';

const API_BASE_URL = apiConfig.apiBaseUrl;

export class ApiTaskService implements TaskService {
  async createTask(projectId: string, task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}${apiConfig.endpoints.tasks}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...task, projectId }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create task');
    }
    
    return response.json();
  }

  async updateTask(taskId: string, task: Partial<Task>): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}${apiConfig.endpoints.tasks}/${taskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(task),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update task');
    }
    
    return response.json();
  }

  async deleteTask(taskId: string): Promise<boolean> {
    const response = await fetch(`${API_BASE_URL}${apiConfig.endpoints.tasks}/${taskId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete task');
    }
    
    return true;
  }

  async getTasksByProjectId(projectId: string): Promise<Task[]> {
    const response = await fetch(`${API_BASE_URL}${apiConfig.endpoints.tasks}?projectId=${projectId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch tasks');
    }
    
    return response.json();
  }
}
