import { Task } from '../models/Task';

export interface TaskService {
  createTask(projectId: string, task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task>;
  updateTask(taskId: string, task: Partial<Task>): Promise<Task>;
  deleteTask(taskId: string): Promise<boolean>;
  getTasksByProjectId(projectId: string): Promise<Task[]>;
}
