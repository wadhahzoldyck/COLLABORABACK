export class AddUserToDocumentDto {
  readonly documentId: string;
  readonly userId: string;
  readonly accessLevel: 'readOnly' | 'readWrite';
}
