// versioning.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from '../../document/schema/document.schema';

@Schema({
  timestamps: true,
})
export class Versioning {
  @Prop()
  _id: string;

  @Prop({ type: [Document] }) // Define document as an array of Document
  document: Document[];
}

export const VersioningSchema = SchemaFactory.createForClass(Versioning);
