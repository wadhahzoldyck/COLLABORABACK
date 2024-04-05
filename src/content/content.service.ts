import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Content } from './schema/content.schema';
import * as fs from 'fs';
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
      name: item.name,
      publicId: item.publicId,
      attachmentUrl: item.attachmentUrl,
      data:item.data
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
      // Call Cloudinary API to fetch images (example: fetch all images)
      const { resources } = await cloudinary.search
        .expression('folder:collaboradoc') // Replace with your Cloudinary folder name
        .execute();

      // Extract URLs and file names from the resources
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
  async uploadFile(file: Express.Multer.File): Promise<Content> {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'collaboradoc',
        resource_type: 'raw',
      });
      const fileUrl = result.secure_url;
      const publicId = result.public_id; // Save this ID
      const name = result.original_filename;
      console.log('name of file :', name);
      console.log('publicId :', publicId);
      // Save the file URL to the database
      const savedFile = await this.contentModel.create({
        attachmentUrl: fileUrl,
        name: name,
        publicId: publicId,
      });
      console.log(savedFile);
      return savedFile; // Return the saved file object
    } catch (error) {
      console.error('Error uploading file to Cloudinary:', error);
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
