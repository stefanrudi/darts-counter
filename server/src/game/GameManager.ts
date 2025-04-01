import { Game } from "./Game";
import { GameType, X01Variant } from "./types";

export class GameManager {
    private static instance: GameManager;
    private games: Map<string, Game> = new Map();

    private constructor() {}

    /**
     * 
     * @returns Singleton instance of GameManager 
     */
    public static getInstance(): GameManager {
        if (!GameManager.instance) {
            GameManager.instance = new GameManager();
        }
        return GameManager.instance;
    }

    createGame(type: GameType, variant?: X01Variant): Game {
        const newGame = new Game(type, variant);
        this.games.set(newGame.gameId, newGame);
        console.log(`Game created: ${newGame.gameId} of type ${type}${variant ? ` (${variant})` : ''}`);
        return newGame;
    }

    getGame(gameId: string): Game | undefined {
        return this.games.get(gameId);
    }

    getAllGames(): Game[] {
        return Array.from(this.games.values());
    }

    deleteGame(gameId: string): boolean {
        console.log(`Game deleted: ${gameId}`);
        return this.games.delete(gameId);
    }

    // Find game by player ID
    findGameByPlayerId(playerId: string): Game | undefined {
        for (const game of this.games.values()) {
            if (game.players.some(player => player.id === playerId)) {
                return game;
            }
        }
        return undefined;
    }
}