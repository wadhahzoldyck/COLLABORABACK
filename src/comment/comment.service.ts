// comment.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment, CommentDocument } from './schema/comment.schema';
import { Reply } from 'src/reply/schema/reply.schema';


@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comment.name) private readonly commentModel: Model<CommentDocument>,
  ) {}

  async create(commentData: any): Promise<Comment> {
    const createdComment = new this.commentModel(commentData);
    return createdComment.save();
  }

  async update(commentId: any, updatedData: any): Promise<Comment | null> {
    const updatedComment = await this.commentModel.findByIdAndUpdate(
      commentId,
      updatedData,
      { new: true },
    );
    return updatedComment;
  }
  async findRepliesByCommentId(commentId: string): Promise<Reply[]> {
    const comment = await this.commentModel.findById(commentId).populate('replies').exec();
    if (!comment) {
      throw new NotFoundException(`Comment with ID ${commentId} not found`);
    }
    return comment.replies;
  }
  async createCommentWithDocument(documentId: string, commentaire: string): Promise<Comment> {
    const createdComment = new this.commentModel({ commentaire, document: documentId });

    return await createdComment.save();
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
