import { useEffect } from "react";
import GameLobby from "./components/GameLobby";
import GameBoard from "./components/GameBoard";
import "./App.css";
import ConnectionStatus from "./components/ConnectionStatus";
import PlayerInfo from "./components/PlayerInfoProps";
import { useGameStore } from "./store/gameStore";
import { socketService } from "./services/socketService";

function App() {
  const { isConnected, setConnected, setGameState, setMyPlayerId, gameState } =
    useGameStore();

  useEffect(() => {
    let isMounted = true;

    const connectAndSetupListener = async () => {
      const socket = await socketService.connect();
      if (isMounted) {
        setConnected(true);
        setMyPlayerId(socket.id); // Store the player ID

        // Setup event listeners
        socketService.onGameUpdate((newGameState) => {
          console.log("Received game state update:", newGameState);
          if (isMounted) {
            setGameState(newGameState);
          }
        });
        socketService.onPlayerJoined((data) => {
          console.log("Player joined:", data.nickname);
        });
        socketService.onPlayerLeft((data) => {
          console.log("Player left:", data.playerId);
        });
      }
    };
    connectAndSetupListener();

    // clean up function
    return () => {
      isMounted = false;
      // Clean up listeners when component unmounts or before reconnecting
      socketService.offGameUpdate();
      socketService.offPlayerJoined();
      socketService.offPlayerLeft();

      setConnected(false);
      setGameState(null);
      setMyPlayerId(undefined);
    };
  }, [setConnected, setGameState, setMyPlayerId]);


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
