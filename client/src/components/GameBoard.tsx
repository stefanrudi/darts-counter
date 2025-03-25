import Dartboard from "./Dartboard";

const GameBoard = ({ game, playerId, leaveGame, onThrow }) => {
  const isPlayersTurn = game.currentPlayerId === playerId;
  const currentPlayer = game.players.find((p) => p.id === game.currentPlayerId);

  return (
    <div className="game-board">
      <div className="game-header">
        <h2>{game.gameType} Game</h2>
        <button className="leave-button" onClick={leaveGame}>
          Leave Game
        </button>
      </div>

      <div className="game-content">
        <div className="players-panel">
          <h3>Players</h3>
          <ul className="player-list">
            {game.players.map((player) => (
              <li
                key={player.id}
                className={`player ${
                  player.id === game.currentPlayerId ? "active" : ""
                }`}
              >
                <div className="player-name">
                  {player.name} {player.id === playerId ? "(You)" : ""}
                </div>
                <div className="player-score">
                  {game.gameType === "501" ? (
                    <div className="score-501">{player.score.score}</div>
                  ) : game.gameType === "cricket" ? (
                    <div className="score-cricket">
                      {Object.entries(player.score.marks).map(
                        ([target, marks]) => (
                          <div key={target} className="cricket-mark">
                            <span className="target">{target}</span>
                            <span className="marks">
                              {marks > 0
                                ? marks > 1
                                  ? marks > 2
                                    ? "X"
                                    : "/"
                                  : "-"
                                : ""}
                            </span>
                          </div>
                        )
                      )}
                      <div className="total-score">{player.score.score}</div>
                    </div>
                  ) : (
                    <div className="score-around-clock">
                      Target: {player.score.currentTarget}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="dartboard-wrapper">
          {game.status === "playing" ? (
            isPlayersTurn ? (
              <>
                <div className="turn-indicator">Your turn!</div>
                <Dartboard onThrow={onThrow} readOnly={false} />
              </>
            ) : (
              <>
                <div className="turn-indicator">
                  Waiting for {currentPlayer?.name || "other player"}...
                </div>
                <Dartboard onThrow={() => {}} readOnly={true} />
              </>
            )
          ) : game.status === "finished" ? (
            <>
              <div className="game-result">
                {game.winner === playerId ? (
                  <h3 className="winner-message">You won! 🎉</h3>
                ) : (
                  <h3 className="winner-message">
                    {game.players.find((p) => p.id === game.winner)?.name ||
                      "Opponent"}{" "}
                    won!
                  </h3>
                )}
              </div>
              <Dartboard readOnly={true} />
            </>
          ) : (
            <>
              <div className="waiting-message">
                Waiting for players to join...
              </div>
              <Dartboard readOnly={true} />
            </>
          )}
        </div>

        <div className="history-panel">
          <h3>Throw History</h3>
          <div className="throw-history">
            {game.history.length === 0 ? (
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
        </div>
      </div>
    </div>
  );
};

export default GameBoard;
