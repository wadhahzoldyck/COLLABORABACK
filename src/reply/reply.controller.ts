import { Body, Controller, Delete, Get, NotFoundException, Param, Post, Put } from '@nestjs/common';
import { ReplyService } from './reply.service';
import { Reply } from './schema/reply.schema';
import { CommentDocument } from '../comment/schema/comment.schema';

@Controller('reply')
export class ReplyController {
    constructor(private readonly replyService: ReplyService) {}



    @Post(':commentId')
  async addReply(@Param('commentId') commentId: string, @Body() replyData: any): Promise<any> {
    try {
      const reply = await this.replyService.addReply(commentId, replyData);
      return { success: true, reply };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
  @Put(':id')
  async update(@Param('id') replyId: string, @Body() updatedData: any): Promise<any> {
      try {
          const updatedReply = await this.replyService.update(replyId, updatedData);
          return { success: true, updatedReply };
      } catch (error) {
          return { success: false, message: error.message };
      }
  }
  @Get(':id')
    async show(@Param('id') replyId: string): Promise<any> {
        try {
            const reply = await this.replyService.findById(replyId);

            if (!reply) {
                throw new NotFoundException(`Reply with ID ${replyId} not found`);
            }

            return { success: true, reply };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
    @Get('all/:id')
    async showAll(@Param('id') commentId: CommentDocument): Promise<Reply[]> {
      try {
        const replies = await this.replyService.findAll(commentId);
  
        if (!replies || replies.length === 0) {
          throw new NotFoundException(`Replies for comment with ID ${commentId} not found`);
        }
  
        return replies;
      } catch (error) {
        throw new NotFoundException(`Replies for comment with ID ${commentId} not found`);
      }
    }
    @Delete(':id')
    async delete(@Param('id') replyId: string): Promise<any> {
        try {
            await this.replyService.delete(replyId);
            return { success: true, message: 'Reply deleted successfully' };
        } catch (error) {
            if (error instanceof NotFoundException) {
                return { success: false, message: error.message };
            }
            return { success: false, message: 'An error occurred while deleting the reply' };
        }
    }
}
