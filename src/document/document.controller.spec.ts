import { Test, TestingModule } from '@nestjs/testing';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';
import { DocumentSchema } from './schema/document.schema';
import { UserSchema } from '../auth/schema/user.schema';

describe('DocumentController', () => {
  let controller: DocumentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentController],
      providers: [
        DocumentService,
        { provide: 'DocumentModel', useValue: DocumentSchema },
        // Provide UserModel as part of the testing module
        { provide: 'UserModel', useValue: UserSchema },
      ],
    }).compile();

    controller = module.get<DocumentController>(DocumentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
