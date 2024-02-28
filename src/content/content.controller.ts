import { Body, Controller, Delete, Param, Post, Put, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ContentService } from './content.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Multer } from 'multer';

@Controller('content')
export class ContentController {


    constructor(private readonly contentService: ContentService) {}

    @Post()
    async create(@Body() contentData: any) {
      return this.contentService.create(contentData);
    }
  
    @Put(':id')
    async update(@Param('id') id: string, @Body() contentData: any) {
      return this.contentService.update(id, contentData);
    }
  
    @Delete(':id')
    async remove(@Param('id') id: string) {
      return this.contentService.remove(id);
    }

    @Post('upload')
    @UseInterceptors(FileInterceptor('files')) // Use 'file' for field name
    async uploadFile(@UploadedFile() file: Express.Multer.File) {
      const attachmentUrl = `/uploads/${file.filename}`;
      return this.contentService.uploadAttachment(attachmentUrl);
    }

}
