export interface Position {
  x: number;
  y: number;
}

export interface X01Score {
  score: number;
  throws: { score: number; valid: boolean; bust: boolean }[];
  lastScore: number;
}

export interface AroundTheClockScore {
  currentTarget: number;
  throws: { score: number; valid: boolean; bust: boolean }[];
  lastScore: number;
}

export type Score = X01Score | AroundTheClockScore;

export interface Game {
  id: string;
  players: string[];
  gameType: GameType;
  currentPlayerId: string;
  status: "waiting" | "playing" | "finished";
  scores: { [playerId: string]: Score };
  history: GameThrow[];
  createdAt: number;
  winner?: string;
}

export interface GameThrow {
  playerId: string;
  position: Position;
  score: number;
  timestamp: number;
}

export interface Player {
  ws: WebSocket;
  name: string;
  isConnected: boolean;
  lastPing: number;
}

export interface AvailableGame {
  id: string;
  playerCount: number;
  gameType: GameType;
  createdAt: number;
}

export type GameType = "501" | "around-the-clock";

export interface WebSocketMessage {
  type: string;
  payload: any;
}

export type WebSocketStatus = "connecting" | "connected" | "disconnected" | "reconnecting";