import { Module } from '@nestjs/common';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';
import { AppGateway } from './app.gateway';
import { MongooseModule } from '@nestjs/mongoose';
import { DocumentSchema } from './schema/document.schema';
import { UserSchema } from '../auth/schema/user.schema';

import { FolderSchema } from '../folder/schema/folder.schema';
import { AccessSchema } from './schema/Access.schema';

@Module({
  controllers: [DocumentController],
  imports: [
    MongooseModule.forFeature([{ name: 'Document', schema: DocumentSchema }]),
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    MongooseModule.forFeature([{ name: 'Folder', schema: FolderSchema }]),
    MongooseModule.forFeature([{ name: 'Access', schema: AccessSchema }]),
  ],
  providers: [DocumentService, AppGateway],
})
export class DocumentModule {}
