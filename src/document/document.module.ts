import { Module } from '@nestjs/common';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';
import { AppGateway } from './app.gateway';
import { MongooseModule } from '@nestjs/mongoose';
import { DocumentSchema } from './schema/document.schema';
import { FolderSchema } from '../folder/schema/folder.schema';
import { ContentModule } from '../content/content.module';

@Module({
  controllers: [DocumentController],
  imports: [
    MongooseModule.forFeature([{ name: 'Document', schema: DocumentSchema }]),
    MongooseModule.forFeature([{ name: 'Folder', schema: FolderSchema }]),
    MongooseModule.forFeature([{ name: 'Content', schema: ContentModule }]),
  ],
  providers: [DocumentService, AppGateway],
})
export class DocumentModule {}
