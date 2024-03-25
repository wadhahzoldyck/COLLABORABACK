import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ port: 3002 })
export class CommentGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private clients: Socket[] = [];

  handleConnection(client: Socket) {
    this.clients.push(client);
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.clients = this.clients.filter((c) => c.id !== client.id);
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('comment')
  handleComment(@MessageBody() comment: string): void {
    // Process the comment (e.g., save to database)

    // Broadcast the comment to all connected clients
    this.clients.forEach((client) => {
      client.emit('newComment', comment);
    });
  }
}
