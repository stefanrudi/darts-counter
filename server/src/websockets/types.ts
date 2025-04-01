import { GameType, Segment, X01Variant } from "../game/types";

export interface CreateGamePayload {
    nickname: string;
    gameType: GameType;
    variant?: X01Variant;
}

export interface JoinGamePayload {
    nickname: string;
    gameId: string;
}

export interface ThrowDartPayload {
    gameId: string;
    segment: Segment;
}