import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
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

import { Request, Response } from 'express';

@ApiTags('Content Module')
@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

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
          const filename = `${file.originalname}`;
          console.log(filename)
          callback(null, filename);
        },
      }),
    }),
  )
  async uploadFileOnCloud(@UploadedFile() file: Express.Multer.File,@Req() req: Request,
  @Res() res: Response) {
    const files = await this.contentService.uploadFile(file);
    console.log(files)
    return res.status(200).json({ data:files });;
  }

  @Get('getFromCloud')
  async getImages(@Req() req: Request,
  @Res() res: Response){
   const files = await this.contentService.fetchImages();
   console.log("files: ",files)
    res.status(200).json({data:files})
  }

  @Delete(':id')
  async deleteFile(@Param('id') fileId: string,@Req() req: Request,
  @Res() res: Response) {

      const result = await this.contentService.deleteFile(fileId);
      console.log(fileId);
       return res.status(200).json({ data:result });;
 
  }

  @Delete('deleteFile/:id')
  async deleteFileFromCloud(@Param('id') fileId: string): Promise<void> {
    try {
      // Use Cloudinary SDK or API to delete the file
      await cloudinary.uploader.destroy(fileId);
      // Handle successful deletion
    } catch (error) {
      // Handle deletion error
      throw new Error('Failed to delete file');
    }
  }
}
