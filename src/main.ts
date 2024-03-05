import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as multer from 'multer';
import { ValidationPipe } from '@nestjs/common';
import * as cookiesPaser from 'cookie-parser';



async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ['http://localhost:5173'],
    credentials: true,
  });
    app.use(multer({ dest: './uploads' }).single('file')); // Change dest to your desired upload directory

  app.useGlobalPipes(new ValidationPipe());
  app.use(cookiesPaser());

  await app.listen(3000);
}
bootstrap();
