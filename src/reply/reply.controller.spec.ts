import { Test, TestingModule } from '@nestjs/testing';
import { ReplyController } from './reply.controller';
import { ReplyService } from './reply.service';
import { Replyschema } from './schema/reply.schema'; // Import the ReplyModel
import { CommentSchema } from  '../comment/schema/comment.schema'

describe('ReplyController', () => {
  let controller: ReplyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReplyController],
      providers: [
        ReplyService,
        { provide: 'ReplyModel', useValue: Replyschema }, // Provide the ReplyService and ReplyModel
        { provide: 'CommentModel', useValue: CommentSchema }, // Provide the CommentModel
      ],
    }).compile();

    controller = module.get<ReplyController>(ReplyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

