import { useEffect } from "react";
import GameBoard from "./components/GameBoard";
import "./App.css";
import { useGameStore } from "./store/gameStore";
import { socketService } from "./services/socketService";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from "react-router-dom";
import { GameLobby } from "./components/GameLobby";

function App() {
  const { setConnected, setGameState, setMyPlayerId, gameState } =
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
      <main className="container mx-auto p-4">
        <h1 className="text-3xl font-bold text-center mb-8">Darts Counter</h1>

        <Routes>
          <Route
            path="/"
            element={
              gameState ? (
                <Navigate to={`/game/${gameState.id}`} />
              ) : (
                <GameLobby />
              )
            }
          />
          <Route
            path="/lobby"
            element={
              gameState ? (
                <Navigate to={`/game/${gameState.id}`} />
              ) : (
                <GameLobby />
              )
            }
          />
          <Route
            path="/game/:gameId"
            element={gameState ? <GameBoard /> : <Navigate to="/lobby" />}
          />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
