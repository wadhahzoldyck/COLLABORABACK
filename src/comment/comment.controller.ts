import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, Put } from '@nestjs/common';
import { CommentService } from './comment.service';

@Controller('comment')
export class CommentController {
    constructor(private readonly CommentService: CommentService) {}

    @Post()
    async create(@Body() CommentData: any) {
      return this.CommentService.create(CommentData);
    }
    @Put(':id')
    async update(@Param('id') commentId: string, @Body() updatedData: any) {
        return this.CommentService.update(commentId, updatedData);
    }
    @Delete(':id')
    async delete(@Param('id') commentId: string) {
        return this.CommentService.delete(commentId);
    }
    @Get(':id')
    async show(@Param('id') commentId: string) {
        const comment = await this.CommentService.findById(commentId);

        if (!comment) {
            throw new NotFoundException(`Comment with ID ${commentId} not found`);
        }

        return comment;
    }
    @Get()
    async showAll() {
        const comments = await this.CommentService.findAll();
        return comments;
    }
}
