import React, { useEffect, useState } from "react";
import { GameType, X01Variant } from "../../../server/src/game/types";
import { socketService } from "../services/socketService";
import { useGameStore } from "../store/gameStore";

interface GameLobbyProps {
  availableGames: {
    id: string;
    gameType: string;
    playerCount: number;
    createdAt: string;
  }[];
}

export function GameLobby() {
  const { myPlayerId } = useGameStore();

  const [nickname, setNickname] = useState("");
  const [gameType, setGameType] = useState<GameType>("X01");
  const [x01Variant, setX01Variant] = useState<X01Variant>(501);
  const [availableGames, setAvailableGames] = useState<
    {
      gameId: string;
      gameType: string;
      variant?: number;
      playerCount: number;
    }[]
  >([]);

  // Set the nickname when myPlayerId changes
  useEffect(() => {
    if (myPlayerId) {
      setNickname(`Player ${myPlayerId.slice(-4)}`);
    }
  }, [myPlayerId]);

  // Manage WebSocket events for available games
  useEffect(() => {
    // Fetch the initial list of available games
    socketService.getAvailableGames();

    socketService.onAvailableGames((games) => {
      setAvailableGames(games);
    });

    // Cleanup the listener on unmount
    return () => {
      socketService.offAvailableGames();
    };
  }, []);

  const handleCreateGame = () => {
    if (!nickname.trim()) {
      alert("Please enter a nickname.");
      return;
    }
    const payload = {
      nickname: nickname.trim(),
      gameType: gameType,
      variant: gameType === "X01" ? x01Variant : undefined
    };
    socketService.createGame(payload);
  };

  const handleJoinGame = (gameId: string) => {
    if (!nickname.trim()) {
      alert("Please enter a nickname.");
      return;
    }
    if (!gameId.trim()) {
      alert("Game ID is not defined!");
      return;
    }
    const payload = {
      nickname: nickname.trim(),
      gameId: gameId.trim()
    };
    socketService.joinGame(payload);
  };

  return (
    <div className="game-lobby">
      <div className="player-info">
        <label>
          Your Name:
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={20}
          />
        </label>
      </div>

      <h2>Game Lobby</h2>

      <div className="create-game">
        <h3>Create New Game</h3>
        <div className="game-options">
          <label>
            <input
              type="radio"
              name="gameType"
              value="501"
              checked={gameType === "X01"}
              onChange={() => setGameType("X01")}
            />
            501
          </label>
          <label>
            <input
              type="radio"
              name="gameType"
              value="around-the-clock"
              checked={gameType === "AroundTheClock"}
              onChange={() => setGameType("AroundTheClock")}
            />
            Around the Clock
          </label>
        </div>
        <button onClick={() => handleCreateGame()}>Create Game</button>
      </div>

      <div className="available-games">
        <h3>Available Games</h3>
        {availableGames.length === 0 ? (
          <p>No games available. Create one!</p>
        ) : (
          <ul>
            {availableGames.map((game) => (
              <li key={game.gameId}>
                <div className="game-info">
                  <span className="game-type">{game.gameType}</span>
                  <span className="player-count">
                    {game.playerCount} player(s)
                  </span>
                  <span className="created-at">
                    {game.variant ? `Variant: ${game.variant}` : ""}
                  </span>
                </div>
                <button onClick={() => handleJoinGame(game.gameId)}>
                  Join Game
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
