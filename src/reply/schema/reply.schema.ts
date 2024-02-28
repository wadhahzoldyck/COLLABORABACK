import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import {Schema as MongooseSchema } from 'mongoose';
import { Comment } from "../../comment/schema/comment.schema";
@Schema({
    timestamps : true,
})
export class Reply{

    @Prop()
    contentreply: string 
    @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Comment' }] })
    comment: Comment;



    


}
export const Replyschema=SchemaFactory.createForClass(Reply)