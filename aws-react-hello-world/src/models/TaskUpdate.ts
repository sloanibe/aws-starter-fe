export type UpdateType = 'COMMENT' | 'STATUS_CHANGE' | 'ASSIGNMENT' | 'ATTACHMENT';

export interface TaskUpdate {
  id: string;
  taskId: string;
  userId: string; // User who made the update
  type: UpdateType;
  content: string; // Comment text or description of the change
  previousValue?: string; // For status changes, assignments, etc.
  newValue?: string; // For status changes, assignments, etc.
  attachmentUrl?: string; // For attachments
  createdAt: string;
}
