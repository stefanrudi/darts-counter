import React, { useState, useEffect, useCallback } from "react";
import GameLobby from "./components/GameLobby";
import GameBoard from "./components/GameBoard";
import "./App.css";

interface Game {
  id: string;
  players: string[];
  gameType: GameType;
  currentPlayerIndex: string;
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

interface Position {
  x: number;
  y: number;
}

type GameType = "501" | "around-the-clock";

function App() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState<boolean>(false);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState<string>("");
  const [currentGame, setCurrentGame] = useState<Game | null>(null);
  const [availableGames, setAvailableGames] = useState<Game[] | null>([]);
  const [view, setView] = useState<"lobby" | "game">("lobby");

  // Connect to WebSocket Server with reconnection strategy
  useEffect(() => {
    let ws = null;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 10;
    const initialReconnectDelay = 1000; // Start with 1 second
    let reconnectTimeout = null;

    const connectWebSocket = () => {
      // Clear any existing reconnect timeouts
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }

      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const host = window.location.hostname;
      const port = process.env.NODE_ENV === "development" ? "3001" : window.location.port;
      const wsUrl = `${protocol}//${host}${port ? `:${port}` : ""}`;

      // Close existing socket if any
      if (ws) {
        ws.close();
      }

      // Create new WebSocket connection
      ws = new WebSocket(wsUrl);
      setSocket(ws);

      ws.onopen = () => {
        setConnected(true);
        console.log("Connected to WebSocket server");
        // reset reconnect attempts on successful connection
        reconnectAttempts = 0;
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      ws.onclose = (event) => {
        setConnected(false);
        console.log(`Disconnected from server with code: ${event.code}, reason: ${event.reason}`);

        // Don't attempt to reconnect if component is unmounting or max attempts reached
        if (reconnectAttempts >= maxReconnectAttempts) {
          console.log(`Maximum reconnect attempts (${maxReconnectAttempts}) reached. Giving up.`);
          return;
        }

        // Calculate exponential backoff delay (1s, 2s, 4s, 8s, etc.)
        const delay = initialReconnectDelay * Math.pow(2, reconnectAttempts);
        const jitter = Math.random() * 1000; // Add randomness to prevent thundering herd
        const reconnectDelay = Math.min(delay + jitter, 30000); // Cap at 30 seconds
        
        console.log(`Attempting to reconnect in ${Math.round(reconnectDelay / 1000)} seconds...`);
        
        reconnectAttempts++;
        reconnectTimeout = setTimeout(() => {
          console.log(`Reconnection attempt ${reconnectAttempts}...`);
          connectWebSocket();
        }, reconnectDelay);        
      };
    };

    // Initial connection
    connectWebSocket();

    // Cleanup function
    return () => {
      if (ws) {
        // Use a specific close code to indicate intentional closure
        ws.close(1000, "Component unmounting");
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, []);

  // Listen for messages from server
  useEffect(() => {
    if (!socket) return;

    const messageHandler = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case "player_info":
            setPlayerId(data.payload.id);
            // Set default player name if not set yet
            if (!playerName) {
              const defaultName = `Player ${Math.floor(Math.random() * 1000)}`;
              setPlayerName(defaultName);
              // Send name update to server
              if (socket.readyState === WebSocket.OPEN) {
                socket.send(
                  JSON.stringify({
                    type: "update_name",
                    payload: { name: defaultName },
                  })
                );
              }
            }
            break;

          case "available_games":
            setAvailableGames(data.payload.games);
            break;

          case "game_created":
            console.log("Game created:", data.payload.gameId);
            break;

          case "game_state":
            setCurrentGame(data.payload.game);
            setView("game");
            break;

          default:
            console.log("Unknown message type:", data.type);
        }
      } catch (err) {
        console.error("Error parsing message:", err);
      }
    };

    socket.addEventListener("message", messageHandler);

    return () => {
      socket.removeEventListener("message", messageHandler);
    };
  }, [socket, playerName]);

  // Create a new game
  const createGame = (gameType: string) => {
    if (socket === null) {
      console.error("createGame: socket is null");
      return;
    }

    if (socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          type: "create_game",
          payload: { gameType },
        })
      );
    }
  };

  // Join an existing game
  const joinGame = (gameId: string) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          type: "join_game",
          payload: { gameId },
        })
      );
    }
  };

  // Leave current game
  const leaveGame = () => {
    if (socket && socket.readyState === WebSocket.OPEN && currentGame) {
      socket.send(
        JSON.stringify({
          type: "leave_game",
          payload: { gameId: currentGame.id },
        })
      );
      setCurrentGame(null);
      setView("lobby");
    }
  };

  // Update player name
  const updateName = (name: string) => {
    setPlayerName(name);
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          type: "update_name",
          payload: { name },
        })
      );
    }
  };

  // Handle dart throw
  const handleThrow = useCallback(
    (position: number) => {
      if (socket && socket.readyState === WebSocket.OPEN && currentGame) {
        // Check if it's this player's turn
        if (currentGame.currentPlayerIndex === playerId) {
          socket.send(
            JSON.stringify({
              type: "throw_dart",
              payload: {
                gameId: currentGame.id,
                position,
              },
            })
          );
        } else {
          console.log("Not your turn!");
        }
      }
    },
    [socket, currentGame, playerId]
  );

  return (
    <div className="app">
      <header>
        <h1>Multiplayer Darts Game</h1>                
      </header>
      {connected ? (
          <div className="connection-status connected">Connected</div>
        ) : (
          <div className="connection-status disconnected">Disconnected</div>
        )}
      {playerId && (
        <div className="player-info">
          <label>
            Your Name:
            <input
              type="text"
              value={playerName}
              onChange={(e) => updateName(e.target.value)}
              maxLength={20}
            />
          </label>
        </div>
      )}

      {view === "lobby" && (
        <GameLobby
          availableGames={availableGames}
          createGame={createGame}
          joinGame={joinGame}
        />
      )}

      {view === "game" && currentGame && (
        <GameBoard
          game={currentGame}
          playerId={playerId}
          leaveGame={leaveGame}
          onThrow={handleThrow}
        />
      )}
    </div>
  );
}

export default App;
