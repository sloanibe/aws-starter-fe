import { User } from '../models';

// Interface for UserService
export interface UserService {
  getAllUsers(): Promise<User[]>;
  getUserById(id: string): Promise<User | null>;
  getCurrentUser(): Promise<User | null>;
  getUsersByProjectId(projectId: string): Promise<User[]>;
}
