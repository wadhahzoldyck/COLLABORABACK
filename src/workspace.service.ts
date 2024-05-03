import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateWorkspaceDto } from './schema/createworkspace.dto';
import { Workspace } from './schema/workspace.schema';
import { UpdateWorkspaceDto } from './schema/updateworkspace.dto';
import { User } from '../auth/schema/user.schema';
import { Document } from '../document/schema/document.schema';

@Injectable()
export class WorkspaceService {
  constructor(
    @InjectModel(Workspace.name) private workspaceModel: Model<Workspace>,
    @InjectModel(User.name) private userMolde: Model<User>,
    @InjectModel(Document.name) private documentModel: Model<Document>,
  ) {}

  async create(createWorkspaceDto: CreateWorkspaceDto): Promise<Workspace> {
    createWorkspaceDto.accessCode = this.generateAccessCode();
    const newWorkspace = new this.workspaceModel(createWorkspaceDto);
    return newWorkspace.save();
  }

  async findAll(): Promise<Workspace[]> {
    return this.workspaceModel.find().exec();
  }

  async findOne(id: string): Promise<Workspace> {
    return this.workspaceModel.findById(id).exec();
  }

  async update(
    id: string,
    updateWorkspaceDto: UpdateWorkspaceDto,
  ): Promise<Workspace> {
    if (updateWorkspaceDto.accessCode === undefined) {
      updateWorkspaceDto.accessCode = this.generateAccessCode();
    }
    return this.workspaceModel
      .findByIdAndUpdate(id, updateWorkspaceDto, { new: true })
      .exec();
  }

  async delete(id: string): Promise<Workspace> {
    return this.workspaceModel.findByIdAndDelete(id).exec();
  }

  private generateAccessCode(): string {
    // Generate a random 6-digit code
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async addUserToWorkspace(
    userId: string,
    accessCode: string,
    idWorkspace: string,
  ): Promise<Workspace> {
    const workspace = await this.workspaceModel.findById(idWorkspace).exec();
    if (!workspace) {
      throw new Error(
        'Workspace with the provided access code does not exist.',
      );
    }
    const user = await this.userMolde.findById(userId).exec();

    if (!workspace.users.includes(user)) {
      workspace.users.push(user);
      return workspace.save();
    }
    return workspace;
  }

  async findWorkspacesByUser(userId: string): Promise<Workspace[]> {
    return this.workspaceModel
      .find({
        $or: [{ owner: userId }, { users: userId }],
      })
      .exec();
  }
}
