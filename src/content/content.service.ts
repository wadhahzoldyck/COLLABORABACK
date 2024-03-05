import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Content } from './schema/content.schema';

@Injectable()
export class ContentService {
  constructor(
    @InjectModel(Content.name) private readonly contentModel: Model<Content>,
  ) {}

  async uploadAttachment(attachmentUrl: string): Promise<Content> {
    const content = new this.contentModel({ attachmentUrl });
    return content.save();
  }

  async create(contentData: any): Promise<Content> {
    const createdContent = new this.contentModel(contentData);
    return createdContent.save();
  }

  async update(id: string, contentData: any): Promise<Content> {
    return this.contentModel
      .findByIdAndUpdate(id, contentData, { new: true })
      .exec();
  }

  async remove(id: string): Promise<Content> {
    return this.contentModel.findByIdAndDelete(id).exec();
  }
}
