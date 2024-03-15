import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  timestamps: true,
})
export class Document {
  @Prop()
  _id: string
  @Prop({ type: Object })
  data: Object;


}
export const DocumentSchema = SchemaFactory.createForClass(Document);
