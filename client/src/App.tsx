import { useEffect } from "react";
import GameLobby from "./components/GameLobby";
import GameBoard from "./components/GameBoard";
import "./App.css";
import { useWebSocket } from "./hooks/useWebSocket";
import { useGame } from "./hooks/useGame";
import ConnectionStatus from "./components/ConnectionStatus";
import PlayerInfo from "./components/PlayerInfoProps";

function App() {
  const {
    socket,
    status,
    playerId,
    setPlayerId,
    sendMessage,
    registerMessageHandler,
  } = useWebSocket();

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
  } = useGame({
    playerId,
    sendMessage,
    registerMessageHandler,
  });

  // Handle player_info messages at the App level
  useEffect(() => {
    if (!socket) return;

    const handlePlayerInfo = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "player_info") {
          setPlayerId(data.payload.id);
        }
      } catch (err) {
        console.error("Error handling player info:", err);
      }
    };

    socket.addEventListener("message", handlePlayerInfo);
    return () => {
      socket.removeEventListener("message", handlePlayerInfo);
    };
  }, [socket, setPlayerId]);

  return (
    <div className="app">
      <header>
        <h1>Multiplayer Darts Game</h1>
        <ConnectionStatus status={status}/>
      </header>
      {playerId && (
        <PlayerInfo 
          playerName={playerName} 
          updateName={updateName} 
        />
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
