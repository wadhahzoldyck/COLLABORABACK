import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from '../../auth/schema/user.schema';
import { Schema as MongooseSchema } from 'mongoose';

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

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  owner: User;
}
export const ContentSchema = SchemaFactory.createForClass(Content);