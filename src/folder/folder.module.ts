import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FolderService } from './folder.service';
import { FolderController } from './folder.controller';
import { Folder, FolderSchema } from './schema/folder.schema'; // Assuming FolderSchema is exported from your schema file

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Folder.name, schema: FolderSchema }]),
  ],
  providers: [FolderService],
  controllers: [FolderController],
})
export class FolderModule {}
