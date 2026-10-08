import http from 'http';
import app from './app';
import { ENV } from './config/env';
import { initSocket } from './services/socket.service';

const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);

const PORT = ENV.PORT;

server.listen(PORT, () => {
  console.log(`🚀 Server running in ${ENV.NODE_ENV} mode on port ${PORT}`);
  console.log(`📚 OpenAPI documentation available at http://localhost:${PORT}/api/docs`);
  console.log(`⚡ Socket.IO real-time server ready`);
});
