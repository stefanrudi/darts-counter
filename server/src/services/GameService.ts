import { Game, GameType, Score, Position, X01Score } from "../utils/types";
import { gameModel } from "../models/Game";
import { findLastIndex } from "../utils/utils";
import { playerModel } from "../models/Player";

/**
 * Create a new game using the GameModle singleton
 * @param gameType
 * @returns
 */
export function createGame(gameType: GameType = "501"): Game {
  return gameModel.createGame(gameType);
}

/**
 * Add player to game
 * @param gameId
 * @param playerId
 * @returns
 */
export function addPlayerToGame(gameId: string, playerId: string): Game | null {
  return gameModel.addPlayer(gameId, playerId);
}

/**
 * Initialize score based on game type
 * @param gameType
 * @returns
 */
export function initializeScore(gameType: GameType): Score {
  switch (gameType) {
    case "501":
      return { score: 501, throws: [], lastScore: 0 };
    case "around-the-clock":
      return { currentTarget: 1, throws: [], lastScore: 0 };
    default:
      return { score: 501, throws: [], lastScore: 0 }; // error?
  }
}

export function processThrow(
  gameId: string,
  playerId: string,
  dartPosition: Position
): { game: Game; dartScore: number; validThrow: boolean } | null {
  const game: Game | undefined = gameModel.getGame(gameId);
  if (!game || game.status !== "playing" || game.currentPlayerId != playerId) return null;

  // Calculate score from dartPosition
  const dartScore: number = calculateScore(dartPosition);

  // Track throw in game history
  game.history.push({
    playerId,
    position: dartPosition,
    score: dartScore,
    timestamp: Date.now(),
  });

  // Process throw based on game type
  let validThrow: boolean = false;
  switch (game.gameType) {
    case "501":
      validThrow = process501Throw(game, playerId, dartScore);
      break;
    // Implement other game types as needed
    default:
      validThrow = process501Throw(game, playerId, dartScore);
  }

  // Count player's throws in the current turn
  const playerThrows = getPlayerThrowsInCurrentTurn(game, playerId);

  // Move to next player after 3 throws (or if current throw was invalid in some games)
  if (playerThrows >= 3 || !validThrow) {
    moveToNextPlayer(game);
  }

  return {
    game,
    dartScore,
    validThrow,
  };
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
 * Calculate the score from the position of the cursor
 * @param position 
 * @returns 
 */
export function calculateScore(position: Position): number {
  const { x, y } = position;
  const distance = Math.sqrt(x * x + y * y);
  const boardRadius = 200;
  const bullseyeRadius = 12.5;
  const innerBullRadius = 31.25;
  const tripleRingInner = 105;
  const tripleRingOuter = 115;
  const doubleRingInner = 170;
  const doubleRingOuter = 180;
  let angle = Math.atan2(y, x) + Math.PI / 2;
  if (angle < 0) angle += 2 * Math.PI;
  const sectionIndex = Math.floor((angle * 180) / Math.PI / 18) % 20;
  const scores = [
    20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5,
  ];
  const baseScore = scores[sectionIndex];
  if (distance <= bullseyeRadius) {
    return 50;
  } else if (distance <= innerBullRadius) {
    return 25;
  } else if (distance <= boardRadius) {
    if (distance >= tripleRingInner && distance <= tripleRingOuter) {
      return baseScore * 3;
    } else if (distance >= doubleRingInner && distance <= doubleRingOuter) {
      return baseScore * 2;
    } else {
      return baseScore;
    }
  }
  return 0;
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
