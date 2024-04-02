import { Module } from '@nestjs/common';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';
import { AppGateway } from './app.gateway';
import { MongooseModule } from '@nestjs/mongoose';
import { DocumentSchema } from './schema/document.schema';


@Module({
  controllers: [DocumentController],
  imports:[    MongooseModule.forFeature([{ name: 'Document', schema: DocumentSchema }]),
],
  providers: [DocumentService,AppGateway]
})
export class DocumentModule {}
