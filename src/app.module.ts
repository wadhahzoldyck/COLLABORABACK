import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DocumentModule } from './document/document.module';
import { CommentModule } from './comment/comment.module';
import { ContentModule } from './content/content.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { VersionController } from './versioning/version.controller';

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
    AuthModule,
  ],
  controllers: [AppController,VersionController],
  providers: [AppService],
})
export class AppModule {}
