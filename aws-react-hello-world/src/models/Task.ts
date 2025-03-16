export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
export type TaskPriority = 'HIGH' | 'MEDIUM' | 'LOW';

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  category?: string;
  completed: boolean;
  assigneeId?: string; // Reference to the user assigned to the task
  reporterId: string;  // Reference to the user who created the task
  createdAt: string;
  updatedAt: string;
}
