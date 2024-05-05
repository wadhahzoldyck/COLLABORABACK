import { Workspace } from './../workspace/schema/workspace.schema';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Document, DocumentSchema } from './schema/document.schema'; // Ensure you're importing the Document and DocumentSchema from the correct file
import { AddUserToDocumentDto } from './dto/document.dto';
import { UserDataDTO } from '../auth/dto/userdata.dto';
import { User } from '../auth/schema/user.schema';

import { Folder } from '../folder/schema/folder.schema';
import { FilterDocumentDto } from './dto/FilterDocumentDto.dto';

@Injectable()
export class DocumentService {
  constructor(
    @InjectModel(Document.name) private readonly documentModel: Model<Document>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Folder.name) private readonly folderModel: Model<Folder>,
    @InjectModel(Workspace.name)
    private readonly workspaceModal: Model<Workspace>,
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
      const documentIds = folder.documents.map((doc) => doc.toString());

      // Fetch documents based on the extracted IDs
      const documents = await this.documentModel
        .find({ _id: { $in: documentIds } })
        .exec();

      return documents;
    } catch (error) {
      throw new NotFoundException(
        `Documents for folder with ID ${folderId} not found`,
      );
    }
  }

  async addUserToDocument(
    dto: AddUserToDocumentDto,
    accessLevel: 'readOnly' | 'readWrite',
  ): Promise<Document> {
    const { documentId, userId } = dto;

    // First, check if the user already exists in the document's access list
    const document = await this.documentModel.findById(documentId);
    if (!document) {
      throw new NotFoundException(`Document with ID ${documentId} not found`);
    }

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException(`Document with ID ${userId} not found`);
    }

    const userAccessIndex = document.usersWithAccess.findIndex(
      (access) => access.user.toString() === userId,
    );

    // If user is already in the list, update their access level, otherwise add them
    if (userAccessIndex > -1) {
      document.usersWithAccess[userAccessIndex].accessLevel = accessLevel;
    } else {
      document.usersWithAccess.push({ user: user, accessLevel: accessLevel });
    }

    return document.save();
  }

  async removeUserFromDocument(
    documentId: string,
    userId: string,
  ): Promise<Document> {
    const document = await this.documentModel.findById(documentId).exec();

    if (!document) {
      throw new NotFoundException(`Document with ID ${documentId} not found`);
    }

    const userIndex = document.usersWithAccess.findIndex(
      (access) => access.user.toString() === userId,
    );

    if (userIndex > -1) {
      document.usersWithAccess.splice(userIndex, 1);
      await document.save();
      return document;
    } else {
      throw new NotFoundException(
        `User with ID ${userId} not found in document`,
      );
    }
  }

  async getUsersWithAccess(
    documentId: string,
  ): Promise<{ userId: string; accessLevel: string }[]> {
    const document = await this.documentModel
      .findById(documentId)
      .populate('usersWithAccess.user')
      .exec();

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return document.usersWithAccess.map((access) => ({
      userId: access.user._id.toString(),
      accessLevel: access.accessLevel,
    }));
  }

  async findDocumentsBasedOnUserAccess(userId: string): Promise<Document[]> {
    try {
      // Fetch all document IDs from workspaces
      const workspaces = await this.workspaceModal.find().exec();
      const documentIdsInWorkspaces = new Set(
        workspaces.flatMap(workspace => workspace.documents),
      );
  
      // Query for documents where the user is either an owner (of documents without a folder)
      // or is listed in the usersWithAccess regardless of the folder status
      const documents = await this.documentModel
        .find({
          _id: { $nin: Array.from(documentIdsInWorkspaces) }, // Exclude documents that are in any workspace
          $or: [
            { owner: userId, folder: null }, // User is the owner and document is not in a folder
            { 'usersWithAccess.user': userId } // User is in the access list (regardless of folder)
          ]
        })
        .populate({
          path: 'usersWithAccess.user',
          model: 'User'
        })
        .exec();
  
      if (documents.length === 0) {
        throw new NotFoundException(
          'No accessible documents found based on user ID criteria: ownership without folder or listed in access list.'
        );
      }
  
      return documents;
    } catch (error) {
      throw new NotFoundException(`Failed to find documents: ${error.message}`);
    }
  }
  



  async updateDocument(
    documentId: string,
    updateDto: any,
    userId: string,
  ): Promise<Document> {
    const document = await this.documentModel.findById(documentId);
    if (!document) {
      throw new NotFoundException(`Document with ID ${documentId} not found`);
    }

    const hasReadWriteAccess = document.usersWithAccess.some(
      (access) =>
        access.user.toString() === userId && access.accessLevel === 'readWrite',
    );

    if (!hasReadWriteAccess) {
      throw new Error(
        'Access Denied: User does not have readWrite permissions',
      );
    }

    Object.assign(document, updateDto);
    return document.save();
  }

  async getDocumentsForUser(userId: string): Promise<Document[]> {
    return this.documentModel
      .find({
        $or: [{ owner: userId }, { 'usersWithAccess.user': userId }],
      })
      .populate('owner')
      .populate({
        path: 'usersWithAccess.user',
        model: 'User',
      })
      .lean()
      .exec();
  }
  async getDocumentsByDateRange(
    filterDto: FilterDocumentDto,
    userId: string,
  ): Promise<Document[]> {
    const { startDate, endDate } = filterDto;
    const documents = await this.documentModel
      .find({
        $and: [
          {
            createdAt: {
              $gte: new Date(startDate),
              $lte: new Date(endDate),
            }
          },
          {
            $or: [
              { owner: userId },
              { 'usersWithAccess.user': userId }
            ]
          }
        ]
      })
      .populate('owner')
      .populate({
        path: 'usersWithAccess.user',
        model: 'User',
      })
      .lean()
      .exec();
  
    if (!documents.length) {
      throw new NotFoundException('No documents found within the given date range for the specified user');
    }
  
    return documents;
  }
  

  async updateAccess(
    idDoc: string,
    idUser: string,
    newAccessLevel: 'readOnly' | 'readWrite',
  ) {
    const document = await this.documentModel
      .findById(idDoc)
      .populate('usersWithAccess.user');
    if (!document) {
      throw new NotFoundException(`Document with ID ${idDoc} not found`);
    }

    const userIndex = document.usersWithAccess.findIndex(
      (access) => access.user._id.toString() === idUser,
    );

    if (userIndex !== -1) {
      document.usersWithAccess[userIndex].accessLevel = newAccessLevel;
    } else {
      throw new NotFoundException(
        `User with ID ${idUser} not found in document`,
      );
    }

    await document.save();
    return document;
  }
}
