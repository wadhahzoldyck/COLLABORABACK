//comment.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Reply } from '../../reply/schema/reply.schema';
import mongoose, {
  Mongoose,
  Schema as MongooseSchema,
  Types,
} from 'mongoose';
import { Document } from '../../document/schema/document.schema';
@Schema({
  timestamps: true,
})
export class Comment {
  @Prop()
  commentaire: string;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Reply' }] })
  replies: Reply[];

  @Prop() // Modifiez cette ligne pour accepter une chaîne de caractères
  document?: string;
}

export type CommentDocument = Comment & Document;

export const CommentSchema = SchemaFactory.createForClass(Comment);
