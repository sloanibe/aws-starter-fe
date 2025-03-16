import { Project } from '../../models';

console.log('Loading mock projects module...');

export const mockProjects: Project[] = [
  // Project 1
  {
    id: 'project-1',
    name: 'AWS Starter',
    description: 'AWS infrastructure and application deployment project',
    status: 'ACTIVE',
    color: '#4caf50',
    progress: 75,
    createdAt: '2025-02-10T09:00:00Z',
    updatedAt: '2025-03-12T14:30:00Z',
    ownerId: 'user-1',
    members: ['user-1', 'user-2'],
    tasks: ['task-1', 'task-2']
  },
  // Project 2
  {
    id: 'project-2',
    name: 'Task Manager',
    description: 'Project management system with task tracking',
    status: 'ACTIVE',
    color: '#2196f3',
    progress: 45,
    createdAt: '2025-02-15T11:30:00Z',
    updatedAt: '2025-03-10T16:45:00Z',
    ownerId: 'user-1',
    members: ['user-1'],
    tasks: ['task-3']
  },
  // Project 3
  {
    id: 'project-3',
    name: 'Documentation',
    description: 'Technical documentation and user guides',
    status: 'COMPLETED',
    color: '#ff9800',
    progress: 100,
    createdAt: '2025-01-20T10:15:00Z',
    updatedAt: '2025-02-28T15:20:00Z',
    ownerId: 'user-2',
    members: ['user-2'],
    tasks: []
  },
  // Project 4
  {
    id: 'project-4',
    name: 'API Development',
    description: 'RESTful API development with Spring Boot',
    status: 'ACTIVE',
    color: '#f44336',
    progress: 60,
    createdAt: '2025-03-01T08:00:00Z',
    updatedAt: '2025-03-14T12:00:00Z',
    ownerId: 'user-1',
    members: ['user-1', 'user-2'],
    tasks: ['task-4']
  }
];
