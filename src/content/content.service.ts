import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Content } from './schema/content.schema';
import * as fs from 'fs';
import * as path from 'path';
import { v2 as cloudinary } from 'cloudinary';

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
      attachmentUrl: item.attachmentUrl,
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

  async uploadFile(file: Express.Multer.File) {
    try {
      const result = await cloudinary.uploader.upload(file.path, {folder:'collaboradoc'});
      return result.secure_url; // Return the URL of the uploaded file
    } catch (error) {
      console.error('Error uploading file to Cloudinary:', error);
      throw error;
    }
  }

  async fetchImages(): Promise<string[]> {
    try {
      // Call Cloudinary API to fetch images (example: fetch all images)
      const { resources } = await cloudinary.search
        .expression('folder:collaboradoc') // Replace with your Cloudinary folder name
        .execute();

      // Extract URLs from the resources
      const imageUrls = resources.map((resource) => resource.secure_url);
      return imageUrls;
    } catch (error) {
      console.error('Error fetching images from Cloudinary:', error);
      throw error;
    }
  }
}
