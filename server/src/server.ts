import express, { Express } from "express";
import http, { Server as HTTPServer } from "http";
import WebSocket, { Data, WebSocketServer, WebSocket as WS } from "ws";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// interfaces
interface Position {
  x: number;
  y: number;
}

interface X01Score {    
  score: number;
  throws: { score: number; valid: boolean; bust: boolean }[];
  lastScore: number;
}

interface AroundTheClockScore {
  currentTarget: number;
  throws: { score: number; valid: boolean; bust: boolean }[];
  lastScore: number;
}

type Score = X01Score | AroundTheClockScore;

interface Game {
  id: string;
  players: string[];
  gameType: GameType;
  currentPlayerIndex: number;
  status: "waiting" | "playing" | "finished";
  scores: { [playerId: string]: Score };
  history: {
    playerId: string;
    position: Position;
    score: number;
    timestamp: number;
  }[];
  createdAt: number;
  winner?: string;
}

interface Player {
  ws: WebSocket;
  name: string;
}

interface AvailableGame {
  id: string;
  playerCount: number;
  gameType: GameType;
  createdAt: number;
}

type GameType = "501" | "around-the-clock";

// Initialize Express app
const app: Express = express();
const server: HTTPServer = http.createServer(app);

// Serve static files from the 'public' directory (for production)
app.use(express.static(path.join(__dirname, 'public')));

// WebSocket server
const wss: WebSocketServer = new WebSocketServer({ server });

// Game state
const games: Map<string, Game> = new Map();
const players: Map<string, Player> = new Map();

// Game types
const GAME_TYPES: { [key: string]: GameType } = {
  X01: "501",
  AROUND_THE_CLOCK: "around-the-clock",
};

// Create a new game
function createGame(gameType: GameType = GAME_TYPES.X01): Game {
  const gameId: string = uuidv4();

  const game: Game = {
    id: gameId,
    players: [],
    gameType,
    currentPlayerIndex: 0,
    status: "waiting",
    scores: {},
    history: [],
    createdAt: Date.now(),
  };

  games.set(gameId, game);
  return game;
}

// Add player to game
function addPlayerToGame(gameId: string, playerId: string): Game | null {
  const game: Game | undefined = games.get(gameId);
  if (!game) return null;

  if (!game.players.includes(playerId)) {
    game.players.push(playerId);
    game.scores[playerId] = initializeScore(game.gameType);
  }

  // Start game if we have 2 or more players and status is waiting
  if (game.players.length >= 2 && game.status === "waiting") {
    game.status = "playing";
  }

  return game;
}

// Initialize score based on game type
function initializeScore(gameType: GameType): Score {
  switch (gameType) {
    case GAME_TYPES.X01:
      return { score: 501, throws: [], lastScore: 0 };
    case GAME_TYPES.AROUND_THE_CLOCK:
      return { currentTarget: 1, throws: [], lastScore: 0 };
    default:
      return { score: 501, throws: [], lastScore: 0 };
  }
}

// Process a throw for 501 game
function process501Throw(
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

// Process player throw
function processThrow(
  gameId: string,
  playerId: string,
  dartPosition: Position
): { game: Game; dartScore: number; validThrow: boolean } | null {
  const game: Game | undefined = games.get(gameId);
  if (!game || game.status !== "playing") return null;

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
    case GAME_TYPES.X01:
      validThrow = process501Throw(game, playerId, dartScore);
      break;
    // Implement other game types as needed
    default:
      validThrow = process501Throw(game, playerId, dartScore);
  }

  // Move to next player after 3 throws (or if current throw was invalid in some games)
  const throwCount: number = game.history.filter(
    (h) =>
      h.playerId === playerId &&
      game.history.indexOf(h) >
        game.history.findIndex(
          (h) =>
            h.playerId !== playerId &&
            game.players[
              (game.players.indexOf(playerId) + game.players.length - 1) %
                game.players.length
            ] === h.playerId
        )
  ).length;

  if (throwCount >= 3 || !validThrow) {
    game.currentPlayerIndex =
      (game.currentPlayerIndex + 1) % game.players.length;
  }

  return {
    game,
    dartScore,
    validThrow,
  };
}

function calculateScore(position: Position): number {
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

// WebSocket connection handler
wss.on("connection", (ws: WebSocket) => {
  const playerId = uuidv4();
  players.set(playerId, { ws, name: `Player ${players.size + 1}` });

  // Send player their ID
  ws.send(
    JSON.stringify({
      type: "player_info",
      payload: { id: playerId },
    })
  );

  // List available games
  const availableGames: AvailableGame[] = Array.from(games.values())
    .filter((game) => game.status === "waiting")
    .map(({ id, players, gameType, createdAt }) => ({
      id,
      playerCount: players.length,
      gameType,
      createdAt,
    }));

  ws.send(
    JSON.stringify({
      type: "available_games",
      payload: { games: availableGames },
    })
  );

  ws.on("message", (message: string) => {
    try {
      const data = JSON.parse(message);

      switch (data.type) {
        case "create_game": {
          const { gameType } = data.payload;
          const game = createGame(gameType);
          addPlayerToGame(game.id, playerId);

          // Notify creator
          ws.send(
            JSON.stringify({
              type: "game_created",
              payload: { gameId: game.id },
            })
          );

          // Notify all waiting clients about the new game
          broadcastAvailableGames();
          break;
        }

        case "join_game": {
          const { gameId } = data.payload;
          const game = addPlayerToGame(gameId, playerId);

          if (game) {
            // Notify all players in the game
            broadcastGameState(game);

            // If this caused the game to start, broadcast available games update
            if (game.status === "playing") {
              broadcastAvailableGames();
            }
          }
          break;
        }

        case "throw_dart": {
          const { gameId, position } = data.payload;
          const result = processThrow(gameId, playerId, position);

          if (result) {
            broadcastGameState(result.game);
          }
          break;
        }

        case "update_name": {
          const { name } = data.payload;
          const player = players.get(playerId);
          if (player) {
            player.name = name;

            // Update all games this player is in
            for (const game of games.values()) {
              if (game.players.includes(playerId)) {
                broadcastGameState(game);
              }
            }
          }
          break;
        }

        case "leave_game": {
          const { gameId } = data.payload;
          const game = games.get(gameId);

          if (game) {
            // Remove player from game
            const playerIndex = game.players.indexOf(playerId);
            if (playerIndex > -1) {
              game.players.splice(playerIndex, 1);

              // If no players left, remove the game
              if (game.players.length === 0) {
                games.delete(gameId);
                broadcastAvailableGames();
              } else {
                // Otherwise update current player index if needed
                if (game.currentPlayerIndex >= game.players.length) {
                  game.currentPlayerIndex = 0;
                }
                broadcastGameState(game);
              }
            }
          }
          break;
        }
      }
    } catch (err) {
      console.error("Error processing message:", err);
    }
  });

  ws.on("close", () => {
    // Remove player from all games
    for (const game of games.values()) {
      const playerIndex = game.players.indexOf(playerId);
      if (playerIndex > -1) {
        game.players.splice(playerIndex, 1);

        if (game.players.length === 0) {
          games.delete(game.id);
        } else {
          if (game.currentPlayerIndex >= game.players.length) {
            game.currentPlayerIndex = 0;
          }
          broadcastGameState(game);
        }
      }
    }

    players.delete(playerId);
    broadcastAvailableGames();
  });
});

// Broadcast available games to all waiting clients
function broadcastAvailableGames() {
  const availableGames = Array.from(games.values())
    .filter((game) => game.status === "waiting")
    .map(({ id, players, gameType, createdAt }) => ({
      id,
      playerCount: players.length,
      gameType,
      createdAt,
    }));

  for (const player of players.values()) {
    player.ws.send(
      JSON.stringify({
        type: "available_games",
        payload: { games: availableGames },
      })
    );
  }
}

// Broadcast game state to all players in a game
function broadcastGameState(game: Game) {
  // Create client-friendly game state (without WebSocket objects)
  const gameState = {
    id: game.id,
    players: game.players.map((id) => ({
      id,
      name: players.get(id)?.name || `Unknown Player`,
      score: game.scores[id],
    })),
    gameType: game.gameType,
    currentPlayerIndex: game.currentPlayerIndex,
    currentPlayerId: game.players[game.currentPlayerIndex],
    status: game.status,
    winner: game.winner || null,
    history: game.history.slice(-10), // Last 10 throws
  };

  for (const playerId of game.players) {
    const player = players.get(playerId);
    if (player && player.ws.readyState === WebSocket.OPEN) {
      player.ws.send(
        JSON.stringify({
          type: "game_state",
          payload: { game: gameState },
        })
      );
    }
  }
}

// Start the server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
