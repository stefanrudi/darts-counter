export type GameType = 'X01' | 'AroundTheClock';
export type X01Variant = 501 | 301 | 101;
export type Segment = string; // "S1", "D20", "T18", "25", "BULL"

export interface PlayerState {
    id: string; // Corresponds to socket.id
    nickname: string;
    score: number; // Current score (for X01)
    currentNumber?: number; // Current target for Around The Clock
    hits?: Set<number>; // Numbers hit in Around The Clock
    order: number; // Turn order
}

export interface ThrowAttempt {
    player: PlayerState;
    segment: Segment;
    scoreValue: number;
    isBust?: boolean;
    isWin?: boolean;
}

export interface GameState {
    gameId: string;
    gameType: GameType;
    variant?: X01Variant; // For X01
    players: PlayerState[];
    currentPlayerIndex: number;
    dartsThrownThisTurn: number;
    isGameOver: boolean;
    winner?: PlayerState;
    lastThrow?: ThrowAttempt;
}