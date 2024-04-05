// document.controller.ts
import { Body, Controller, Get, NotFoundException, Param, Post } from '@nestjs/common';
import { DocumentService } from './document.service';
import { Document } from './schema/document.schema';
import { AddUserToDocumentDto } from './dto/document.dto';

@Controller('document')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}



  @Get('doc/:id')
  async getDocumentById(@Param('id') id: string): Promise<Document> {
    return this.documentService.getDocumentById(id);
  }

  @Get('folder/:id')
  async findByFolderId(@Param('id') folderid: string): Promise<Document[]> {
    const documents = await this.documentService.findByFolderId(folderid);

    return documents;
  }

  @Post('add-user')
  async addUserToDocument(@Body() dto: AddUserToDocumentDto) {
    return await this.documentService.addUserToDocument(dto);
  }

  @Get(':id/access-users')
  async getUsersWithAccess(@Param('id') id: string): Promise<string[]> {
    return this.documentService.getUsersWithAccess(id);
  }
}
