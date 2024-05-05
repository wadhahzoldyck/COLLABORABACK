import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateWorkspaceDto } from './schema/createworkspace.dto';
import { Workspace } from './schema/workspace.schema';
import { UpdateWorkspaceDto } from './schema/updateworkspace.dto';
import { User } from '../auth/schema/user.schema';
import { Document } from '../document/schema/document.schema';
import { documents } from '../versioning/mock-data';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class WorkspaceService {
  constructor(
    @InjectModel(Workspace.name) private workspaceModel: Model<Workspace>,
    @InjectModel(User.name) private userMolde: Model<User>,
    @InjectModel(Document.name) private documentModel: Model<Document>,
    private mailerService: MailerService,
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
  async findWorkspacesByUser(userId: string): Promise<any> {
    // Fetch all workspaces where the user is either an owner or a user
    const workspaces = await this.workspaceModel
      .find({
        $or: [{ owner: userId }, { users: userId }],
      })
      .exec();

    // Collect all document IDs from the fetched workspaces
    const documentIds = workspaces.reduce((acc, workspace) => {
      // Assume workspace.documents is an array of document IDs
      return acc.concat(workspace.documents);
    }, []);

    // Fetch documents where their ID is in the collected document IDs
    const documents = await this.documentModel
      .find({
        _id: { $in: documentIds },
      })
      .exec();

    return { documents, workspaces };
  }

  async findWorkspacesAndDocumentsByUser(userId: string): Promise<any> {
    // Fetch all workspaces where the user is either an owner or a user
    const workspaces = await this.workspaceModel
      .find({
        $or: [{ owner: userId }, { users: { $in: [userId] } }],
      })
      .exec();

    if (workspaces.length === 0) {
      throw new NotFoundException('No workspaces found for the user');
    }

    // An array to collect promises for fetching documents of each workspace
    const documentsPromises = workspaces.map((workspace) =>
      this.documentModel
        .find({
          _id: { $in: workspace.documents },
        })
        .exec()
        .then((documents) => ({
          workspaceId: workspace._id,
          documents,
        })),
    );

    const documentsByWorkspace = await Promise.all(documentsPromises);

    return { workspaces, documentsByWorkspace };
  }

  async addUserToWorkspaceByAccessCode(
    userId: string,
    accessCode: string,
  ): Promise<Workspace> {
    const workspace = await this.workspaceModel.findOne({ accessCode });
    if (!workspace) {
      throw new NotFoundException(
        'Workspace not found with the provided access code.',
      );
    }

    const user = await this.userMolde.findById(userId).exec();

    if (workspace.users.includes(user._id)) {
      throw new BadRequestException('User already added to this workspace.');
    }

    workspace.users.push(user._id);
    await workspace.save();

    return workspace;
  }

  async addNewDocumentToWorkspace(
    workspaceId: string,
    docmentName: string,
    idowner: string,
    iddoc: string,
  ): Promise<any> {
    const workspace = await this.workspaceModel.findById(workspaceId);
    console.log(workspace);

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }
    const user = await this.userMolde.findById(idowner);
    if (!user) {
      throw new NotFoundException('user not found');
    }

    // Create a new document
    const newDocument = new this.documentModel({
      _id: iddoc,
      owner: user,
      data: '',
      documentName: docmentName,
    });
    const doc = await newDocument.save();
    workspace.documents.push(iddoc);
    const document = this.documentModel.findById(iddoc);
    await workspace.save();
    return document;
  }

  async sendAccessCodeByEmail(
    email: string,
    accessCode: string,
  ): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Your Access Code',
        html: `
          <h1>Your Access Code</h1>
          <p>Your access code is: <strong>${accessCode}</strong></p>
          <p>Use this access code to join the workspace.</p>
        `,
      });
    } catch (error) {
      console.error('Error sending access code email:', error);
      throw new Error('Failed to send access code email');
    }
  }
}
