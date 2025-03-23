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
  score: number;
  timestamp: number;
}

export interface AvailableGame {
  id: string;
  playerCount: number;
  gameType: GameType;
  createdAt: number;
}

export type GameType = "501" | "around-the-clock"; 