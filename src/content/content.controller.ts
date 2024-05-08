import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ContentService } from './content.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import * as fs from 'fs'; // Import the fs module
import * as path from 'path';
import { Content } from './schema/content.schema';
import { v2 as cloudinary } from 'cloudinary';
import { v4 as uuidv4 } from 'uuid';

import { Request, Response, query } from 'express';
import { CloudinaryService } from '../../CloudinaryService';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@ApiTags('Content Module')
@Controller('content')
export class ContentController {
  constructor(
    private readonly contentService: ContentService,
    private readonly cloudinaryService: CloudinaryService,
    @InjectModel(Content.name) private readonly contentModel: Model<Content>,
  ) {}

  @Post()
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
        },
        attachmentUrl: {
          type: 'string',
        },
      },
    },
  })
  async create(@Body() contentData: any) {
    return this.contentService.create(contentData);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() contentData: any) {
    return this.contentService.update(id, contentData);
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          cb(null, `${file.originalname}`);
        },
      }),
    }),
  )
  @ApiConsumes('multipart/form-data') // Specify that this endpoint consumes multipart/form-data
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Select file to upload',
        },
      },
    },
  })
  async uploadFile(@UploadedFile() file: any) {
    try {
      if (!file) {
        throw new Error('No file uploaded');
      }
      console.log('Uploaded file:', file);
      return 'success';
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new HttpException(
        'Failed to upload file',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('images')
  async getFiles(): Promise<string[]> {
    const files = await this.contentService.getFilesInUploadsFolder();
    return files;
  }

  @Get('findAllContent')
  async getAll(): Promise<Content[]> {
    const content = await this.contentService.findAll();
    return content;
  }

  @Post('createContent')
  @ApiConsumes('multipart/form-data') // Specify that this endpoint consumes multipart/form-data
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Select file to upload',
        },
        text: {
          type: 'string',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          cb(null, `${file.originalname}`);
        },
      }),
    }),
  )
  async createWithUpload(
    @Body() contentData: any,
    @UploadedFile() file: any,
  ): Promise<Content> {
    try {
      // Handle file upload
      let attachmentUrl: string;
      if (file) {
        attachmentUrl = file.path; // Assuming file.path contains the path to the uploaded file
      }

      // Create content
      const createdContent = await this.contentService.create({
        ...contentData,
        attachmentUrl,
      });

      return createdContent;
    } catch (error) {
      console.error('Error creating content with file upload:', error);
      throw new HttpException(
        'Failed to create content with file upload',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('/file')
  @ApiConsumes('multipart/form-data') // Specify that this endpoint consumes multipart/form-data
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Select file to upload',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = path.extname(file.originalname); // Use path.extname for better compatibility
          const filename = `${uniqueSuffix}${ext}`;
          callback(null, filename);
        },
      }),
    }),
  )
  async handleUpload(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    console.log('file:', file);

    // Handle cases where no file is uploaded
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
      // Save file path to the database using optional chaining
      const savedContent = await this.contentService.create({
        attachmentUrl: file?.filename, // Access filename only if file exists
      });

      // Use 201 Created for successful creation
      return res.status(201).json(savedContent); // Chain methods for clarity
    } catch (error) {
      console.error('Error saving content:', error);
      return res.status(500).json({ error: 'Failed to save content' });
    }
  }

  @Get('getFiles')
  async getAllFiles() {
    const files = fs.readdirSync('./uploads'); // Read files from your storage directory
    return files;
  }

  @Post('uploadOnCloud')
  @ApiConsumes('multipart/form-data') // Specify that this endpoint consumes multipart/form-data
  async uploadFileOnCloud(
    @UploadedFile() file: Express.Multer.File,
    @Body('userId') userId: string, // Receive userId from the request body
    @Req() req: Request,
    @Res() res: Response,
  ) {
    console.log(2);
    console.log(userId);
    const files = await this.cloudinaryService.uploadFile(file, userId);
    console.log(files);
    return res.status(200).json({ data: files });
  }

  @Get('getFromCloud')
  async getImages(
    @Req() req: Request,
    @Res() res: Response,
    @Query('userId') userId: string,
  ) {
    console.log(userId);
    const files = await this.cloudinaryService.fetchImagesCloudinary(userId);
    res.status(200).json({ data: files });
  }

  // @Delete(':id')
  // async deleteFile(
  //   @Param('id') fileId: string,
  //   @Req() req: Request,
  //   @Res() res: Response,
  // ) {
  //   const result = await this.contentService.deleteFile(fileId);
  //   console.log(fileId);
  //   return res.status(200).json({ data: result });
  // }

  @Delete(':id')
  async deleteFileFromCloud(@Param('id')id: string): Promise<void> {
    try {
      console.log(id);
      await cloudinary.uploader.  destroy(id);
    } catch (error) {
      throw new Error('Failed to delete file');
    }
  }

  @Get(':id/image')
  async getImageToText(@Param('id') id: string): Promise<any> {
    try {
      const doc = await this.contentModel.findById(id).exec();
      let TransformersApi = Function('return import("@xenova/transformers")')();

      const url = doc.attachmentUrl;


      console.log("Image:", url);

      // Transform the image to text
      const { pipeline } = await TransformersApi;
      const pipe = await pipeline('image-to-text');
      console.log("Text from image:", url);

      // // Convert image to JPG using sharp
      // const jpgBuffer = await sharp(Buffer.from(image, 'base64')).toFormat('jpeg').toBuffer();

      const result = await pipe(url);

      // Send the JPG image as response
      return result;
    } catch (error) {
      console.error("Error in getImageToText:", error);
    }
  }
}