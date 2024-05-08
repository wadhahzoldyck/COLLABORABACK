// cloudinary.service.ts

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { Content } from './src/content/schema/content.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
@Injectable()
export class CloudinaryService {
  constructor(
    @InjectModel(Content.name) private readonly contentModel: Model<Content>,
  ) {
    this.initializeCloudinary();
  }

  private initializeCloudinary() {
    cloudinary.config({
      cloud_name: 'dslwkudq1',
      api_key: '214372735791285',
      api_secret: 'oU_090rFYt9UmwyCUxT7HvY-0lk',
    });
  }

  async fetchImagesCloudinary(authenticatedUser: any) {
    try {
      const { resources } = await cloudinary.search
        .expression(`folder:collaboradoc AND tags:${authenticatedUser}`)
        .execute();

      const imagesData = resources.map((resource) => ({
        url: resource.secure_url,
        name: resource.filename,
        id: resource.public_id,
      }));
      return imagesData;
    } catch (error) {
      console.error('Error fetching images from Cloudinary:', error);
      throw error;
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    authenticatedUser: any,
  ): Promise<Content> {
    try {
      const tags = [authenticatedUser];
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'collaboradoc',
        resource_type: 'raw',
        public_id: `user-${authenticatedUser}-${file.originalname}`,
        tags: tags,
      });
      const fileUrl = result.secure_url;
      const publicId = result.public_id;
      const name = file.originalname;

      const savedFile = await this.contentModel.create({
        attachmentUrl: fileUrl,
        name: name,
        publicId: publicId,
        owner: authenticatedUser,
      });

      return savedFile;
    } catch (error) {
      console.error('Error uploading file to Cloudinary:', error);
      throw error;
    }
  }
}
