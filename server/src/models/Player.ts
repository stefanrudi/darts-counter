import { Player } from "../utils/types";
import {v4 as uuidv4} from 'uuid';
import { WebSocket } from 'ws';

export class PlayerModel {
  private players: Map<string, Player> = new Map();

  // Create a new player
  create(ws: WebSocket, name?: string): { player: Player; id: string } {
    const playerId = uuidv4();
    const player: Player = {
      ws,
      name: name || `Player ${this.players.size + 1}`,
      isConnected: true,
      lastPing: Date.now(),
    };

    this.players.set(playerId, player);
    return { player, id: playerId };
  }
}

export const playerModel = new PlayerModel();