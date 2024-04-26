import { Test, TestingModule } from '@nestjs/testing';
import { CommentService } from './comment.service';
import { CommentSchema } from './schema/comment.schema'; // Import the CommentModel

describe('CommentService', () => {
  let service: CommentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentService,
        { provide: 'CommentModel', useValue: CommentSchema },
      ],
    }).compile();

    service = module.get<CommentService>(CommentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
