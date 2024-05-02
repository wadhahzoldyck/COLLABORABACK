import { Test, TestingModule } from '@nestjs/testing';
import { WorkspaceController } from './workspace.controller';
import { WorkspaceService } from './workspace.service';
import { WorkspaceSchema } from './schema/workspace.schema';
import { UserSchema } from '../auth/schema/user.schema';

describe('WorkspaceController', () => {
  let controller: WorkspaceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkspaceController],
      providers: [
        WorkspaceService,
        { provide: 'WorkspaceModel', useValue: WorkspaceSchema },
        { provide: 'UserModel', useValue: UserSchema}, // Provide UserModel
      ],
    }).compile();

    controller = module.get<WorkspaceController>(WorkspaceController);
  });
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
