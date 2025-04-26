export type X01Variant = 501 | 301 | 101;
export type CheckoutType = "double" | "single";
export type GameState = "waiting" | "playing" | "finished";
export type Segment = string; // "S1", "D20", "T18", "25", "BULL"

export interface Throw {
  score: number;
  multiplier: number;
  totalScore: number;
  timestamp: string;
}

export interface Player {
  id: string;
  name: string;
  score: number;
  throws: Throw[];
}

export interface Game {
  id: string;
  name: string;
  startingScore: number;
  checkoutType: CheckoutType;
  maxPlayers: number;
  players: Player[];
  gameState: GameState;
  currentPlayerIndex: number;
}
