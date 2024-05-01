import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { CreateWorkspaceDto } from './schema/createworkspace.dto';
import { UpdateWorkspaceDto } from './schema/updateworkspace.dto';

@Controller('workspaces')
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @Post()
  async create(@Body() createWorkspaceDto: CreateWorkspaceDto) {
    return this.workspaceService.create(createWorkspaceDto);
  }

  @Get()
  async findAll() {
    return this.workspaceService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.workspaceService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateWorkspaceDto: UpdateWorkspaceDto,
  ) {
    return this.workspaceService.update(id, updateWorkspaceDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await this.workspaceService.delete(id);
  }

  @Post(':id/users/:userId')
  async addUserToWorkspace(
    @Param('userId') userId: string,
    @Param('id') workspaceId: string,
    @Body('accessCode') accessCode: string,
  ) {
    return this.workspaceService.addUserToWorkspace(
      userId,
      accessCode,
      workspaceId,
    );
  }

  @Get('by-user/:userId')
  async findWorkspacesByUser(@Param('userId') userId: string) {
    return this.workspaceService.findWorkspacesByUser(userId);
  }
}
