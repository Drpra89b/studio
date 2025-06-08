
// src/pages/api/socket.ts
// This Pages API route is primarily to ensure the Socket.IO server is initialized
// on the main HTTP server instance when Next.js starts.
// Clients don't typically "call" this endpoint repeatedly for WebSocket communication;
// they connect directly to the WebSocket path specified in the Socket.IO server setup.

import type { Server as HTTPServer } from 'http';
import type { Socket as NetSocket } from 'net';
import type { NextApiRequest, NextApiResponse } from 'next';
import { initializeSocketServer } from '@/lib/socket-server'; // Using the singleton initializer

// Extend NextApiResponse to include the custom socket property which holds the server instance
interface NextApiResponseWithSocket extends NextApiResponse {
  socket: NetSocket & {
    server: HTTPServer & {
      io?: ReturnType<typeof initializeSocketServer>; // Type from our initializer
      ioInstanceAttached?: boolean; // Custom flag to ensure one-time attachment
    };
  };
}

export const config = {
  api: {
    bodyParser: false, // We don't need body parsing for this setup endpoint
  },
};

export default function socketHandler(req: NextApiRequest, res: NextApiResponseWithSocket) {
  if (req.method !== 'GET') {
    res.status(405).json({ message: 'Method Not Allowed' });
    return;
  }

  // Ensure Socket.IO is initialized and attached to the HTTP server instance only once.
  // The `res.socket.server` is the underlying Node.js HTTP server.
  if (res.socket.server && !res.socket.server.ioInstanceAttached) {
    console.log('Initializing Socket.IO server via /api/socket endpoint...');
    initializeSocketServer(res.socket.server);
    res.socket.server.ioInstanceAttached = true; // Mark as attached to prevent re-initialization
    console.log('Socket.IO server setup process completed via /api/socket.');
  } else {
    console.log('Socket.IO server already running or server object not available as expected.');
  }
  
  res.status(200).json({ message: 'Socket.IO server setup endpoint reached. If not already running, initialization was attempted.' });
}
