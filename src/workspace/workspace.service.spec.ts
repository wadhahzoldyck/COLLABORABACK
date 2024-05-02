import { Test, TestingModule } from '@nestjs/testing';
import { WorkspaceService } from './workspace.service';
import { WorkspaceSchema } from './schema/workspace.schema';

describe('WorkspaceService', () => {
  let service: WorkspaceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspaceService,
        { provide: 'WorkspaceModel', useValue: WorkspaceSchema },
      ],
    }).compile();

    service = module.get<WorkspaceService>(WorkspaceService);
  });
});
