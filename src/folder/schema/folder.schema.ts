import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { Document } from '../../document/schema/document.schema'; // Import the Document schema

@Schema({
  timestamps: true,
})
export class Folder {
  @Prop({ required: true })
  name: string;

  @Prop() // Modifiez cette ligne pour accepter une chaîne de caractères
  documents?: string[];
}

export const FolderSchema = SchemaFactory.createForClass(Folder);
