import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment } from 'src/schema/comment.schema';

@Injectable()
export class CommentService {
    constructor(
        @InjectModel(Comment.name) private readonly commentModel: Model<Comment>,
      ) {}
    
    async create(CommentData: any): Promise<Comment> {
        const createdComment = new this.commentModel(CommentData);
        return createdComment.save();
      }
    async update(commentId: string, updatedData: any): Promise<Comment | null> {
        const updatedComment = await this.commentModel.findByIdAndUpdate(
            commentId,
            updatedData,
            { new: true } 
        );
        return updatedComment;
    }
    async delete(commentId: string): Promise<void> {
        const deletedComment = await this.commentModel.findByIdAndDelete(commentId);

        if (!deletedComment) {
            throw new NotFoundException(`Comment with ID ${commentId} not found`);
        }
    }

    async findById(commentId: string): Promise<Comment | null> {
        const comment = await this.commentModel.findById(commentId).exec();
        return comment;
    }
    async findAll(): Promise<Comment[]> {
        const comments = await this.commentModel.find().exec();
        return comments;
    }

}
