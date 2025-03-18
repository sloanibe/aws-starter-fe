import { ProjectDetail } from '../../models/ProjectDetail';
import { ProjectDetailService } from '../ProjectDetailService';
import { apiConfig } from '../../config/apiConfig';

const API_BASE_URL = apiConfig.apiBaseUrl;

export class ApiProjectDetailService implements ProjectDetailService {
  async getProjectDetails(id: string): Promise<ProjectDetail | null> {
    const response = await fetch(`${API_BASE_URL}${apiConfig.endpoints.projectDetails}/${id}`);
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch project details');
    }
    return response.json();
  }
}
