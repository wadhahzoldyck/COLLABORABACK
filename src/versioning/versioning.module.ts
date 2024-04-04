// versioning.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VersionController } from './version.controller';
import { Versioning, VersioningSchema } from './schema/versioning.schema';
import { DocumentModule } from '../document/document.module'; 
import { Document, DocumentSchema } from '../document/schema/document.schema'; 

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Versioning.name, schema: VersioningSchema }]),
    MongooseModule.forFeature([{ name: Document.name, schema: DocumentSchema }]), 
    DocumentModule,
  ],
  controllers: [VersionController],
})
export class VersioningModule {}
