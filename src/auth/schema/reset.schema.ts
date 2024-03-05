import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Reset extends Document {
  @Prop()
  email: string;

  @Prop({ unique: true })
  token: string;
}

export const ResetSchema = SchemaFactory.createForClass(Reset);
