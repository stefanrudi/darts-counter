import { CheckoutType, GameInterface, GameState, Player, Throw } from "./types";
import { v4 as uuidv4 } from "uuid";

export class Game implements GameInterface {
  id: string;
  name: string;
  startingScore: number;
  checkoutType: CheckoutType;
  maxPlayers: number;
  gameState: GameState;

  players: Player[] = [];
  currentPlayer: Player | null = null;
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

  startGame(): void {
    if (this.players.length < 2) {
      throw new Error("Not enough players to start the game");
    }
    this.gameState = "playing";
    this.currentPlayerIndex = 0;
    this.currentPlayer = this.players[this.currentPlayerIndex];
  }

  addPlayer(playerId: string, nickname: string): Player | null {
    // Check if the game is full
    if (this.players.length >= this.maxPlayers || this.gameState !== "waiting") {
      return null;
    }

    // Check if the player is already in the game
    if (this.players.find(p => p.id === playerId)) {
      return null;
    }

    // Create a new player
    const newPlayer: Player = {
      id: playerId,
      name: nickname,
      score: this.startingScore,
      throws: [],
    };
    this.players.push(newPlayer);

    if (this.players.length === this.maxPlayers) {
      this.startGame();
    }

    return newPlayer;
  }

  removePlayer(socketId: string): boolean {
    const index = this.players.findIndex(player => player.id === socketId);

    // Player not found
    if (index === -1) {
      return false; 
    }

    this.players.splice(index, 1); // Remove player from the game

    if (this.players.length < 2) {
      this.gameState = "waiting"; // Set game state to waiting if less than 2 players
    }

    if(this.players.length === 0) {
      this.gameState = "finished"; // Set game state to finished if no players left
      this.winner = undefined; // Clear winner
    }
    return true;
  }

  handleThrows(throws: Throw[]): Game {

    // Calculate total score for this turn
    const turnScore = throws.reduce((total, t) => total + t.totalScore, 0);

    // Check if this would bust (score below 0)
    const newScore = this.currentPlayer!.score - turnScore;

    // Check if this is a checkout
    const isCheckout = newScore === 0;

    // Check if checkout is valid (double required for double checkout)
    const isValidCheckout =
      isCheckout &&
      (this.checkoutType === "single" ||
        (this.checkoutType === "double" && throws[2].multiplier === 2))



    // Update player score if valid move
    if (newScore >= 0 && (!isCheckout || isValidCheckout)) {
      // Update current player's score and throws
      const updatedPlayers = this.players.map((player, index) => {
        if (index === this.currentPlayerIndex) {
          return {
            ...player,
            score: newScore,
            throws: [...player.throws, ...throws],
          }
        }
        return player;
      });

      if (isValidCheckout) {
        this.winner = updatedPlayers[this.currentPlayerIndex];
        this.gameState = "finished";
      }
    }

    // Move to the next player 
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    this.currentPlayer = this.players[this.currentPlayerIndex];

    return this;
  }

  // Return a copy of the current game state
  getCurrentState() {
    return {
      id: this.id,
      name: this.name,
      startingScore: this.startingScore,
      checkoutType: this.checkoutType,
      maxPlayers: this.maxPlayers,
      players: [...this.players],
      currentPlayer: this.currentPlayer,
      gameState: this.gameState,
      winner: this.winner
    };
  }
}

