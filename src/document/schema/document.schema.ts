//document.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { Comment } from '../../comment/schema/comment.schema';
@Schema({
  timestamps: true,
})
export class Document {
  @Prop()
  _id: string;
  @Prop({ type: Object })
  data: Object;
   @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Comment' }] })
  comments: Comment[];
}
export const DocumentSchema = SchemaFactory.createForClass(Document);
