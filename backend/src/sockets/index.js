import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

let io = null;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: { origin: config.frontendUrl, credentials: true }
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (token) {
        const payload = jwt.verify(token, config.jwtSecret);
        socket.userId = payload.id;
        socket.role = payload.role;
      }
      next();
    } catch {
      next(new Error('Avtorizatsiya xatoligi'));
    }
  });

  io.on('connection', (socket) => {
    if (socket.userId) {
      socket.join(`user_${socket.userId}`);
      if (socket.role === 'DRIVER') socket.join(`driver_${socket.userId}`);
      if (socket.role === 'ADMIN') socket.join('admin_live');
    }

    // Jonli kuzatuv uchun
    socket.on('subscribe_ride', (rideId) => socket.join(`ride_${rideId}`));

    // Haydovchi lokatsiya yangilanishi
    socket.on('driver_location', async (data) => {
      const { prisma } = await import('../config/prisma.js');
      const driver = await prisma.driver.findUnique({ where: { userId: socket.userId } });
      if (!driver) return;
      await prisma.driver.update({
        where: { id: driver.id },
        data: { currentLat: data.lat, currentLng: data.lng }
      });
      // Aktiv safari bor yo'lovchilarga joylashuvni yuborish
      io.to('admin_live').emit('driver_location', { driverId: driver.id, lat: data.lat, lng: data.lng });
    });

    socket.on('disconnect', () => {});
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error('Socket.IO ishga tushirilmagan');
  return io;
};