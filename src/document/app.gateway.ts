// app.gateway.ts
import { InjectModel } from '@nestjs/mongoose';
import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Model } from 'mongoose';
import { Server, Socket } from 'socket.io';
import { Document } from './schema/document.schema';

const defaultValue = "";
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})

export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    @InjectModel(Document.name) private readonly documentModel: Model<Document>,) { }



  @WebSocketServer() server: Server;

  async handleConnection(socket: Socket) {
    console.log(`Client connected: ${socket.id}`);

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
  }

  @SubscribeMessage('get-document')
  async handleGetDocument(client: Socket, documentId: string) {
    const document = await this.findOrCreateDocument(documentId);

    client.join(documentId);
    client.emit('load-document', document);
    client.on('send-changes', (delta) => {

      client.to(documentId).emit('receive-changes', delta); 
      client.on("save-document", async data => {

        console.log("haha    "+data)
        await this.documentModel.findByIdAndUpdate(documentId , {data}  )
      })

    });



  }



  @SubscribeMessage('get-create')
  async findOrCreateDocument(id: string) {
    if (!id) return;


    const document2 = await this.documentModel.findById(id).exec();
    if (document2) {
      const { data } = document2;
      return data
    }
    const document = await this.documentModel.create({ _id: id, data: defaultValue });
    const { data } = document;

    return data;
  }
}
