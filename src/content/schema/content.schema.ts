import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  timestamps: true,
})
export class Content {
  @Prop()
  text: string;
  @Prop()
  name: string;

  @Prop()
  attachmentUrl: string; 
  
  @Prop()
  publicId:string
}
export const ContentSchema = SchemaFactory.createForClass(Content);
