import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import * as cors from 'cors';
import { v2 as cloudinary } from 'cloudinary';


import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as multer from 'multer';

import * as cookiesPaser from 'cookie-parser';
async function bootstrap() {

  cloudinary.config({
    cloud_name: 'dslwkudq1',
    api_key: '214372735791285',
    api_secret: 'oU_090rFYt9UmwyCUxT7HvY-0lk',
  });
  
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
   
  const config = new DocumentBuilder()
    .setTitle('COLLABORADOCS TEST API')
    .setVersion('1.0')
    .build();
  app.use(cors());
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  app.enableCors({
    origin: '*',
    credentials: true,
  });
    app.use(multer({ dest: './uploads' }).single('file')); // Change dest to your desired upload directory

 
  app.use(cookiesPaser());
  await app.listen(3000);
}
bootstrap();
