import { TaskUpdate } from '../../models';

export const mockTaskUpdates: TaskUpdate[] = [
  // Updates for task-2 (Implement JWT authentication)
  {
    id: 'update-1',
    taskId: 'task-2',
    userId: 'user-1',
    type: 'STATUS_CHANGE',
    content: 'Changed status from TODO to IN_PROGRESS',
    previousValue: 'TODO',
    newValue: 'IN_PROGRESS',
    createdAt: '2025-03-15T10:30:00Z'
  },
  {
    id: 'update-2',
    taskId: 'task-2',
    userId: 'user-1',
    type: 'COMMENT',
    content: "I've started implementing the JWT authentication. I'm using the jsonwebtoken library for token generation and validation. @user-2 could you review my approach when you have time?",
    createdAt: '2025-03-15T11:45:00Z'
  },
  {
    id: 'update-3',
    taskId: 'task-2',
    userId: 'user-1',
    type: 'ATTACHMENT',
    content: 'Added authentication flow diagram',
    attachmentUrl: 'https://example.com/attachments/auth-flow-diagram.png',
    createdAt: '2025-03-16T09:15:00Z'
  },
  {
    id: 'update-4',
    taskId: 'task-2',
    userId: 'user-2',
    type: 'COMMENT',
    content: "The approach looks good. Make sure to implement token refresh and proper error handling. I'd also recommend storing the JWT in HttpOnly cookies for better security.",
    createdAt: '2025-03-16T14:30:00Z'
  },
  {
    id: 'update-5',
    taskId: 'task-2',
    userId: 'user-1',
    type: 'COMMENT',
    content: "Thanks for the feedback! I'll implement the HttpOnly cookie approach and add the token refresh mechanism.",
    createdAt: '2025-03-17T09:45:00Z'
  },
  
  // Updates for task-4 (Fix CORS configuration)
  {
    id: 'update-6',
    taskId: 'task-4',
    userId: 'user-3',
    type: 'ASSIGNMENT',
    content: 'Assigned task to @user-2',
    newValue: 'user-2',
    createdAt: '2025-03-13T09:15:00Z'
  },
  {
    id: 'update-7',
    taskId: 'task-4',
    userId: 'user-2',
    type: 'STATUS_CHANGE',
    content: 'Changed status from TODO to IN_PROGRESS',
    previousValue: 'TODO',
    newValue: 'IN_PROGRESS',
    createdAt: '2025-03-14T10:30:00Z'
  },
  {
    id: 'update-8',
    taskId: 'task-4',
    userId: 'user-2',
    type: 'COMMENT',
    content: "I'm updating the CORS configuration in the Spring Boot application. The current configuration is too restrictive and doesn't allow requests from our frontend domain.",
    createdAt: '2025-03-14T11:45:00Z'
  },
  {
    id: 'update-9',
    taskId: 'task-4',
    userId: 'user-1',
    type: 'COMMENT',
    content: "Make sure to allow all required HTTP methods and headers. We need at least GET, POST, PUT, DELETE, and OPTIONS methods.",
    createdAt: '2025-03-15T09:30:00Z'
  },
  {
    id: 'update-10',
    taskId: 'task-4',
    userId: 'user-2',
    type: 'COMMENT',
    content: "I've updated the configuration to allow all required methods and headers. Testing now with the frontend application.",
    createdAt: '2025-03-16T11:30:00Z'
  },
  
  // Updates for task-5 (Implement error handling)
  {
    id: 'update-11',
    taskId: 'task-5',
    userId: 'user-1',
    type: 'ASSIGNMENT',
    content: 'Assigned task to @user-3',
    newValue: 'user-3',
    createdAt: '2025-03-14T13:45:00Z'
  },
  {
    id: 'update-12',
    taskId: 'task-5',
    userId: 'user-3',
    type: 'STATUS_CHANGE',
    content: 'Changed status from TODO to IN_PROGRESS',
    previousValue: 'TODO',
    newValue: 'IN_PROGRESS',
    createdAt: '2025-03-15T09:15:00Z'
  },
  {
    id: 'update-13',
    taskId: 'task-5',
    userId: 'user-3',
    type: 'COMMENT',
    content: "I'm implementing a global exception handler in Spring Boot to provide consistent error responses across the API.",
    createdAt: '2025-03-15T10:30:00Z'
  },
  {
    id: 'update-14',
    taskId: 'task-5',
    userId: 'user-3',
    type: 'STATUS_CHANGE',
    content: 'Changed status from IN_PROGRESS to REVIEW',
    previousValue: 'IN_PROGRESS',
    newValue: 'REVIEW',
    createdAt: '2025-03-17T10:20:00Z'
  },
  {
    id: 'update-15',
    taskId: 'task-5',
    userId: 'user-3',
    type: 'COMMENT',
    content: "I've completed the implementation of the global exception handler. @user-1 could you please review the code?",
    createdAt: '2025-03-17T10:25:00Z'
  },
  
  // Updates for task-6 (Create deployment script)
  {
    id: 'update-16',
    taskId: 'task-6',
    userId: 'user-1',
    type: 'STATUS_CHANGE',
    content: 'Changed status from TODO to IN_PROGRESS',
    previousValue: 'TODO',
    newValue: 'IN_PROGRESS',
    createdAt: '2025-03-08T10:30:00Z'
  },
  {
    id: 'update-17',
    taskId: 'task-6',
    userId: 'user-1',
    type: 'COMMENT',
    content: "I'm creating a bash script to automate the deployment process. The script will build the application, create a Docker image, and deploy it to our AWS environment.",
    createdAt: '2025-03-08T11:45:00Z'
  },
  {
    id: 'update-18',
    taskId: 'task-6',
    userId: 'user-1',
    type: 'ATTACHMENT',
    content: 'Added deployment script draft',
    attachmentUrl: 'https://example.com/attachments/deploy-script-v1.sh',
    createdAt: '2025-03-10T09:30:00Z'
  },
  {
    id: 'update-19',
    taskId: 'task-6',
    userId: 'user-1',
    type: 'STATUS_CHANGE',
    content: 'Changed status from IN_PROGRESS to REVIEW',
    previousValue: 'IN_PROGRESS',
    newValue: 'REVIEW',
    createdAt: '2025-03-12T14:15:00Z'
  },
  {
    id: 'update-20',
    taskId: 'task-6',
    userId: 'user-3',
    type: 'COMMENT',
    content: "The script looks good! I've tested it and it works as expected. One suggestion: add some error handling to catch and report failures.",
    createdAt: '2025-03-13T10:30:00Z'
  },
  {
    id: 'update-21',
    taskId: 'task-6',
    userId: 'user-1',
    type: 'COMMENT',
    content: "Good point! I've added error handling and improved the logging. Updated script attached.",
    createdAt: '2025-03-14T11:45:00Z'
  },
  {
    id: 'update-22',
    taskId: 'task-6',
    userId: 'user-1',
    type: 'ATTACHMENT',
    content: 'Added updated deployment script',
    attachmentUrl: 'https://example.com/attachments/deploy-script-v2.sh',
    createdAt: '2025-03-14T11:50:00Z'
  },
  {
    id: 'update-23',
    taskId: 'task-6',
    userId: 'user-1',
    type: 'STATUS_CHANGE',
    content: 'Changed status from REVIEW to DONE',
    previousValue: 'REVIEW',
    newValue: 'DONE',
    createdAt: '2025-03-15T09:45:00Z'
  }
];
