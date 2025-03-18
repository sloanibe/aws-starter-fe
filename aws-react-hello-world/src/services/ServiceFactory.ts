import { apiConfig } from '../config/apiConfig';
import { UserService } from './UserService';
import { MockUserService } from './mock/MockUserService';
import { ApiUserService } from './api/ApiUserService';
import { useMockProjectService } from './mock/MockProjectService';
import { ApiProjectService } from './api/ApiProjectService';
import { ProjectService } from './ProjectService';
import { ProjectDetailService } from './ProjectDetailService';
import { TaskService } from './TaskService';
import { ApiTaskService } from './api/ApiTaskService';
import { useMockProjectDetailService } from './mock/MockProjectDetailService';
import { ApiProjectDetailService } from './api/ApiProjectDetailService';

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
  return apiConfig.useMockApi
    ? useMockProjectService()
    : new ApiProjectService();
};

export const useProjectDetailService = (): ProjectDetailService => {
  return apiConfig.useMockApi
    ? useMockProjectDetailService()
    : new ApiProjectDetailService();
};

export const useTaskService = (): TaskService => {
  return new ApiTaskService();
};
