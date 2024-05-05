import { Test, TestingModule } from '@nestjs/testing';
import { WorkspaceService } from './workspace.service';
import { WorkspaceSchema } from './schema/workspace.schema';
import { UserSchema } from '../auth/schema/user.schema';
import { DocumentSchema } from '../document/schema/document.schema';

describe('WorkspaceService', () => {
  let service: WorkspaceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspaceService,
        { provide: 'WorkspaceModel', useValue: WorkspaceSchema },
        { provide: 'UserModel', useValue: UserSchema },
        { provide: 'DocumentModel', useValue: DocumentSchema }, 
      ],
    }).compile();

    service = module.get<WorkspaceService>(WorkspaceService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
