import { io } from 'socket.io-client';

let socket = null;

export const connectSocket = (token) => {
  if (socket) socket.disconnect();
  socket = io('/', { auth: { token }, transports: ['websocket', 'polling'] });
  return socket;
};

export const getSocket = () => socket;
export const disconnectSocket = () => { if (socket) socket.disconnect(); socket = null; };