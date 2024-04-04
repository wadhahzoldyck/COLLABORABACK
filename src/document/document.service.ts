// document.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Document, DocumentSchema } from './schema/document.schema'; // Ensure you're importing the Document and DocumentSchema from the correct file
import { AddUserToDocumentDto } from './dto/document.dto';

@Injectable()
export class DocumentService {
  constructor(
    @InjectModel(Document.name) private readonly documentModel: Model<Document>,
  ) {}

  async getDocumentById(id: string): Promise<Document> {
    const document = await this.documentModel.findById(id).exec();
    if (!document) {
      throw new NotFoundException(` with ID ${id} not found`);
    }
    return document;
  }

  async findByOwnerId(ownerId: string): Promise<Document[]> {
    try {
      const documents = await this.documentModel
        .find({
          $or: [
            { owner: ownerId }, // Check if ownerId matches the owner field
            { usersWithAccess: { $in: [ownerId] } }, // Check if ownerId exists in the usersWithAccess array
          ],
        })
        .populate('owner');

      return documents;
    } catch (error) {
      throw new NotFoundException(
        `Documents with owner ID ${ownerId} not found`,
      );
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
