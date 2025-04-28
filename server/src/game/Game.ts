import { CheckoutType, GameInterface, GameState, Player, Throw } from "./types";
import { v4 as uuidv4 } from "uuid";

export class Game implements GameInterface {
  id: string;
  name: string;
  startingScore: number;
  checkoutType: CheckoutType;
  maxPlayers: number;
  gameState: GameState;
  bestOf: number;
  currentLeg: number;

  players: Player[] = [];
  currentPlayer: Player | null = null;
  currentPlayerIndex: number = 0;
  dartsThrownThisTurn: number = 0;
  legWinner?: Player;
  winner?: Player;

  constructor(name: string, startingScore: number, checkoutType: CheckoutType, maxPlayers: number, bestOf: number) {
    this.id = uuidv4();
    this.name = name;
    this.startingScore = startingScore;
    this.checkoutType = checkoutType;
    this.maxPlayers = maxPlayers;
    this.bestOf = bestOf;
    this.currentLeg = 1;
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
      legsWon: 0
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

    if (this.players.length === 0) {
      this.gameState = "finished"; // Set game state to finished if no players left
      this.winner = undefined; // Clear winner
    }
    return true;
  }

  handleThrows(throws: Throw[]): Game {
    if (this.gameState === "finished") {
      throw new Error("The game is already finished.");
    }

    if (throws.length > 3) {
      throw new Error("Invalid number of throws. A player can throw up to 3 darts per turn.");
    }

    // Calculate total score for this turn
    const turnScore = throws.reduce((total, t) => total + t.totalScore, 0);
    const newScore = this.currentPlayer!.score - turnScore;

    // Check for BUST
    const isBust = newScore < 0 || (this.checkoutType === "double" && newScore === 1);

    // Check for checkout
    const isCheckout = newScore === 0;
    const isValidCheckout =
      isCheckout &&
      (this.checkoutType === "single" ||
        (this.checkoutType === "double" && throws[throws.length - 1].multiplier === 2));

    // Prepare throws with validity
    const valid = !isBust && (!isCheckout || isValidCheckout);
    const updatedThrows = throws.map((t) => ({
      ...t,
      valid,
    }));

    // Update player's throws
    this.players = this.players.map((player, index) => {
      if (index === this.currentPlayerIndex) {
        return {
          ...player,
          throws: [...player.throws, ...updatedThrows],
          score: valid ? newScore : player.score, // Only update score if valid
        };
      }
      return player;
    });

    // Update currentPlayer reference
    this.currentPlayer = this.players[this.currentPlayerIndex];

    // Handle win
    if (isValidCheckout) {
      const legsToWin = Math.ceil(this.bestOf / 2);
      if (this.currentPlayer.legsWon + 1 >= legsToWin) {
        this.winner = this.currentPlayer;
        this.gameState = "finished";
        return this;
      }
      // Handle leg win
      this.currentLeg += 1; 
      this.currentPlayer!.legsWon += 1;
      this.legWinner = this.currentPlayer;

      // Reset scores for the next leg
      this.players = this.players.map((player) => ({
        ...player,
        score: this.startingScore,
        //throws: [],
      }));

      // Ensure leg winner starts next leg
      this.currentPlayerIndex = this.players.findIndex(player => player.id === this.currentPlayer!.id);
      this.currentPlayer = this.players[this.currentPlayerIndex];
      return this;
    }

    // Advance turn if not win
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
      winner: this.winner,
      currentLeg: this.currentLeg,
      legWinner: this.legWinner,
      bestOf: this.bestOf
    };
  }
}

