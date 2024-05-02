// document.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema, Document as MongooseDocument } from 'mongoose';
import { User } from '../../auth/schema/user.schema';
import { Comment } from '../../comment/schema/comment.schema';
import { Folder } from '../../folder/schema/folder.schema';
import { Content } from '../../content/schema/content.schema';
import { Access, AccessSchema } from './Access.schema'; // Import Access schema

@Schema({
  timestamps: true,
})
export class Document extends MongooseDocument {
  @Prop()
  _id: string;

  @Prop({ required: true })
  documentName: string;

  @Prop({ type: Object })
  data: Object;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  owner: User;

  @Prop({ type: [AccessSchema], default: [] })
  usersWithAccess: Access[];

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Comment' }] })
  comments: Comment[];

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Folder' })
  folder: Folder;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Content' })
  content: Content;
}

export const DocumentSchema = SchemaFactory.createForClass(Document);
