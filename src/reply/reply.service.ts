import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment } from '../comment/schema/comment.schema';
import { Reply } from './schema/reply.schema';

@Injectable()
export class ReplyService {
    constructor(
        @InjectModel(Reply.name) private readonly ReplyModel: Model<Reply>,
        @InjectModel(Comment.name) private readonly commentModel: Model<Comment>,
      ) {}
    
      async addReply(commentId: string, replyData: any): Promise<Reply> {
        const reply = new this.ReplyModel({ ...replyData, comment: commentId });
        await reply.save();
        return this.commentModel.findByIdAndUpdate(
          commentId,
          { $push: { replies: reply._id } },
          { new: true },
        );
      }
      async update(replyId: string, updatedData: any): Promise<Reply | null> {
        const updatedReply = await this.ReplyModel.findByIdAndUpdate(
            replyId,
            updatedData,
            { new: true } 
        );

        if (!updatedReply) {
            throw new NotFoundException(`Reply with ID ${replyId} not found`);
        }

        return updatedReply;
    }
    async findById(replyId: string): Promise<Reply | null> {
        const reply = await this.ReplyModel.findById(replyId).exec();
        return reply;
    }
    async delete(replyId: string): Promise<void> {
        const deletedReply = await this.ReplyModel.findByIdAndDelete(replyId);

        if (!deletedReply) {
            throw new NotFoundException(`Reply with ID ${replyId} not found`);
        }
    }
}
