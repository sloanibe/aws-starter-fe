import { Project, ProjectStatus } from '../models';

// Interface for ProjectService
export interface ProjectService {
  getAllProjects(): Promise<Project[]>;
  getProjectById(id: string): Promise<Project | null>;
  getProjectsByStatus(status: ProjectStatus): Promise<Project[]>;
  getProjectsByUserId(userId: string): Promise<Project[]>;
  createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project>;
  updateProject(id: string, project: Partial<Project>): Promise<Project | null>;
  deleteProject(id: string): Promise<boolean>;
}
