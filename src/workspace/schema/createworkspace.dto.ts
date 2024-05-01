export class CreateWorkspaceDto {
    readonly workspaceName: string;
    readonly owner: string; // Owner's user ID
    readonly users?: string[]; // Optional array of user IDs
    readonly documents?: string[]; // Optional array of document IDs
    accessCode?: string; // This will be set by the service
  }
  