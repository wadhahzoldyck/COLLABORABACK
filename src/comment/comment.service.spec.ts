import { Test, TestingModule } from '@nestjs/testing';
import { CommentService } from './comment.service';
import { CommentSchema } from './schema/comment.schema'; // Import the CommentModel
import { UserSchema } from '../auth/schema/user.schema'; // Import UserModel from your application
import { DocumentSchema } from '../document/schema/document.schema'; // Import DocumentModel from your application
describe('CommentService', () => {
  let service: CommentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentService,
        // Provide CommentModel, UserModel, and DocumentModel as part of the testing module
        { provide: 'CommentModel', useValue: CommentSchema },
        { provide: 'UserModel', useValue: UserSchema },
        { provide: 'DocumentModel', useValue: DocumentSchema },
      ],
    }).compile();

    service = module.get<CommentService>(CommentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
