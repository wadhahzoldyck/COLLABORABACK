import { Test, TestingModule } from '@nestjs/testing';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { CommentSchema } from './schema/comment.schema'; // Import the CommentModel
import { DocumentSchema } from '../document/schema/document.schema';
import { UserSchema } from '../auth/schema/user.schema';


describe('CommentController', () => {
  let controller: CommentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentController],
      providers: [
        CommentService,
        { provide: 'CommentModel', useValue: CommentSchema },
        { provide: 'DocumentModel', useValue: DocumentSchema }, // Provide DocumentModel
        { provide: 'UserModel', useValue: UserSchema }, // Provide UserModel
      ],
    }).compile();

    controller = module.get<CommentController>(CommentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
