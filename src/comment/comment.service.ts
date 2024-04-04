// comment.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Comment} from './schema/comment.schema';
import { Reply } from 'src/reply/schema/reply.schema';
import { Document } from '../document/schema/document.schema'; // Importez le modèle Document depuis le bon chemin
import { Types } from 'mongoose';
import { User } from '../auth/schema/user.schema';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comment.name) private readonly commentModel: Model<Comment>,
    @InjectModel(Document.name) private readonly documentModel: Model<Document>,
    @InjectModel(User.name) private readonly userModel: Model<User>, // Injection du modèle User

    ) {}
  async createWithDocumentIdUserId(docid:string, userId: string, comment:string): Promise<Comment> {
    try {
      // Vérifiez si le document existe réellement
      const document = await this.documentModel.findById(docid);
      if (!document) {
        throw new NotFoundException('Document not found');
      }

      // Recherchez l'utilisateur par son ID
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Créez le commentaire en associant le document et l'utilisateur
      const createdComment = new this.commentModel({
        commentaire: comment,
        document: document,
        owner: user,
      });

      return createdComment.save();
    } catch (error) {
      throw error;
    }
}

  
  
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
  async findCommentByIdDoc(iddoc: string): Promise<Comment[]> {
    const comments = await this.commentModel.find({ document: iddoc }).exec();
    return comments;
}

}
