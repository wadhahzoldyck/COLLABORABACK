// access.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { User } from '../../auth/schema/user.schema';

@Schema({ _id: false })
export class Access {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  user: User;

  @Prop({ type: String, enum: ['readOnly', 'readWrite'], required: true })
  accessLevel: string;
}

export const AccessSchema = SchemaFactory.createForClass(Access);
