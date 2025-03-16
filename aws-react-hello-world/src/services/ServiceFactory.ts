import { apiConfig } from '../config/apiConfig';
import { UserService } from './UserService';
import { MockUserService } from './mock/MockUserService';
import { ApiUserService } from './api/ApiUserService';
import { useMockProjectService } from './mock/MockProjectService';
import { ProjectService } from './ProjectService';

// Factory class to get the appropriate service implementation
export class ServiceFactory {
  // Get UserService implementation based on config
  static getUserService(): UserService {
    return apiConfig.useMockApi 
      ? new MockUserService() 
      : new ApiUserService();
  }
  
  // Additional service factories will be added here
}

export const useProjectService = (): ProjectService => {
  // For now, use the mock service
  return useMockProjectService() as ProjectService;
};
