// document.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Document, DocumentSchema } from './schema/document.schema'; // Ensure you're importing the Document and DocumentSchema from the correct file
import { AddUserToDocumentDto } from './dto/document.dto';
import { Folder } from '../folder/schema/folder.schema';

@Injectable()
export class DocumentService {
  constructor(
    @InjectModel(Document.name) private readonly documentModel: Model<Document>,
    @InjectModel(Folder.name) private readonly folderModel: Model<Folder>,

  ) {}

  async getDocumentById(id: string): Promise<Document> {
    const document = await this.documentModel.findById(id).exec();
    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }
    return document;
  }

  async findByFolderId(folderId: string): Promise<Document[]> {
    try {
      // Find the folder document by its ID
      const folder = await this.folderModel.findById(folderId).exec();
  
      // If folder not found, throw NotFoundException
      if (!folder) {
        throw new NotFoundException(`Folder with ID ${folderId} not found`);
      }
  
      // Extract document IDs from the folder
      const documentIds = folder.documents.map(doc => doc.toString());
  
      // Fetch documents based on the extracted IDs
      const documents = await this.documentModel.find({ _id: { $in: documentIds } }).exec();
  
      return documents;
    } catch (error) {
      throw new NotFoundException(`Documents for folder with ID ${folderId} not found`);
    }
  }
  

  async addUserToDocument(dto: AddUserToDocumentDto): Promise<Document> {
    console.log('hedhi dto');
    console.log(dto);
    const { documentId, userId } = dto;
    return await this.documentModel
      .findByIdAndUpdate(
        documentId,
        { $push: { usersWithAccess: userId } },
        { new: true },
      )
      .exec();
  }

  async getUsersWithAccess(documentId: string): Promise<string[]> {
    const document = await this.documentModel
      .findById(documentId)
      .select('usersWithAccess')
      .exec();
    if (!document) {
      throw new NotFoundException('Document not found');
    }
    return document.usersWithAccess.map((user) => user._id.toString);
  }
}
