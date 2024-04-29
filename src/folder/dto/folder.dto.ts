// create-folder.dto.ts

export class CreateFolderDto {
  readonly name: string;

  readonly owner: string;

  readonly documents?: string[]; // Assuming you provide IDs of documents associated with the folder
}
