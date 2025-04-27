import { useEffect } from "react";
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
import GameRoom from "./components/GameRoom";

function App() {
  const { setConnected, setCurrentGame: setGameState, setMyPlayerId, currentGame } =
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
              currentGame ? (
                <Navigate to={`/game/${currentGame.id}`} />
              ) : (
                <GameLobby />
              )
            }
          />
          <Route
            path="/lobby"
            element={
              currentGame ? (
                <Navigate to={`/game/${currentGame.id}`} />
              ) : (
                <GameLobby />
              )
            }
          />
          <Route
            path="/game/:gameId"
            element={currentGame ? <GameRoom params={{
              id: currentGame.id,
            }} /> : <Navigate to="/lobby" />}
          />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
