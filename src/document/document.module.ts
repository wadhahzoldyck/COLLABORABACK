import { Module } from '@nestjs/common';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';
import { AppGateway } from './app.gateway';
import { MongooseModule } from '@nestjs/mongoose';
import { DocumentSchema } from './schema/document.schema';
import { UserSchema } from '../auth/schema/user.schema';


@Module({
  controllers: [DocumentController],
  imports:[    MongooseModule.forFeature([{ name: 'Document', schema: DocumentSchema },
]),
MongooseModule.forFeature([{ name: 'User', schema: UserSchema },
]),
],
  providers: [DocumentService,AppGateway],
  exports:[DocumentService]
})
export class DocumentModule {}
