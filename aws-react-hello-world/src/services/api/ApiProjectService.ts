import { Project, ProjectStatus } from '../../models';
import { ProjectService } from '../ProjectService';
import { apiConfig } from '../../config/apiConfig';

const API_BASE_URL = apiConfig.apiBaseUrl;

export class ApiProjectService implements ProjectService {
  async getAllProjects(): Promise<Project[]> {
    const response = await fetch(`${API_BASE_URL}/projects`);
    if (!response.ok) {
      throw new Error('Failed to fetch projects');
    }
    return response.json();
  }

  async getProjectById(id: string): Promise<Project | null> {
    const response = await fetch(`${API_BASE_URL}/projects/${id}`);
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch project');
    }
    return response.json();
  }

  async getProjectsByStatus(status: ProjectStatus): Promise<Project[]> {
    const response = await fetch(`${API_BASE_URL}/projects?status=${status}`);
    if (!response.ok) {
      throw new Error('Failed to fetch projects by status');
    }
    return response.json();
  }

  async getProjectsByUserId(userId: string): Promise<Project[]> {
    const response = await fetch(`${API_BASE_URL}/projects?userId=${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch user projects');
    }
    return response.json();
  }

  async createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(project),
    });
    if (!response.ok) {
      throw new Error('Failed to create project');
    }
    return response.json();
  }

  async updateProject(id: string, project: Partial<Project>): Promise<Project | null> {
    const response = await fetch(`${API_BASE_URL}/api/projects/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(project),
    });
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to update project');
    }
    return response.json();
  }

  async deleteProject(id: string): Promise<boolean> {
    const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok && response.status !== 404) {
      throw new Error('Failed to delete project');
    }
    return response.ok;
  }
}
