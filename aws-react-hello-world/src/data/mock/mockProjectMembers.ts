import { ProjectMember } from '../../models';

export const mockProjectMembers: ProjectMember[] = [
  // AWS Starter project members
  {
    id: 'member-1',
    projectId: 'project-1',
    userId: 'user-1',
    role: 'OWNER',
    joinedAt: '2025-02-10T09:00:00Z'
  },
  {
    id: 'member-2',
    projectId: 'project-1',
    userId: 'user-2',
    role: 'MEMBER',
    joinedAt: '2025-02-11T10:30:00Z'
  },
  {
    id: 'member-3',
    projectId: 'project-1',
    userId: 'user-3',
    role: 'MEMBER',
    joinedAt: '2025-02-12T14:15:00Z'
  },
  {
    id: 'member-4',
    projectId: 'project-1',
    userId: 'user-4',
    role: 'VIEWER',
    joinedAt: '2025-02-13T11:45:00Z'
  },
  {
    id: 'member-5',
    projectId: 'project-1',
    userId: 'user-5',
    role: 'VIEWER',
    joinedAt: '2025-02-14T09:20:00Z'
  },
  
  // Task Manager project members
  {
    id: 'member-6',
    projectId: 'project-2',
    userId: 'user-1',
    role: 'OWNER',
    joinedAt: '2025-02-15T11:30:00Z'
  },
  {
    id: 'member-7',
    projectId: 'project-2',
    userId: 'user-3',
    role: 'MEMBER',
    joinedAt: '2025-02-16T13:45:00Z'
  },
  {
    id: 'member-8',
    projectId: 'project-2',
    userId: 'user-5',
    role: 'MEMBER',
    joinedAt: '2025-02-17T10:15:00Z'
  },
  
  // Documentation project members
  {
    id: 'member-9',
    projectId: 'project-3',
    userId: 'user-2',
    role: 'OWNER',
    joinedAt: '2025-01-20T10:15:00Z'
  },
  {
    id: 'member-10',
    projectId: 'project-3',
    userId: 'user-1',
    role: 'MEMBER',
    joinedAt: '2025-01-21T14:30:00Z'
  },
  {
    id: 'member-11',
    projectId: 'project-3',
    userId: 'user-4',
    role: 'MEMBER',
    joinedAt: '2025-01-22T09:45:00Z'
  },
  
  // API Development project members
  {
    id: 'member-12',
    projectId: 'project-4',
    userId: 'user-3',
    role: 'OWNER',
    joinedAt: '2025-02-25T13:45:00Z'
  },
  {
    id: 'member-13',
    projectId: 'project-4',
    userId: 'user-1',
    role: 'MEMBER',
    joinedAt: '2025-02-26T11:20:00Z'
  },
  {
    id: 'member-14',
    projectId: 'project-4',
    userId: 'user-2',
    role: 'MEMBER',
    joinedAt: '2025-02-27T15:10:00Z'
  },
  
  // UI Redesign project members
  {
    id: 'member-15',
    projectId: 'project-5',
    userId: 'user-4',
    role: 'OWNER',
    joinedAt: '2025-01-05T08:30:00Z'
  },
  {
    id: 'member-16',
    projectId: 'project-5',
    userId: 'user-5',
    role: 'MEMBER',
    joinedAt: '2025-01-06T10:45:00Z'
  }
];
