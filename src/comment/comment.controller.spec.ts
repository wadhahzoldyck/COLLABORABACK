import { Test, TestingModule } from '@nestjs/testing';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { CommentSchema } from '../comment/schema/comment.schema'; // Import CommentModel from your application
import { UserSchema } from '../auth/schema/user.schema'; // Import UserModel from your application
import { DocumentSchema } from '../document/schema/document.schema'; // Import DocumentModel from your application

describe('CommentController', () => {
  let controller: CommentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentController],
      providers: [
        CommentService,
        // Provide CommentModel, UserModel, and DocumentModel as part of the testing module
        { provide: 'CommentModel', useValue: CommentSchema },
        { provide: 'UserModel', useValue: UserSchema },
        { provide: 'DocumentModel', useValue: DocumentSchema },
      ],
    }).compile();

    controller = module.get<CommentController>(CommentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
