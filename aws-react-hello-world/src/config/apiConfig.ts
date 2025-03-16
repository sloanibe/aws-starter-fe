// API configuration
export const apiConfig = {
  // Set to true to use mock data instead of real API calls
  useMockApi: true,
  
  // Base URL for API calls
  apiBaseUrl: 'http://localhost:8080/api',
  
  // API endpoints
  endpoints: {
    users: '/users',
    projects: '/projects',
    projectMembers: '/project-members',
    tasks: '/tasks',
    taskUpdates: '/task-updates'
  }
};
