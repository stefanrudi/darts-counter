import { gameModel } from "../game/Game";
import { findLastIndex } from "../utils/utils";
import { playerModel } from "../models/Player";
import { GameType, Game, Score, Position, X01Score } from "@darts-counter/shared";

/**
 * Create a new game using the GameModle singleton
 * @param gameType
 * @returns
 */
export function createGame(gameType: GameType = "501"): Game {
  return gameModel.createGame(gameType);
}



/**
 * Process a throw for 501 game
 * @param game
 * @param playerId
 * @param dartScore
 * @returns
 */
export function process501Throw(
  game: Game,
  playerId: string,
  dartScore: number
): boolean {
  const playerScore: X01Score = game.scores[playerId] as X01Score;

  // Check if this would make the score negative or exactly 0
  const newScore: number = playerScore.score - dartScore;

  // Bust condition: if throw would lead to score < 0 or exactly 1
  if (newScore < 0 || newScore === 1) {
    playerScore.throws.push({ score: dartScore, valid: false, bust: true });
    return false;
  }

  // Valid throw
  playerScore.score = newScore;
  playerScore.lastScore = dartScore;
  playerScore.throws.push({ score: dartScore, valid: true, bust: false });

  // Check for win
  if (newScore === 0) {
    game.status = "finished";
    game.winner = playerId;
  }

  return true;
}

/**
 * Count player's throws in current turn
 * @param game 
 * @param playerId 
 */
function getPlayerThrowsInCurrentTurn(game: Game, playerId: string): number {
    // Find last throw from a different player
    const lastDifferentPlayerThrowIndex = findLastIndex(game.history, (h) => h.playerId !== playerId);

    // Count throws after that point
    return game.history.
        slice(lastDifferentPlayerThrowIndex + 1)
        .filter(h => h.playerId === playerId)
        .length;
}

/**
 * Move the turn to next player
 * @param game 
 */
export function moveToNextPlayer(game: Game): void {
    // Find current player position
    const currentPlayerIndex = game.players.indexOf(game.currentPlayerId);
    
    // Move to next player in the array
    const nextPlayerIndex = (currentPlayerIndex + 1) % game.players.length;
    game.currentPlayerId = game.players[nextPlayerIndex];
    
    // Skip disconnected players
    let checkedPlayers = 0;
    while (checkedPlayers < game.players.length) {
      const player = playerModel.getPlayer(game.currentPlayerId);
      if (player && player.isConnected) {
        break;
      }
      const nextIndex = (game.players.indexOf(game.currentPlayerId) + 1) % game.players.length;
      game.currentPlayerId = game.players[nextIndex];
      checkedPlayers++;
    }
  }
