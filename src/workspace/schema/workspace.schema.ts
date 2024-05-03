// workspace.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {  Schema as MongooseSchema } from 'mongoose';
import { Document } from '../../document/schema/document.schema'; // Assuming the path to Document schema
import { User } from '../../auth/schema/user.schema';

@Schema({
  timestamps: true,
})
export class Workspace  {


  @Prop({ type: String, required: true })
  workspaceName: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  owner: User;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }], default: [] })
  users: User[];

  @Prop() // Modifiez cette ligne pour accepter une chaîne de caractères
  documents?: string[];

  @Prop({ type: String, required: true })
  accessCode: string;
}

export const WorkspaceSchema = SchemaFactory.createForClass(Workspace);
