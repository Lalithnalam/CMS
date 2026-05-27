import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { TripsService } from './trips.service';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/trips',
})
export class TripsGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly tripsService: TripsService) {}

  @SubscribeMessage('subscribeUnit')
  handleSubscribeUnit(@MessageBody() unitId: string, @ConnectedSocket() client: Socket) {
    client.join(unitId);
    return { event: 'subscribed', data: unitId };
  }

  // Emits real-time updates to all connected clients for a unit
  emitTripUpdate(unitId: string, trip: any) {
    this.server.to(unitId).emit('tripUpdate', trip);
  }
}
