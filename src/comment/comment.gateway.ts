import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, OnGatewayConnection, OnGatewayDisconnect, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class CommentGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private clients: Socket[] = [];

  handleConnection(client: Socket) {
    // Check if the client is already in the list
    const existingClient = this.clients.find((c) => c.id === client.id);
    if (!existingClient) {
      this.clients.push(client);
      console.log(`Client connected: ${client.id}`);
    }
  }
  

  handleDisconnect(client: Socket) {
    this.clients = this.clients.filter((c) => c.id !== client.id);
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('comment')
  handleComment(@MessageBody() comment: string, @ConnectedSocket() client: Socket): void {
    // Process the comment (e.g., save to database)

    // Broadcast the comment to all connected clients except the sender
    this.clients.forEach((c) => {
      if (c.id !== client.id) {
        console.log(c.id)
        c.emit('newComment', comment);
      }
    });
  }

  @SubscribeMessage('reply')
  handleReply(@MessageBody() commentID: string,@MessageBody() reply: string, @ConnectedSocket() client: Socket): void {
    // Process the reply (e.g., save to database)

    // Broadcast the reply to all connected clients except the sender
    this.clients.forEach((c) => {
      if (c.id !== client.id) {
        c.emit('newReply', reply,commentID);
      }
    });
  }
}
