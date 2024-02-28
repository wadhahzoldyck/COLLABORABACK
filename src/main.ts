import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import * as multer from 'multer';
import { ValidationPipe } from '@nestjs/common';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(multer({ dest: './uploads' }).single('file')); // Change dest to your desired upload directory
 app.useGlobalPipes(new ValidationPipe());


  await app.listen(3000);
}
bootstrap();
