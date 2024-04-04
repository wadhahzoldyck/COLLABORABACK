//comment.module.ts
import { Module, OnModuleInit } from '@nestjs/common';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Comment, CommentSchema } from './schema/comment.schema';
import { CommentGateway } from './comment.gateway';
import { DocumentSchema } from '../document/schema/document.schema';
import { UserSchema } from '../auth/schema/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
    MongooseModule.forFeature([{ name: 'Document', schema: DocumentSchema }]),
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),


  ],
  controllers: [CommentController],
  providers: [CommentService, CommentGateway]
})
export class CommentModule implements OnModuleInit {
  constructor(private commentGateway: CommentGateway) {}

  onModuleInit() {
    if (this.commentGateway.server) {
      this.commentGateway.server.on('connection', (socket) => this.commentGateway.handleConnection(socket));
      this.commentGateway.server.on('disconnect', (socket) => this.commentGateway.handleDisconnect(socket));
    }
  }
}
