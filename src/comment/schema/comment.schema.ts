//comment.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Reply } from '../../reply/schema/reply.schema';
import {
  Document as MongooseDocument,
  Schema as MongooseSchema,
} from 'mongoose';
@Schema({
  timestamps: true,
})
export class Comment {
  @Prop()
  commentaire: string;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Reply' }] })
  replies: Reply[];

   @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Document' })
   document: MongooseDocument;
}

export type CommentDocument = Comment & Document;

export const CommentSchema = SchemaFactory.createForClass(Comment);
