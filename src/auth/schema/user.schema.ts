import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop()
  firstname: string;

  @Prop()
  lastname: string;

  @Prop()
  email: string;

  @Prop()
  password: string;

  @Prop({ type: Buffer }) // Store image data as a Buffer
  profileImage: Buffer;

  @Prop()
  hashedRT: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
