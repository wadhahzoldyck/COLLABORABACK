// folder.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Folder } from './schema/folder.schema';
import { CreateFolderDto } from './dto/folder.dto';

@Injectable()
export class FolderService {
  constructor(
    @InjectModel(Folder.name) private readonly folderModel: Model<Folder>,
  ) {}

  async create(createFolderDto: CreateFolderDto): Promise<Folder> {
    const createdFolder = new this.folderModel(createFolderDto);
    return createdFolder.save();
  }

  async findAll(): Promise<Folder[]> {
    return this.folderModel.find().exec();
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
      .findOneAndDelete({ _id: id })
      .exec();
    if (!deletedFolder) {
      throw new NotFoundException('Folder not found');
    }
    return deletedFolder;
  }
}
