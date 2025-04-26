import { Game } from "./Game";
import { CheckoutType, X01Variant } from "./types";

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

    createGame(name: string, variant: X01Variant, checkoutType: CheckoutType, maxPlayers: number): Game {
        const newGame = new Game(name, variant, checkoutType, maxPlayers);
        this.games.set(newGame.id, newGame);
        console.log(`Game created: ${newGame.id} (Score: ${variant}, Max Players: ${maxPlayers})`);
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

    // Get all available games
    getAvailableGames(): Game[] {
        return Array.from(this.games.values()).filter(game => game.gameState === "waiting");
    }
}