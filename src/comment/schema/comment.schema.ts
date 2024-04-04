//comment.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Reply } from '../../reply/schema/reply.schema';
import mongoose, {
  Mongoose,
  Schema as MongooseSchema,
  Types,
} from 'mongoose';
import { Document } from '../../document/schema/document.schema';
import { User } from '../../auth/schema/user.schema';
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
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' }) 
    owner: User;

}

export type CommentDocument = Comment & Document;

export const CommentSchema = SchemaFactory.createForClass(Comment);
