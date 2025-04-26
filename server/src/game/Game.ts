import { calculateX01Score, checkX01Bust, checkX01Win } from "./X01_rules";
import { CheckoutType, Game, GameState, Player, Segment, Throws, X01Variant } from "./types";
import { v4 as uuidv4 } from "uuid";

export class Game implements Game {
  id: string;
  name: string;
  startingScore: number;
  checkoutType: CheckoutType;
  maxPlayers: number;
  gameState: GameState;

  players: Player[] = [];
  currentPlayerIndex: number = 0;
  dartsThrownThisTurn: number = 0;
  winner?: Player;

  constructor(name: string, startingScore: number, checkoutType: CheckoutType, maxPlayers: number) {
    this.id = uuidv4();
    this.name = name;
    this.startingScore = startingScore;
    this.checkoutType = checkoutType;
    this.maxPlayers = maxPlayers;
    this.gameState = "waiting";
  }



  addPlayer(socketId: string, nickname: string): Player | null {
    // Check if the game is full
    if (this.players.length >= this.maxPlayers) {
      return null; // Game is full
    }

    // Check if the player is already in the game
    if (this.players.find(player => player.id === socketId)) {
      return null;
    }

    // Create a new player
    const newPlayer: Player = {
      id: socketId,
      name: nickname,
      score: this.startingScore,
      throws: [],
    };
    this.players.push(newPlayer);

    return newPlayer;
  }

  removePlayer(socketId: string): boolean {
    const index = this.players.findIndex(player => player.id === socketId);
    if (index === -1) {
      return false; // Player not found
    }

    this.players.splice(index, 1); // Remove player from the game

    if (this.players.length < 2) {
      this.gameState = "waiting"; // Set game state to waiting if less than 2 players
    }
    return true;
  }

  handleThrow(playerId: string, segment: Segment): Game | { error: string } {
    const player = this.players[this.currentPlayerIndex];
    if (player.id !== playerId) {
      return { error: "Not your turn" };
    }
    if (this.gameState !== "playing") {
      return { error: "Game is not in progress" };
    }

    let scoreValue: number = 0;
    let isBust: boolean = false;
    let isWin: boolean = false;
    let turnOver: boolean = false;

    // Calculate score based on segment    
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
      this.gameState = "finished";
      this.winner = player;
      isWin = true;
    }
    // Record the throw
    this.dartsThrownThisTurn++;

    // Check if turn should end (3 darts or game ending throw)
    if (!turnOver && this.dartsThrownThisTurn >= 3) {
      turnOver = true;
    }

    if (turnOver && this.gameState !== "finished") {
      this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
      this.dartsThrownThisTurn = 0;
    }

    return this.getCurrentState();
  }

  // Return a copy of the current game state
  getCurrentState(): Game {
    return {
      id: this.id,
      name: this.name,
      startingScore: this.startingScore,
      checkoutType: this.checkoutType,
      maxPlayers: this.maxPlayers,
      players: [...this.players],
      currentPlayerIndex: this.currentPlayerIndex,
      gameState: this.gameState,       
    };
  }
}
