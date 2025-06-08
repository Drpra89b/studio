
// src/lib/socket-server.ts
import { Server as IOServer, Socket } from 'socket.io';
import type { Server as HTTPServer } from 'http';

let io: IOServer | null = null;

/**
 * Initializes the Socket.IO server instance or returns the existing one.
 * Attaches it to the provided HTTP server.
 * IMPORTANT: This singleton approach for 'io' works best in a single-process environment (like `next dev`
 * or traditional Node.js servers). In serverless environments (like Firebase App Hosting, Vercel),
 * each API route invocation might be a separate instance, making this shared 'io' instance unreliable
 * for broadcasting across all potential serverless function instances.
 * For robust serverless realtime, consider managed WebSocket services.
 */
export function initializeSocketServer(httpServer: HTTPServer): IOServer {
  if (!io) {
    io = new IOServer(httpServer, {
      path: '/api/socket_io', // Client will connect to this path for WebSocket
      addTrailingSlash: false,
      cors: {
        origin: "*", // Adjust in production for security
        methods: ["GET", "POST"]
      }
    });
    console.log('Socket.IO server initialized on path /api/socket_io');

    io.on('connection', (socket: Socket) => {
      console.log(`Socket.IO client connected: ${socket.id}`);
      
      socket.on('disconnect', () => {
        console.log(`Socket.IO client disconnected: ${socket.id}`);
      });

      // Example: A simple ping-pong to test connection
      socket.on('ping', () => {
        socket.emit('pong');
      });

      // Add more application-specific event handlers here if needed
      // e.g., socket.join('some-room');
    });
  } else {
    console.log('Socket.IO server already running.');
  }
  return io;
}

/**
 * Returns the existing Socket.IO server instance.
 * Returns null if the server has not been initialized.
 * Use this in other parts of your backend (e.g., API routes) to emit events.
 */
export function getSocketServer(): IOServer | null {
  if (!io) {
    console.warn('Socket.IO server instance has not been initialized. Call initializeSocketServer first.');
  }
  return io;
}
