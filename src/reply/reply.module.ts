import { Module } from '@nestjs/common';
import { ReplyService } from './reply.service';
import { ReplyController } from './reply.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Reply, Replyschema } from './schema/reply.schema';
import { Comment, CommentSchema } from '../comment/schema/comment.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Reply.name, schema: Replyschema }]),
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
    

  ],
  providers: [ReplyService],
  controllers: [ReplyController]
})
export class ReplyModule {}
