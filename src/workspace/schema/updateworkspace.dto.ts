export class UpdateWorkspaceDto {
    readonly workspaceName?: string;
    readonly users?: string[];
    readonly documents?: string[];
    accessCode?: string; // Optional, can be updated or generated
  }
  