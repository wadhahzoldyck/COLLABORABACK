// comment.gateway.ts
import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class CommentGateway {
  @WebSocketServer() server: Server;
  private clients: Socket[] = [];

  handleConnection(client: Socket) {
    this.clients.push(client);
  }

  handleDisconnect(client: Socket) {
    this.clients = this.clients.filter((c) => c.id !== client.id);
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
