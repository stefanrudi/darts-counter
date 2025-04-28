export type X01Variant = 501 | 301 | 101;
export type CheckoutType = "double" | "single";
export type GameState = "waiting" | "playing" | "finished";
export type Segment = string; // "S1", "D20", "T18", "25", "BULL"

export interface Throw {
  score: number;
  multiplier: number;
  totalScore: number;
  timestamp: string;  
  valid?: boolean;
}

export interface Player {
  id: string;
  name: string;
  score: number;
  throws: Throw[];
  legsWon: number;
}

export interface GameInterface {
  id: string;
  name: string;
  startingScore: number;
  checkoutType: CheckoutType;
  maxPlayers: number;
  bestOf: number;
  currentLeg: number;
  players: Player[];
  gameState: GameState;
  currentPlayer: Player | null;
  winner?: Player;
}
