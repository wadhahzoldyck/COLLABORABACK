import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Content } from './schema/content.schema';
import * as fs from 'fs';
import * as path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import { json } from 'stream/consumers';

@Injectable()
export class ContentService {
  constructor(
    @InjectModel(Content.name) private readonly contentModel: Model<Content>,
  ) {}

  async create(contentData: any): Promise<Content> {
    const createdContent = new this.contentModel(contentData);
    return createdContent.save();
  }

  async findAll(): Promise<Content[]> {
    const content = await this.contentModel.find();
    return content.map((item) => ({
      text: item.text,
      name: item.name,
      attachmentUrl: item.attachmentUrl,
      owner: item.owner,
    }));
  }

  async findAllImg(): Promise<Content[]> {
    return this.contentModel.find();
  }

  async update(id: string, contentData: any): Promise<Content> {
    return this.contentModel
      .findByIdAndUpdate(id, contentData, { new: true })
      .exec();
  }

  async remove(id: string): Promise<Content> {
    return this.contentModel.findByIdAndDelete(id).exec();
  }

  async getFilesInUploadsFolder(): Promise<string[]> {
    const uploadsPath = 'uploads'; // Adjust path if needed

    try {
      const files = await fs.promises.readdir(uploadsPath);
      return files;
    } catch (error) {
      console.error('Error reading uploads folder:', error);
      return [];
    }
  }
  async fetchImages() {
    try {
      const { resources } = await cloudinary.search
        .expression('folder:collaboradoc')
        .execute();

      const imagesData = resources.map((resource) => ({
        url: resource.secure_url,
        name: resource.filename,
        id: resource.public_id,
      }));

      console.log('imagesData', imagesData);
      return imagesData;
    } catch (error) {
      console.error('Error fetching images from Cloudinary:', error);
      throw error;
    }
  }

  async deleteFile(fileId: string): Promise<Content> {
    // Find the file in your database
    const file = await this.contentModel.findById(fileId);
    console.log(fileId);
    if (!file) {
      throw new NotFoundException('File not found');
    }

    // Delete the file information from your database
    const data = await this.contentModel.findByIdAndDelete(fileId);

    return data;
  }
}
