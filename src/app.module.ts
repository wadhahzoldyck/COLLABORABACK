import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DocumentModule } from './document/document.module';
import { CommentModule } from './comment/comment.module';
import { ContentModule } from './content/content.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { ReplyModule } from './reply/reply.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { AuthModule } from './auth/auth.module';
import { VersioningModule } from './versioning/versioning.module';
import { VersionController } from './versioning/version.controller';
import { FolderModule } from './folder/folder.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.DB_URI),

    DocumentModule,
    CommentModule,
    ContentModule,
    ReplyModule,
    AuthModule,
    VersioningModule,
    FolderModule,
     ],

  controllers: [AppController],

  providers: [AppService],

})
export class AppModule {}
