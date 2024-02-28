import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  timestamps: true,
})
export class Content {
  @Prop()
  text: string;

  @Prop()
  attachmentUrl: string; // Store the URL or path to the uploaded file
}
export const ContentSchema = SchemaFactory.createForClass(Content);
