// comment.controller.ts
import { Body, Controller, Delete, Get, NotFoundException, Param, Post, Put } from '@nestjs/common';
import { CommentService } from './comment.service';
import { Reply } from 'src/reply/schema/reply.schema';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) { }

  // @Post()
  // async create(@Body() commentData: any) {
  //   return this.commentService.create(commentData);
  // }

  @Post(':documentId/:userId')
    async createComment(@Param('documentId') documentId: string, @Param('userId') userId: string,@Body('commentaire') comment: string) {
    try {
      const createdComment = await this.commentService.createWithDocumentIdUserId(documentId, userId, comment);
      return createdComment;
    } catch (error) {
      throw error;
    }
  }
  @Get(':iddoc')
  async showByDoc(@Param('iddoc') iddoc: string) {
    const comments = await this.commentService.findCommentByIdDoc(iddoc);
    return comments;
  }
  @Put(':id')
  async update(@Param('id') commentId: any, @Body() updatedData: any) {
    return this.commentService.update(commentId, updatedData);
  }

  @Get(':id/replies')
  async getRepliesByCommentId(@Param('id') commentId: string) {
    return this.commentService.findRepliesByCommentId(commentId);
  }

  @Delete(':id')
  async delete(@Param('id') commentId: string) {
    return this.commentService.delete(commentId);
  }

  // @Get(':id')
  // async show(@Param('id') commentId: string) {
  //   const comment = await this.commentService.findById(commentId);

  //   if (!comment) {
  //     throw new NotFoundException(`Comment with ID ${commentId} not found`);
  //   }

  //   return comment;
  // }


}
