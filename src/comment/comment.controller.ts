// comment.controller.ts
import { Body, Controller, Delete, Get, NotFoundException, Param, Post, Put, Query } from '@nestjs/common';
import { CommentService } from './comment.service';
import { Reply } from '../reply/schema/reply.schema';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) { }

  @Post(':documentId/:userId')
    async createComment(@Param('documentId') documentId: string, @Param('userId') userId: string,@Body('commentaire') comment: string,@Body('analyze') analyze: string) {
    console.log(analyze);
      try {
      const createdComment = await this.commentService.createWithDocumentIdUserId(documentId, userId, comment,analyze);
      return createdComment;
    } catch (error) {
      throw error;
    }
  }
  @Get('analyze')
  async analyzeText(@Query('text') text: string) {
  
    let TransformersApi  = Function('return import("@xenova/transformers")')();
  
    const { pipeline, env } = await TransformersApi;
    const pipe = await pipeline("text-classification","Xenova/distilbert-base-uncased-finetuned-sst-2-english");
  
    if (!text) {
      return { error: 'Text query parameter is required' };
    }
    const result = await pipe(text); 
  
    return result;
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
