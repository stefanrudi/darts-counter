import { Player } from "../utils/types";
import { v4 as uuidv4 } from "uuid";
import { WebSocket } from "ws";

export class PlayerModel {
  private players: Map<string, Player> = new Map();

  // Create a new player
  createPlayer(playerId: string, ws: WebSocket, name?: string): Player {
    const player: Player = {
      ws,
      name: name || `Player ${this.players.size + 1}`,
      isConnected: true,
      lastPing: Date.now(),
    };

    this.players.set(playerId, player);
    return player;
  }

  getPlayer(playerId: string): Player | undefined {
    return this.players.get(playerId);
  }

  getAllPlayerIds() {
    return this.players.entries();
  }

  deletePlayer(playerId: string): void {
    this.players.delete(playerId);
  }
}

export const playerModel = new PlayerModel();
