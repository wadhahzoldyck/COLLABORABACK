// folder.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Folder } from './schema/folder.schema';
import { CreateFolderDto } from './dto/folder.dto';
import { Document } from '../document/schema/document.schema';

@Injectable()
export class FolderService {
  constructor(
    @InjectModel(Folder.name) private readonly folderModel: Model<Folder>,
    @InjectModel(Document.name) private readonly documentModel: Model<Document>,
  ) {}

  async create(createFolderDto: CreateFolderDto): Promise<Folder> {
    const createdFolder = new this.folderModel(createFolderDto);
    return createdFolder.save();
  }

  async findAll(ownerId: string): Promise<Folder[]> {
    return this.folderModel.find({ owner: ownerId }).exec();
  }

  async findOne(id: string): Promise<Folder> {
    const folder = await this.folderModel.findById(id).exec();
    if (!folder) {
      throw new NotFoundException('Folder not found');
    }
    return folder;
  }

  async update(id: string, updateFolderDto: CreateFolderDto): Promise<Folder> {
    const updatedFolder = await this.folderModel
      .findByIdAndUpdate(id, updateFolderDto, { new: true })
      .exec();
    if (!updatedFolder) {
      throw new NotFoundException('Folder not found');
    }
    return updatedFolder;
  }

  async remove(id: string): Promise<Folder> {
    const deletedFolder = await this.folderModel
      .findByIdAndDelete(id)
      .exec();
    if (!deletedFolder) {
      throw new NotFoundException('Folder not found');
    }
    await this.documentModel.deleteMany({ folder: id }).exec();

    return deletedFolder;
  }

  async moveDocumentsToFolder(folderId: string, documentIds: string[]): Promise<Folder> {
    const folder = await this.folderModel.findById(folderId);
    if (!folder) {
      throw new NotFoundException('Folder not found');
    }
  
    // Ajoutez les nouveaux documentIds à la liste existante des documents du dossier
    folder.documents = [...folder.documents, ...documentIds];
  
    // Mettez à jour l'attribut de dossier de chaque document
    for (const documentId of documentIds) {
      const document = await this.documentModel.findById(documentId);
      if (document) {
        document.folder = folder; // Attribuer l'objet Folder, pas seulement l'ID
        await document.save();
      }
    }
  
    await folder.save();
    return folder;
  }
}
