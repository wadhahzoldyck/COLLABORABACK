import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as multer from 'multer';
import { ValidationPipe } from '@nestjs/common';
import * as cookiesParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://localhost:3001',
      'http://localhost:3002',
    ],
    credentials: true,
  });

  app.use(multer({ dest: './uploads' }).single('file')); // Change dest to your desired upload directory

  app.useGlobalPipes(new ValidationPipe());

  app.use(cookiesParser());

  await app.listen(3000);
}

bootstrap();
