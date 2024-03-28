import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {  Schema as MongooseSchema } from 'mongoose';

import { User } from '../../auth/schema/user.schema'; // Import the User schema

@Schema({
  timestamps: true,
})
export class Document   {
  @Prop()
  documentName: string;

  @Prop({ type: Object })
  data: Object;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' }) 
  owner: User;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }] }) 
  usersWithAccess: User[];
}

export const DocumentSchema = SchemaFactory.createForClass(Document);
