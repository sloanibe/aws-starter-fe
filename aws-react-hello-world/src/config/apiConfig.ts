// API configuration
export const apiConfig = {
  // Set to false to use real API calls
  useMockApi: false,
  
  // Base URL for API calls
  // Use local API for development, production API for production
  apiBaseUrl: import.meta.env.DEV 
    ? 'http://localhost:8080/api'  // Development API endpoint
    : 'https://vab90wx4u0.execute-api.us-west-1.amazonaws.com/prod/api', // Production API endpoint
  
  // API endpoints
  endpoints: {
    users: '/users',
    projects: '/projects',
    projectMembers: '/project-members',
    projectDetails: '/project-details',
    tasks: '/tasks',
    taskUpdates: '/task-updates'
  }
};
