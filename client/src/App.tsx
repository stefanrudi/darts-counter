import { useEffect } from "react";
import GameBoard from "./components/GameBoard";
import "./App.css";
import ConnectionStatus from "./components/ConnectionStatus";
import { useGameStore } from "./store/gameStore";
import { socketService } from "./services/socketService";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GameLobby } from "./components/GameLobby";
import { PlayerInfo } from "./components/PlayerInfoProps";

function App() {
  const { isConnected, setConnected, setGameState, setMyPlayerId, gameState, myPlayerId } =
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
    <Router>
      <div className="app">
      <header>
        <h1>Multiplayer Darts Game</h1>
        <ConnectionStatus isConnected={isConnected} />
      </header>
        
        <Routes>
          <Route path="/" element={gameState ? <Navigate to={`/game/${gameState.gameId}}`} /> : <GameLobby/>} />
          <Route path="/lobby" element={gameState ? <Navigate to={`/game/${gameState.gameId}`} /> : <GameLobby />} />
          <Route path="/game/:gameId" element={gameState ? <GameBoard /> : <Navigate to="/lobby" />} />
        </Routes>
        </div>  
    </Router> 
  );
}

export default App;
