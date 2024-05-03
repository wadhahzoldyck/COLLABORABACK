import { Test, TestingModule } from '@nestjs/testing';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';
import { DocumentSchema } from './schema/document.schema';
import { UserSchema } from '../auth/schema/user.schema';
import { FolderSchema } from '../folder/schema/folder.schema';

describe('DocumentController', () => {
  let controller: DocumentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentController],
      providers: [
        DocumentService,
        // Provide DocumentModel, UserModel, and FolderModel as part of the testing module
        { provide: 'DocumentModel', useValue: DocumentSchema },
        { provide: 'UserModel', useValue: UserSchema },
        { provide: 'FolderModel', useValue: FolderSchema },
      ],
    }).compile();

    controller = module.get<DocumentController>(DocumentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
