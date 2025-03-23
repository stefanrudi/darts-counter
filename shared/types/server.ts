import { WebSocket } from 'ws';

export interface Player {
  ws: WebSocket;
  name: string;
  isConnected: boolean;
  lastPing: number;
} 