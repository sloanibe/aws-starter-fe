import { User } from '../../models';
import { UserService } from '../UserService';
import { apiConfig } from '../../config/apiConfig';

export class ApiUserService implements UserService {
  // Get all users
  async getAllUsers(): Promise<User[]> {
    try {
      const response = await fetch(`${apiConfig.apiBaseUrl}${apiConfig.endpoints.users}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

  // Get user by ID
  async getUserById(id: string): Promise<User | null> {
    try {
      const response = await fetch(`${apiConfig.apiBaseUrl}${apiConfig.endpoints.users}/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching user with ID ${id}:`, error);
      return null;
    }
  }

  // Get current user (authenticated user)
  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await fetch(`${apiConfig.apiBaseUrl}${apiConfig.endpoints.users}/current`, {
        credentials: 'include' // Include cookies for authentication
      });
      if (!response.ok) {
        if (response.status === 401) {
          return null; // Not authenticated
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching current user:', error);
      return null;
    }
  }

  // Get users by project ID
  async getUsersByProjectId(projectId: string): Promise<User[]> {
    try {
      const response = await fetch(`${apiConfig.apiBaseUrl}${apiConfig.endpoints.projects}/${projectId}/users`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching users for project ${projectId}:`, error);
      return [];
    }
  }
}
