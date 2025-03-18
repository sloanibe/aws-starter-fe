import { Project, ProjectStatus } from '../../models/Project';
import { ProjectService } from '../ProjectService';
import { mockProjects } from '../../data/mock/mockProjects';
import { ProjectDetail } from '../../models/ProjectDetail';

// Get the mock project details array
let mockProjectDetails: ProjectDetail[] = [];
try {
  const existingDetails = localStorage.getItem('mockProjectDetails');
  mockProjectDetails = existingDetails ? JSON.parse(existingDetails) : [];
} catch (e) {
  console.error('Error loading mock project details:', e);
  mockProjectDetails = [];
}

console.log('Imported mock projects:', mockProjects);

export const useMockProjectService = (): ProjectService => {
  const getAllProjects = (): Promise<Project[]> => {
    console.log('Mock projects in getAllProjects:', mockProjects);
    console.log('Mock projects type:', typeof mockProjects);
    console.log('Is array:', Array.isArray(mockProjects));
    return Promise.resolve(Array.isArray(mockProjects) ? mockProjects : []);
  };

  const getProjectById = (id: string): Promise<Project | null> => {
    const project = mockProjects.find(p => p.id === id);
    return Promise.resolve(project || null);
  };

  const getProjectsByStatus = (status: ProjectStatus): Promise<Project[]> => {
    const projects = mockProjects.filter(p => p.status === status);
    return Promise.resolve(projects);
  };

  const getProjectsByUserId = (userId: string): Promise<Project[]> => {
    const projects = mockProjects.filter(p => p.members.includes(userId));
    return Promise.resolve(projects);
  };

  const createProject = (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> => {
    const newProject: Project = {
      ...project,
      id: `project-${mockProjects.length + 1}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mockProjects.push(newProject);

    // Create corresponding project details
    const newProjectDetails: ProjectDetail = {
      id: newProject.id,
      name: newProject.name,
      description: newProject.description,
      status: newProject.status,
      color: newProject.color,
      progress: newProject.progress,
      tasks: [],
      members: newProject.members,
      activities: [{
        id: `activity-${Date.now()}`,
        user: 'System',
        action: 'created project',
        timestamp: newProject.createdAt
      }],
      createdAt: newProject.createdAt,
      updatedAt: newProject.updatedAt
    };

    // Add to mockProjectDetails array
    mockProjectDetails.push(newProjectDetails);
    
    // Save to localStorage
    try {
      localStorage.setItem('mockProjectDetails', JSON.stringify(mockProjectDetails));
    } catch (e) {
      console.error('Error saving mock project details:', e);
    }

    return Promise.resolve(newProject);
  };

  const updateProject = (id: string, project: Partial<Project>): Promise<Project | null> => {
    const index = mockProjects.findIndex(p => p.id === id);
    if (index === -1) return Promise.resolve(null);
    mockProjects[index] = { ...mockProjects[index], ...project, updatedAt: new Date().toISOString() };
    return Promise.resolve(mockProjects[index]);
  };

  const deleteProject = (id: string): Promise<boolean> => {
    const index = mockProjects.findIndex(p => p.id === id);
    if (index === -1) return Promise.resolve(false);
    mockProjects.splice(index, 1);
    return Promise.resolve(true);
  };

  return {
    getAllProjects,
    getProjectById,
    getProjectsByStatus,
    getProjectsByUserId,
    createProject,
    updateProject,
    deleteProject
  };
};
