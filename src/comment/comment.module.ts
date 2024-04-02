//comment.module.ts
import { Module, OnModuleInit } from '@nestjs/common';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Comment, CommentSchema } from './schema/comment.schema';
import { CommentGateway } from './comment.gateway';
import { Document, DocumentSchema } from '../document/schema/document.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
    MongooseModule.forFeature([{ name: 'Document', schema: DocumentSchema }]),

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
