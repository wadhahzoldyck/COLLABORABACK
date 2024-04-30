// document.controller.ts
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { DocumentService } from './document.service';
import { Document } from './schema/document.schema';
import { AddUserToDocumentDto } from './dto/document.dto';
import { UserDataDTO } from '../auth/dto/userdata.dto';

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

  @Get('user/:userId')
  async getAllDocumentsForUser(
    @Param('userId') userId: string,
  ): Promise<Document[]> {
    return this.documentService.getDocumentsForUser(userId);
  }
  @Post('add-user')
  async addUserToDocument(@Body() dto: AddUserToDocumentDto) {
    const { documentId, userId, accessLevel } = dto;
    if (accessLevel !== 'readOnly' && accessLevel !== 'readWrite') {
      throw new BadRequestException('Invalid access level specified.');
    }
    return await this.documentService.addUserToDocument(
      { documentId, userId, accessLevel },
      accessLevel,
    );
  }

  @Get(':id/access-users')
  async getUsersWithAccess(
    @Param('id') id: string,
  ): Promise<{ userId: string; accessLevel: string }[]> {
    return this.documentService.getUsersWithAccess(id);
  }

  @Get('withoutFolder')
  async findDocumentsWithoutFolder(): Promise<Document[]> {
    return this.documentService.findDocumentsWithoutFolder();
  }

  // @Get(':id/access-usersdata')
  // async getUsersWithAccessname(@Param('id') id: string): Promise<UserDataDTO[]> {
  //   return this.documentService.getUsersWithAccessname(id);
  // }
}
