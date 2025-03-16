export type ProjectStatus = 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  color: string;
  progress: number; // Percentage of completed tasks
  createdAt: string;
  updatedAt: string;
  ownerId: string; // Reference to the user who created the project
  members: string[]; // Added members property
  tasks: string[]; // Array of task IDs associated with the project
}
