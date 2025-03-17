import WebSocket from 'ws';

interface Position {
  x: number;
  y: number;
}

interface X01Score {
  score: number;
  throws: { score: number; valid: boolean; bust: boolean }[];
  lastScore: number;
}

interface AroundTheClockScore {
  currentTarget: number;
  throws: { score: number; valid: boolean; bust: boolean }[];
  lastScore: number;
}

type Score = X01Score | AroundTheClockScore;

interface Game {
  id: string;
  players: string[];
  gameType: GameType;
  currentPlayerIndex: number;
  status: "waiting" | "playing" | "finished";
  scores: { [playerId: string]: Score };
  history: {
    playerId: string;
    position: Position;
    score: number;
    timestamp: number;
  }[];
  createdAt: number;
  winner?: string;
}

interface Player {
  ws: WebSocket;
  name: string;
}

interface AvailableGame {
  id: string;
  playerCount: number;
  gameType: GameType;
  createdAt: number;
}

type GameType = "501" | "around-the-clock";
