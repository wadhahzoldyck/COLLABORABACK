import { Test, TestingModule } from '@nestjs/testing';
import { CommentService } from './comment.service';
import { CommentSchema } from './schema/comment.schema'; // Import the CommentModel
import { UserSchema } from '../auth/schema/user.schema';
import { DocumentSchema } from '../document/schema/document.schema';

describe('ContentService', () => {
  let service: CommentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentService,
        { provide: 'CommentModel', useValue: CommentSchema },
         { provide: 'DocumentModel', useValue: DocumentSchema },
        { provide: 'UserModel', useValue: UserSchema },
      ],
    }).compile();

    service = module.get<CommentService>(CommentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});