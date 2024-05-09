// document.controller.ts
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { DocumentService } from './document.service';
import { Document } from './schema/document.schema';
import { AddUserToDocumentDto } from './dto/document.dto';
import { UserDataDTO } from '../auth/dto/userdata.dto';
import { FilterDocumentDto } from './dto/FilterDocumentDto.dto';

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

  @Delete(':documentId/users/:userId')
  async removeUserFromDocument(
    @Param('documentId') documentId: string,
    @Param('userId') userId: string,
  ): Promise<void> {
    try {
      await this.documentService.removeUserFromDocument(documentId, userId);
    } catch (error) {
      if (error.status === 404) {
        throw new NotFoundException(error.response);
      }
      throw error;
    }
  }

  @Get('/filter-by-date/:userId')
  async getDocumentsByDateRange(
    @Query() filterDto: FilterDocumentDto,
    @Param('userId') userId: string,
  ): Promise<Document[]> {
    return this.documentService.getDocumentsByDateRange(filterDto, userId);
  }

  @Get(':id/access-users')
  async getUsersWithAccess(
    @Param('id') id: string,
  ): Promise<{ userId: string; accessLevel: string }[]> {
    return this.documentService.getUsersWithAccess(id);
  }

  @Get('withoutFolder/:iduser')
  async findDocumentsWithoutFolder(
    @Param('iduser') userId: string,
  ): Promise<Document[]> {
    return this.documentService.findDocumentsBasedOnUserAccess(userId);
  }

  @Patch(':idDoc/users/:idUser/access')
  async updateDocumentAccess(
    @Param('idDoc') idDoc: string,
    @Param('idUser') idUser: string,
    @Body('accessLevel') accessLevel: 'readOnly' | 'readWrite',
  ) {
    if (!['readOnly', 'readWrite'].includes(accessLevel)) {
      throw new BadRequestException(
        'Invalid access level. Valid values are "readOnly" or "readWrite".',
      );
    }

    try {
      const updatedDocument = await this.documentService.updateAccess(
        idDoc,
        idUser,
        accessLevel,
      );
      return {
        message: 'Access level updated successfully',
        data: updatedDocument,
      };
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @Delete(':documentId')
  async deleteDocument(@Param('documentId') documentId: string): Promise<void> {
    try {
      await this.documentService.deleteDocument(documentId);
    } catch (error) {
      if (error.status === 404) {
        throw new NotFoundException(`Document with ID ${documentId} not found`);
      } else {
        throw new HttpException(
          'Failed to delete the document',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @Put(':id')
  async updateDocumentName(
    @Param('id') documentId: string,
    @Body('name') newName: string,
  ) {
    try {
      const updatedDocument = await this.documentService.updateDocumentname(
        documentId,
        newName,
      );
      return updatedDocument;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  // @Get(':id/access-usersdata')
  // async getUsersWithAccessname(@Param('id') id: string): Promise<UserDataDTO[]> {
  //   return this.documentService.getUsersWithAccessname(id);
  // }
}
