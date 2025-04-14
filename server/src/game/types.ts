export type GameType = "X01" | "AroundTheClock";
export type X01Variant = 501 | 301 | 101;
export type Segment = string; // "S1", "D20", "T18", "25", "BULL"

export interface Throws {
  score: number;
  multiplier: number;
  totalScore: number;
  timestamp: string;
}

export interface Player {
  id: string;
  name: string;
  score: number;
  throws: Throws[];
}

export interface Game {
  id: string;
  name: string;
  startingScore: number;
  checkoutType: "double" | "single";
  maxPlayers: number;
  players: Player[];
}
