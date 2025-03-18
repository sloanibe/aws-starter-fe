import { ProjectDetail, Activity } from '../../models/ProjectDetail';
import { ProjectDetailService } from '../ProjectDetailService';

const mockActivities: Activity[] = [
  {
    id: 'activity-1',
    user: 'John Doe',
    action: 'updated AWS infrastructure configuration',
    timestamp: '2025-03-15T15:00:00-07:00'
  },
  {
    id: 'activity-2',
    user: 'Jane Smith',
    action: 'completed VPC setup',
    timestamp: '2025-03-15T16:30:00-07:00'
  },
  {
    id: 'activity-3',
    user: 'John Doe',
    action: 'added new task documentation',
    timestamp: '2025-03-15T17:15:00-07:00'
  }
];

const mockProjectDetails: ProjectDetail[] = [
  {
    id: 'project-1',
    name: 'AWS Starter',
    description: 'AWS infrastructure and application deployment project including VPC setup, IAM configuration, and application deployment pipelines.',
    status: 'ACTIVE',
    color: '#4caf50',
    progress: 75,
    tasks: [
      {
        id: 'task-1',
        name: 'Set up VPC',
        description: 'Configure VPC with public and private subnets',
        status: 'Done',
        priority: 'High',
        dueDate: '2025-03-20',
        assignee: 'John Doe',
        comments: ['VPC setup completed', 'Subnets configured']
      },
      {
        id: 'task-2',
        name: 'Configure CI/CD',
        description: 'Set up GitHub Actions for automated deployment',
        status: 'In Progress',
        priority: 'Medium',
        dueDate: '2025-03-25',
        assignee: 'Jane Smith',
        comments: ['Initial pipeline created']
      }
    ],
    members: ['John Doe', 'Jane Smith'],
    activities: mockActivities,
    createdAt: '2025-02-10T09:00:00Z',
    updatedAt: '2025-03-12T14:30:00Z'
  },
  {
    id: 'project-2',
    name: 'Task Manager',
    description: 'Project management system with task tracking, featuring a modern React frontend and Spring Boot backend.',
    status: 'ACTIVE',
    color: '#2196f3',
    progress: 45,
    tasks: [
      {
        id: 'task-3',
        name: 'Design UI Components',
        description: 'Create reusable Material-UI components',
        status: 'In Progress',
        priority: 'High',
        dueDate: '2025-03-22',
        assignee: 'Sarah Designer',
        comments: ['Component library started']
      }
    ],
    members: ['Sarah Designer'],
    activities: [
      {
        id: 'activity-4',
        user: 'Sarah Designer',
        action: 'created initial UI components',
        timestamp: '2025-03-15T14:20:00-07:00'
      }
    ],
    createdAt: '2025-02-15T11:30:00Z',
    updatedAt: '2025-03-10T16:45:00Z'
  },
  {
    id: 'project-3',
    name: 'Documentation',
    description: 'Technical documentation and user guides for the AWS Starter project and Task Manager application.',
    status: 'COMPLETED',
    color: '#ff9800',
    progress: 100,
    tasks: [],
    members: ['Tom Writer'],
    activities: [
      {
        id: 'activity-5',
        user: 'Tom Writer',
        action: 'completed all documentation',
        timestamp: '2025-02-28T15:20:00Z'
      }
    ],
    createdAt: '2025-01-20T10:15:00Z',
    updatedAt: '2025-02-28T15:20:00Z'
  },
  {
    id: 'project-4',
    name: 'API Development',
    description: 'RESTful API development with Spring Boot, including authentication, project management, and task tracking endpoints.',
    status: 'ACTIVE',
    color: '#f44336',
    progress: 60,
    tasks: [
      {
        id: 'task-4',
        name: 'Implement Auth',
        description: 'Add JWT authentication to API endpoints',
        status: 'In Progress',
        priority: 'High',
        dueDate: '2025-03-25',
        assignee: 'Mike Developer',
        comments: ['JWT configuration started']
      }
    ],
    members: ['Mike Developer', 'John Doe'],
    activities: [
      {
        id: 'activity-6',
        user: 'Mike Developer',
        action: 'started authentication implementation',
        timestamp: '2025-03-14T12:00:00Z'
      }
    ],
    createdAt: '2025-03-01T08:00:00Z',
    updatedAt: '2025-03-14T12:00:00Z'
  }
];

export const useMockProjectDetailService = (): ProjectDetailService => {
  const getProjectDetails = async (id: string): Promise<ProjectDetail | null> => {
    const project = mockProjectDetails.find(project => project.id === id);
    return project || null;
  };

  return { getProjectDetails };
};
