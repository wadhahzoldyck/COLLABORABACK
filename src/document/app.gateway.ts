// app.gateway.ts
import { InjectModel } from '@nestjs/mongoose';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Model } from 'mongoose';
import { Server, Socket } from 'socket.io';
import { Document } from './schema/document.schema';
import { Folder } from '../folder/schema/folder.schema';

const defaultValue = '';
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    @InjectModel(Document.name) private readonly documentModel: Model<Document>,
    @InjectModel(Folder.name) private readonly foldertModel: Model<Folder>,
  ) {}

  @WebSocketServer() server: Server;
  private documentRooms: Map<string, string[]> = new Map();

  private currenUser: any;

  async handleConnection(socket: Socket) {
    console.log(`Client connected: ${socket.id}`);

    // Check if this client ID is already connected
    if (this.documentRooms.has(socket.id)) {
      console.error(`Duplicate connection attempt by client: ${socket.id}`);
    } else {
      // If not, initialize data for this client
      this.documentRooms.set(socket.id, []);
    }
    socket.on('send-changes', (delta) => {
      console.log(delta);
      socket.to(socket.id).emit('receive-changes', delta);
    });

    socket.on('save-document', async (data) => {
      await this.handleSaveDocument(socket.id, data);
    });
  }

  async handleSaveDocument(documentId: string, data: any) {
    await this.documentModel.findByIdAndUpdate(documentId, { data });
  }

  async handleDisconnect(socket: Socket) {
    console.log(`Client disconnected: ${socket.id}`);

    // Clean up any data associated with this client
    if (this.documentRooms.has(socket.id)) {
      this.documentRooms.delete(socket.id);
    } else {
      console.error(`Disconnection reported for unknown client: ${socket.id}`);
    }
  }

  @SubscribeMessage('get-document')
  async handleGetDocument(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any,
  ) {
    const { documentId, docName, isAuth, idFolder } = data;
    console.log('l isAth');
    console.log(isAuth);
    const document = await this.findOrCreateDocument(
      documentId,
      docName,
      isAuth,
      idFolder,
    );

    client.join(documentId);
    client.emit('load-document', document);
    client.on('send-changes', (delta) => {
      client.to(documentId).emit('receive-changes', delta);
      client.on('save-document', async (data) => {
        console.log('haha    ' + data);
        await this.documentModel.findByIdAndUpdate(documentId, { data });
      });
    });
  }

  @SubscribeMessage('mouse-move')
  handleMouseMove(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any,
  ): void {
    const { documentId } = data;
    console.log('hedha l clien l connecta ', client.id);
    this.documentRooms.forEach((clients, documentId) => {
      console.log(`mosh kima had doc: ${documentId}, Clients: ${clients.join(', ')}`);
    });
    // Emit the mouse-move event to all clients in the room except the sender
    client.to(documentId).emit('mouse-move', data);
  }

  @SubscribeMessage('join-document')
  handleJoinDocument(
    @ConnectedSocket() client: Socket,
    @MessageBody() documentId: string,
  ): void {
    console.log(`Client ${client.id} joining document ${documentId}`);

    // Join room corresponding to the document ID
    client.join(documentId);

    // Add client to document room in the map
    const clientsInRoom = this.documentRooms.get(documentId) || [];
    if (!clientsInRoom.includes(client.id)) {
      clientsInRoom.push(client.id);
      this.documentRooms.set(documentId, clientsInRoom);
    }

    // Emit event to load document content to the client
    // You can implement this as needed
  }

  private addClientToRoom(documentId: string, clientId: string): void {
    const clients = this.documentRooms.get(documentId) || [];
    clients.push(clientId);
    this.documentRooms.set(documentId, clients);
  }

  @SubscribeMessage('get-create')
  async findOrCreateDocument(
    id: string,
    docName: string,
    user: any,
    idFolder: string,
  ) {
    console.log(idFolder);
    if (!id) return;

    try {
      // Check if the document already exists
      const existingDocument = await this.documentModel.findById(id).exec();
      if (existingDocument) {
        const { data } = existingDocument;
        return data; // Return existing document data
      }

      // Document doesn't exist, create a new one
      const newDocument = await this.documentModel.create({
        _id: id,
        data: defaultValue,
        documentName: docName,
        owner: user,
        folder: idFolder,
      });

      const { data } = newDocument;

      // Find the folder by ID and update its documents list with the new document
      const folder = await this.foldertModel.findById(idFolder).exec();
      if (folder) {
        folder.documents.push(newDocument._id); // Assuming documents is an array field in the folder model
        await folder.save(); // Save the updated folder
      }

      return data; // Return the data of the newly created document
    } catch (error) {
      console.error('Error creating or associating document:', error);
      throw error;
    }
  }
}
