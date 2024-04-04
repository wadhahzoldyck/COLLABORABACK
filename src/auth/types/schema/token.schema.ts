import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Token extends Document {
  @Prop()
  user_id: string;

  @Prop()
  email: string;

  @Prop()
  token: string;

  @Prop()
  expired_at: Date;
}

export const TokenSchema = SchemaFactory.createForClass(Token);
