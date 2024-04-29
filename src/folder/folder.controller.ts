import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  NotFoundException,
} from '@nestjs/common';
import { FolderService } from './folder.service';
import { CreateFolderDto } from './dto/folder.dto';
import { Folder } from './schema/folder.schema';

@Controller('folders')
export class FolderController {
  constructor(private readonly folderService: FolderService) {}

  @Post()
  async create(@Body() createFolderDto: CreateFolderDto): Promise<Folder> {
    return this.folderService.create(createFolderDto);
  }

  @Get(':id')
  async findAll(@Param('id') idowner: string): Promise<Folder[]> {
    return this.folderService.findAll(idowner);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Folder> {
    try {
      return await this.folderService.findOne(id);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @Put('update/:id')
  async update(
    @Param('id') id: string,
    @Body() updateFolderDto: CreateFolderDto,
  ): Promise<Folder> {
    try {
      return await this.folderService.update(id, updateFolderDto);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<Folder> {
    try {
      return await this.folderService.remove(id);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
}
