import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { ENV } from '../config/env';

let io: Server;

export const initSocket = (server: HttpServer): Server => {
  io = new Server(server, {
    cors: {
      origin: ENV.CLIENT_URL,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`⚡ Socket connected: ${socket.id}`);

    // Join room based on user ID
    socket.on('join_user', (userId: string) => {
      if (userId) {
        socket.join(`user:${userId}`);
        console.log(`Socket ${socket.id} joined user room: user:${userId}`);
      }
    });

    // Join room based on restaurant ID
    socket.on('join_restaurant', (restaurantId: string) => {
      if (restaurantId) {
        socket.join(`restaurant:${restaurantId}`);
        console.log(`Socket ${socket.id} joined restaurant room: restaurant:${restaurantId}`);
      }
    });

    // Join room for specific order tracking
    socket.on('join_order', (orderId: string) => {
      if (orderId) {
        socket.join(`order:${orderId}`);
        console.log(`Socket ${socket.id} joined order room: order:${orderId}`);
      }
    });

    socket.on('leave_order', (orderId: string) => {
      if (orderId) {
        socket.leave(`order:${orderId}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`⚡ Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error('Socket.io has not been initialized!');
  }
  return io;
};

export const emitOrderStatusUpdate = (orderId: string, userId: string, restaurantId: string, orderData: any) => {
  if (!io) return;
  // Emit to specific order channel
  io.to(`order:${orderId}`).emit('order_status_updated', orderData);
  // Emit to user's personal channel
  io.to(`user:${userId}`).emit('user_order_updated', orderData);
  // Emit to restaurant's channel
  io.to(`restaurant:${restaurantId}`).emit('restaurant_order_updated', orderData);
};

export const emitNewOrderNotification = (restaurantId: string, orderData: any) => {
  if (!io) return;
  io.to(`restaurant:${restaurantId}`).emit('new_order_placed', orderData);
  io.emit('super_admin_new_order', orderData);
};
