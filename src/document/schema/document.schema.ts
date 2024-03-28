//document.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import {  Schema as MongooseSchema } from 'mongoose';

import { User } from '../../auth/schema/user.schema'; // Import the User schema


import { Comment } from '../../comment/schema/comment.schema';

@Schema({
  timestamps: true,
})
export class Document   {
    @Prop()
  _id: string;
  @Prop()
  documentName: string;

  @Prop({ type: Object })
  data: Object;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' }) 
  owner: User;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }] }) 
  usersWithAccess: User[];

   @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Comment' }] })
  comments: Comment[];

}

export const DocumentSchema = SchemaFactory.createForClass(Document);
