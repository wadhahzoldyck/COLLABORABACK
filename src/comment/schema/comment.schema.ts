//comment.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Reply } from "../../reply/schema/reply.schema";

@Schema({
    timestamps: true,
})
export class Comment {

    @Prop()
    commentaire: string;

    @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Reply' }] })
    replies: Reply[];
}

export type CommentDocument = Comment & Document;

export const CommentSchema = SchemaFactory.createForClass(Comment);
