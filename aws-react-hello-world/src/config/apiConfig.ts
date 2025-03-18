// API configuration
export const apiConfig = {
  // Set to false to use real API calls
  useMockApi: false,
  
  // Base URL for API calls
  apiBaseUrl: 'https://vab90wx4u0.execute-api.us-west-1.amazonaws.com/prod/api',
  
  // API endpoints
  endpoints: {
    users: '/users',
    projects: '/projects',
    projectMembers: '/project-members',
    tasks: '/tasks',
    taskUpdates: '/task-updates'
  }
};
