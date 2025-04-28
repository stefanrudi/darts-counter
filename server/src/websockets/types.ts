import { CheckoutType, Segment, Throw, X01Variant } from "../game/types";

export interface CreateGamePayload {
    gameName: string;
    nickname: string;
    variant: number;
    checkoutType: CheckoutType;
    maxPlayers: number;
    legsToWin: number;
}

export interface JoinGamePayload {
    nickname: string;
    gameId: string;
}

export interface LeaveGamePayload {
    gameId: string;
}

export interface ThrowDartPayload {
    gameId: string;
    throws: Throw[];
}