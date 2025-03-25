// API configuration
export const apiConfig = {
  // Set to false to use real API calls
  useMockApi: false,
  
  // Base URL for API calls
  // In development, use the local proxy defined in vite.config.ts
  // In production, use the AWS API Gateway as the proper entry point
  apiBaseUrl: import.meta.env.DEV 
    ? '/api'  // This will be proxied by Vite to the production API
    : 'https://vab90wx4u0.execute-api.us-west-1.amazonaws.com/prod/api',
  
  // API endpoints
  endpoints: {
    users: '/users',
    login: '/login',  // Correctly configured for the dual-gateway architecture
    projects: '/projects',
    projectMembers: '/project-members',
    projectDetails: '/project-details',
    tasks: '/tasks',
    taskUpdates: '/task-updates'
  }
};
