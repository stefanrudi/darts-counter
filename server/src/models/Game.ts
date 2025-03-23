import { Game, GameType } from "../utils/types";
import { v4 as uuidv4 } from "uuid";

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
      createdAt: Date.now(),
    };

    this.games.set(gameId, game);
    return game;
  }

  /**
   * Add player to game
   * @param gameId
   * @param playerId
   * @returns
   */
  addPlayer(gameId: string, playerId: string): Game | null {
    const game: Game | undefined = this.games.get(gameId);
    if (!game) return null;
  
    if (!game.players.includes(playerId)) {
      game.players.push(playerId);
      game.scores[playerId] = { score: 501, throws: [], lastScore: 0 };
    }
  
    if (game.players.length >= 2 && game.status === "waiting") {
      game.status = "playing";
      game.currentPlayerId = game.players[0];
    }
  
    return game;
  }

  getAllGames() {
    return this.games.values();
  }

  getGame(gameId: string): Game | undefined {
    return this.games.get(gameId);
  }

  deleteGame(gameId: string): void {
    this.games.delete(gameId);
  }
}

export const gameModel = new GameModel();
