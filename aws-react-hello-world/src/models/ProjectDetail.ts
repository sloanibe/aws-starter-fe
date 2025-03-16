export interface Activity {
  id: string;
  user: string;
  action: string;
  timestamp: string;
}

export interface Task {
  id: string;
  name: string;
  description: string;
  status: string;
  priority: 'High' | 'Medium' | 'Low';
  assignee: string;
  dueDate: string;
  comments: string[];
}

export interface ProjectDetail {
  id: string;
  name: string;
  description: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  color: string;
  progress: number;
  tasks: Task[];
  members: string[];
  activities: Activity[];
  createdAt: string;
  updatedAt: string;
}
