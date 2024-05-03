import { Test, TestingModule } from '@nestjs/testing';
import { DocumentService } from './document.service';
import { DocumentSchema } from './schema/document.schema';
import { UserSchema } from '../auth/schema/user.schema';
import { FolderSchema } from '../folder/schema/folder.schema';
import {  WorkspaceSchema } from '../workspace/schema/workspace.schema';

describe('DocumentService', () => {
  let service: DocumentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentService,
        { provide: 'DocumentModel', useValue: DocumentSchema },
        { provide: 'UserModel', useValue: UserSchema },
        { provide: 'FolderModel', useValue: FolderSchema }, // Provide FolderSchema
        { provide: 'WorkspaceModel', useValue: WorkspaceSchema }, // Provide FolderSchema

      ],
    }).compile();

    service = module.get<DocumentService>(DocumentService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
