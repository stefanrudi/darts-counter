import { useNavigate, useParams } from "react-router-dom";
import { useGameStore } from "../store/gameStore";
import Dartboard from "./dartboard";
import { socketService } from "../services/socketService";

export function GameBoard() {
  const { gameId } = useParams<{ gameId: string }>();
  const { gameState, myPlayerId, setGameState } = useGameStore();
  const navigate = useNavigate();

  if (!gameState || gameState.id !== gameId) {
    // Loading state or redirect handled by App.tsx usually
    return (
      <div className="text-center text-yellow-500">Loading game data...</div>
    );
  }

  const handleLeaveGame = () => {
    if (!gameId) {
      alert("Unable to leave the game. Missing game or player information.");
      return;
    }

    // Handle leaving the game
    socketService.leaveGame({ gameId });
    setGameState(null);
    navigate("/lobby"); // Redirect to the lobby or home page
  };

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const isPlayersTurn = currentPlayer?.id === myPlayerId;

  const renderPlayers = () => (
    <div className="players-panel">
      <h3>Players</h3>
      <ul className="player-list">
        {gameState.players.map((player) => (
          <li
            key={player.id}
            className={`player ${
              player.id === currentPlayer?.id ? "active" : ""
            }`}
          >
            <div className="player-name">
              {player.name} {player.id === myPlayerId ? "(You)" : ""}
            </div>
            <div className="player-score">
              {gameState.gameType === "X01" ? (
                <div className="score-501">{player.score}</div>
              ) : (
                <div className="score-around-clock">
                  Target: {player.currentNumber}
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );

  const renderTurnIndicator = () => {
    if (gameState.isGameOver) {
      const winner = gameState.players.find(
        (p) => p.id === gameState.winner?.id
      );
      return (
        <div className="game-result">
          {gameState.winner?.id === myPlayerId ? (
            <h3 className="winner-message">You won! 🎉</h3>
          ) : (
            <h3 className="winner-message">
              {winner?.nickname || "Opponent"} won!
            </h3>
          )}
        </div>
      );
    }

    return isPlayersTurn ? (
      <div className="turn-indicator">Your turn!</div>
    ) : (
      <div className="turn-indicator">
        Waiting for {currentPlayer?.nickname || "other player"}...
      </div>
    );
  };

  return (
    <div className="game-board">
      <div className="game-header">
        <h2>{gameState.startingScore} Game</h2>
        <button className="leave-button" onClick={handleLeaveGame}>
          Leave Game
        </button>
      </div>

      <div className="game-content">
        {renderPlayers()}

        <div className="dartboard-wrapper">
          {renderTurnIndicator()}
          <Dartboard gameId={gameId} isMyTurn={isPlayersTurn}/>
        </div>

        {/* <div className="history-panel">
          <h3>Throw History</h3>
          <div className="throw-history">
            {gameState.dartsThrownThisTurn === 0 ? (
              <p>No throws yet</p>
            ) : (
              <ul>
                {gameState.history.map((throw_data, index) => {
                  const player = gameState.players.find(
                    (p) => p.id === throw_data.playerId
                  );
                  return (
                    <li key={index} className="throw-entry">
                      <span className="player-name">
                        {player?.nickname || "Unknown"}:
                      </span>
                      <span className="throw-score">
                        {throw_data.score} points
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div> */}
      </div>
    </div>
  );
}

export default GameBoard;
