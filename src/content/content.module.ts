/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Content, ContentSchema } from './schema/content.schema';
import { CloudinaryService } from '../../CloudinaryService';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Content.name, schema: ContentSchema }]),
  ],
  controllers: [ContentController],
  providers: [ContentService, CloudinaryService], // Ensure ContentService is listed here
})
export class ContentModule {}
