import { Game } from "./Game";
import { CheckoutType, Player, Throw } from "./types";

export class GameManager {
    private static instance: GameManager;
    private games: Map<string, Game> = new Map();

    private constructor() { }

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

    createGame(name: string, variant: number, checkoutType: CheckoutType, maxPlayers: number): Game {
        const newGame = new Game(name, variant, checkoutType, maxPlayers);
        this.games.set(newGame.id, newGame);
        console.log(`Game created: ${newGame.id} (Score: ${variant}, Max Players: ${maxPlayers})`);
        return newGame;
    }

    addPlayerToGame(gameId: string, playerId: string, nickname: string): Game | null {
        const game = this.getGame(gameId);
        if (!game) {
            console.log(`Game not found: ${gameId}`);
            return null;
        }
        const player = game.addPlayer(playerId, nickname);
        if (!player) {
            console.log(`Failed to add player ${nickname} to game ${gameId}`);
            return null;
        }
        console.log(`Player added: ${player.name} (${player.id}) to game ${game.id}`);
        return game;
    }

    removePlayerFromGame(gameId: string, playerId: string): Game | null {
        const game = this.getGame(gameId);
        if (!game) {
            console.log(`Game not found: ${gameId}`);
            return null;
        }
        const removed = game.removePlayer(playerId);
        if (!removed) {
            console.log(`Failed to remove player ${playerId} from game ${gameId}`);
            return null;
        }
        console.log(`Player removed: ${playerId} from game ${game.id}`);
        return game;
    }

    getGame(gameId: string): Game | undefined {
        return this.games.get(gameId);
    }

    getAllGames(): Game[] {
        return Array.from(this.games.values());
    }

    getAllWaitingGames(): Game[] {
        return Array.from(this.games.values()).filter(game => game.gameState === "waiting");
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

    getCurrentPlayer(gameId: string): Player | null {
        const game = this.getGame(gameId);
        if (!game) {
            return null;
        }
        return game.currentPlayer;
    }

    handleThrows(playerId: string, game: Game, throws: Throw[]): Game | { error: string } {
        if (game?.currentPlayer?.id !== playerId) {
            return { error: "It's not your turn!" };
        }
        if (game.gameState !== "playing") {
            return { error: "Game is not in progress!" };
        }
        if (throws.length !== 3) {
            return { error: "You must throw 3 darts!" };
        }

        const updatedGame = game.handleThrows(throws);        

        // Check if the game is finished
        if (updatedGame.gameState === "finished") {
            // Handle game finished logic here, e.g., notify players, clean up
            console.log(`Game ${game.id} finished. Winner: ${updatedGame.winner?.name}`);
            this.deleteGame(game.id);
        }
        return updatedGame;
    }
}