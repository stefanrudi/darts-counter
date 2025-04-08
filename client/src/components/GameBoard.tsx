import { useParams } from "react-router-dom";
import { useGameStore } from "../store/gameStore";
import Dartboard from "./Dartboard";
import { socketService } from "../services/socketService";

export function GameBoard() {
  const { gameId } = useParams<{ gameId: string }>();
  const { gameState, myPlayerId, setGameState } = useGameStore();

  if (!gameState || gameState.gameId !== gameId) {
    // Loading state or redirect handled by App.tsx usually
    return (
      <div className="text-center text-yellow-500">Loading game data...</div>
    );
  }

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const currentPlayerId = currentPlayer?.id;
  const isPlayersTurn = currentPlayer?.id === myPlayerId;

  const handleLeaveGame = () => {
    if (!gameId) {
      alert("Unable to leave the game. Missing game or player information.");
      return;
    }
    // Handle leaving the game
    socketService.leaveGame({ gameId });
    setGameState(null);
  };

  return (
    <div className="game-board">
      <div className="game-header">
        <h2>{gameState.gameType} Game</h2>
        <button
          className="leave-button"
          onClick={handleLeaveGame}
        >
          Leave Game
        </button>
      </div>

      <div className="game-content">
        <div className="players-panel">
          <h3>Players</h3>
          <ul className="player-list">
            {gameState.players.map((player) => (
              <li
                key={player.id}
                className={`player ${isPlayersTurn ? "active" : ""}`}
              >
                <div className="player-name">
                  {player.nickname} {player.id === myPlayerId ? "(You)" : ""}
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

        <div className="dartboard-wrapper">
          {gameState.isGameOver === false ? (
            isPlayersTurn ? (
              <>
                <div className="turn-indicator">Your turn!</div>
                <Dartboard gameId={gameId} isMyTurn={isPlayersTurn} />
              </>
            ) : (
              <>
                <div className="turn-indicator">
                  Waiting for {currentPlayer?.nickname || "other player"}...
                </div>
                <Dartboard gameId={gameId} isMyTurn={isPlayersTurn} />
              </>
            )
          ) : gameState.isGameOver ? (
            <>
              <div className="game-result">
                {gameState.winner?.id === myPlayerId ? (
                  <h3 className="winner-message">You won! 🎉</h3>
                ) : (
                  <h3 className="winner-message">
                    {gameState.players.find(
                      (p) => p.id === gameState.winner?.id
                    )?.nickname || "Opponent"}{" "}
                    won!
                  </h3>
                )}
              </div>
              <Dartboard gameId={gameId} isMyTurn={isPlayersTurn} />
            </>
          ) : (
            <>
              <div className="waiting-message">
                Waiting for players to join...
              </div>
              <Dartboard gameId={gameId} isMyTurn={isPlayersTurn} />
            </>
          )}
        </div>

        {/* <div className="history-panel">
          <h3>Throw History</h3>
          <div className="throw-history">
            {gameState.dartsThrownThisTurn === 0 ? (
              <p>No throws yet</p>
            ) : (
              <ul>
                {game.history.map((throw_data, index) => {
                  const player = game.players.find(
                    (p) => p.id === throw_data.playerId
                  );
                  return (
                    <li key={index} className="throw-entry">
                      <span className="player-name">
                        {player?.name || "Unknown"}:
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
