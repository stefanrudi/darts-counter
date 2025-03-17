import { Game, GameType } from "../utils/types";
import {v4 as uuidv4} from 'uuid';

export class GameModel {
    private games: Map<string, Game> = new Map();

    // Create a new game
    createGame(gameType: GameType = "501"): Game {
        const gameId: string = uuidv4();

        const game: Game = {
            id: gameId,
            players: [],
            gameType,
            currentPlayerId: "",
            status: "waiting",
            scores: {},
            history: [],
            createdAt: Date.now()
        };

        this.games.set(gameId, game);
        return game;
    }
}

export const gameModel = new GameModel();