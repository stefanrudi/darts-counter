import { useEffect, useState, useCallback, useRef } from "react";
import GameLobby from "./components/GameLobby";
import GameBoard from "./components/GameBoard";
import "./App.css";
import { useWebSocket } from "./hooks/useWebSocket";
import { useGame } from "./hooks/useGame";
import ConnectionStatus from "./components/ConnectionStatus";
import PlayerInfo from "./components/PlayerInfoProps";
import { useGameStore } from "./store/gameStore";

function App() {
  const { setConnected, setGameState, setMyPlayerId, gameState } = useGameStore();
  
  // Initialize playerId from localStorage on component mount
  const [playerId, setPlayerId] = useState<string | null>(() => {
    return localStorage.getItem("playerId");
  });

  // Function to update state and localStorage
  const handleSetPlayerId = useCallback((id: string | null) => {
    setPlayerId(id);
    if (id) {
      localStorage.setItem("playerId", id);
    } else {
      localStorage.removeItem("playerId");
    }
  }, []);

  // Centralized message handler passed to useWebSocket
  const handleWebSocketMessage = useCallback(
    (data: any) => {
      console.log("Received WS Data in App:", data);

      switch (data.type) {
        case "player_info":
          if (!playerId) {
            // Only set if we don't have one (prevents overwriting on accidental server message)
            console.log("Received new player ID:", data.payload.id);
            handleSetPlayerId(data.payload.id);
          }
          break;
        case "reconnect_success":
          console.log("Reconnection successful for ID:", data.payload.id);
          if (playerId !== data.payload.id) {
            console.warn(
              "Reconnect ID mismatch! Server:",
              data.payload.id,
              "Client:",
              playerId
            );
            // Decide how to handle mismatch - trust server?
            handleSetPlayerId(data.payload.id);
          }
          // Potentially trigger fetching game state again or rely on server sending it
          break;
        case "reconnect_error":
          console.error("Reconnection failed:", data.payload.message);
          // If reconnect fails (e.g. invalid ID), clear stored ID
          handleSetPlayerId(null);
          // Maybe force disconnect/show error message to user
          break;
        // --- Pass game-related messages to useGame handlers ---
        case "available_games":
        case "game_created": // Might not be needed if game_state follows immediately
        case "game_state":
        case "error": // Handle general server errors
          // Let useGame handle these (pass the handler down)
          // This requires useGame to expose its message handler
          gameMessageHandlerRef.current?.(data);
          break;
        default:
          console.log("Unknown message type in App:", data.type);
      }
    },
    [playerId, handleSetPlayerId]
  );

  // Use the custom WebSocket hook
  //const WS_URL = process.env.REACT_APP_WS_URL || "ws://localhost:3001";
  const WS_URL = "ws://localhost:3001";
  const { isConnected, sendMessage, connect, disconnect } = useWebSocket(
    WS_URL,
    {
      reconnectInterval: 5000,
      maxReconnectAttempts: 5,
      storedPlayerId: playerId,
      onOpen: () => console.log("WebSocket connection opened!"),
      onClose: () => console.log("WebSocket disconnected"),
      onError: (err) => console.error("WebSocket error callback:", err),
      // Provide the centralized message handler
      onParsedMessage: handleWebSocketMessage
    }
  );

  // Game hook initialization
  const gameMessageHandlerRef = useRef<((data: any) => void) | null>(null);
  const {
    playerName,
    updateName,
    currentGame,
    availableGames,
    view,
    createGame,
    joinGame,
    leaveGame,
    handleThrow,
    registerMessageHandler
  } = useGame({
    playerId,
    sendMessage
  });

  // Register the game message handler from useGame
  useEffect(() => {
    gameMessageHandlerRef.current = registerMessageHandler();
    // No cleanup needed here as useGame handles its own effect cleanup
  }, [registerMessageHandler]);

  // Add gameMessageHandlerRef as dependency to handleWebSocketMessage
  useEffect(() => {
    // This effect just ensures handleWebSocketMessage updates if the ref changes
    // It might not be strictly necessary if the ref assignment is stable, but safe
  }, [handleWebSocketMessage]);

  // Automatically connect to WebSocket on mount
  useEffect(() => {
    console.log("App mount: Connecting WebSocket...");
    connect();
    return () => {
      console.log("App unmount: Disconnecting WebSocket...");
      disconnect(); // Clean up WebSocket connection on unmount
    };
  }, [connect, disconnect]);

  return (
    <div className="app">
      <header>
        <h1>Multiplayer Darts Game</h1>
        <ConnectionStatus isConnected={isConnected} />
      </header>
      {playerId && (
        <PlayerInfo playerName={playerName} updateName={updateName} />
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
