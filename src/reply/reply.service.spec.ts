import { Test, TestingModule } from '@nestjs/testing';
import { ReplyService } from './reply.service';
import { Replyschema } from './schema/reply.schema'; // Import the ReplyModel
import { CommentSchema } from  '../comment/schema/comment.schema'

describe('ReplyService', () => {
  let service: ReplyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReplyService,
        { provide: 'ReplyModel', useValue: Replyschema },
        { provide: 'CommentModel', useValue: CommentSchema },
      ],
    }).compile();

    service = module.get<ReplyService>(ReplyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
