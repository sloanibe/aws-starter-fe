import { User } from '../../models';
import { UserService } from '../UserService';
import { mockUsers, mockProjectMembers } from '../../data/mock';

export class MockUserService implements UserService {
  // Get all users
  async getAllUsers(): Promise<User[]> {
    return Promise.resolve([...mockUsers]);
  }

  // Get user by ID
  async getUserById(id: string): Promise<User | null> {
    const user = mockUsers.find(user => user.id === id);
    return Promise.resolve(user || null);
  }

  // Get current user (in a real app, this would use authentication)
  // For mock purposes, we'll return the first user
  async getCurrentUser(): Promise<User | null> {
    return Promise.resolve(mockUsers[0]);
  }

  // Get users by project ID
  async getUsersByProjectId(projectId: string): Promise<User[]> {
    // Find all project members for this project
    const projectMemberIds = mockProjectMembers
      .filter(member => member.projectId === projectId)
      .map(member => member.userId);
    
    // Get the user objects for these members
    const projectUsers = mockUsers.filter(user => 
      projectMemberIds.includes(user.id)
    );
    
    return Promise.resolve(projectUsers);
  }
}
