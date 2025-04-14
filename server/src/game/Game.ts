import { calculateX01Score, checkX01Bust, checkX01Win } from "./X01_rules";
import { Game, GameType, Player, Segment, Throws, X01Variant } from "./types";
import { v4 as uuidv4 } from "uuid";

export class Game implements Game {
  id: string;
  gameType: GameType;
  variant?: X01Variant;
  players: Player[] = [];
  currentPlayerIndex: number = 0;
  dartsThrownThisTurn: number = 0;
  isGameOver: boolean = false;
  winner?: Player;
  lastThrow?: Throws;

  constructor(type: GameType, variant?: X01Variant) {
    this.id = uuidv4();
    this.gameType = type;
    if (type === "X01" && variant) {
      this.variant = variant;
    }
  }


  addPlayer(socketId: string, nickname: string): Player | null {
    // Check if the player is already in the game
    if (this.players.find(player => player.id === socketId)) {
      return null;
    }

    // TODO: Define player limit and check against it

    // Create a new player
    const newPlayer: Player = {
      id: socketId,
      name: nickname,
      score: this.gameType === "X01" ? this.variant! : 0, // Initial score
      currentNumber: this.gameType === "AroundTheClock" ? 1 : undefined,
      hits: this.gameType === "AroundTheClock" ? new Set<number>() : undefined,
      order: this.players.length,
    };
    this.players.push(newPlayer);

    // Sort by order
    this.players.sort((a, b) => a.order - b.order);
    return newPlayer;
  }

  removePlayer(socketId: string): boolean {
    const index = this.players.findIndex(player => player.id === socketId);
    if (index === -1) {
      return false; // Player not found
    }

    this.players.splice(index, 1); // Remove player from the game

    if (this.players.length < 2) {
      this.isGameOver = true; // End game if less than 2 players
    } else {
      // Reorder players      
      this.players.forEach((player, idx) => {
        player.order = idx;
      });
    }
    return true;
  }

  handleThrow(playerId: string, segment: Segment): Game | { error: string } {
    const player = this.players[this.currentPlayerIndex];
    if (player.id !== playerId) {
      return { error: "Not your turn" };
    }
    if (this.isGameOver) {
      return { error: "Game is over" };
    }

    let scoreValue: number = 0;
    let isBust: boolean = false;
    let isWin: boolean = false;
    let turnOver: boolean = false;

    // Calculate score based on segment
    if (this.gameType === "AroundTheClock") {
      return {error: "Around the Clock game not implemented yet"};
    }

    // X01 game logic
    if (this.gameType === "X01") {
      const result = calculateX01Score(segment);
      if (result === null) {
        return { error: "Invalid segment" };
      }

      scoreValue = result.score;
      const previousScore = player.score;
      player.score -= scoreValue;

      isBust = checkX01Bust(player.score);
      isWin = checkX01Win(player.score, result.isDouble, result.isBull);
      
      if (isBust) {
        player.score = previousScore; // Revert score if bust
        turnOver = true;
      } else if (isWin) {
        this.isGameOver = true;
        this.winner = player;
        isWin = true;
      }
    }

    this.dartsThrownThisTurn++;
    this.lastThrow = { player, segment, score: scoreValue, isBust, isWin };

    // Check if turn should end (3 darts or game ending throw)
    if (!turnOver && this.dartsThrownThisTurn >= 3) {
      turnOver = true;
    }

    if (turnOver && !this.isGameOver) {
      this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
      this.dartsThrownThisTurn = 0;
    }

    return this.getCurrentState();
  }

  // Return a copy of the current game state
  getCurrentState(): Game {
    return {
      id: this.id,
      gameType: this.gameType,
      variant: this.variant,
      players: [...this.players],
      currentPlayerIndex: this.currentPlayerIndex,
      dartsThrownThisTurn: this.dartsThrownThisTurn,
      isGameOver: this.isGameOver,
      winner: this.winner,
      lastThrow: this.lastThrow,
    };
  }
}
