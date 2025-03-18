import { ProjectDetail } from '../models/ProjectDetail';

export interface ProjectDetailService {
  getProjectDetails(id: string): Promise<ProjectDetail | null>;
}
