import React, { useState } from 'react';

interface GameLobbyProps {
    availableGames: { id: string, gameType: string, playerCount: number, createdAt: string }[];
    createGame: (gameType: string) => void;
    joinGame: (gameId: string) => void;
}

const GameLobby: React.FC<GameLobbyProps> = ({ availableGames, createGame, joinGame }: GameLobbyProps) => {
    const [selectedGameType, setSelectedGameType] = useState('501');
    
    return (
      <div className="game-lobby">
        <h2>Game Lobby</h2>
        
        <div className="create-game">
          <h3>Create New Game</h3>
          <div className="game-options">
            <label>
              <input
                type="radio"
                name="gameType"
                value="501"
                checked={selectedGameType === '501'}
                onChange={() => setSelectedGameType('501')}
              />
              501
            </label>
            <label>
              <input
                type="radio"
                name="gameType"
                value="around-the-clock"
                checked={selectedGameType === 'around-the-clock'}
                onChange={() => setSelectedGameType('around-the-clock')}
              />
              Around the Clock
            </label>
          </div>
          <button onClick={() => createGame(selectedGameType)}>Create Game</button>
        </div>
        
        <div className="available-games">
          <h3>Available Games</h3>
          {availableGames.length === 0 ? (
            <p>No games available. Create one!</p>
          ) : (
            <ul>
              {availableGames.map(game => (
                <li key={game.id}>
                  <div className="game-info">
                    <span className="game-type">{game.gameType}</span>
                    <span className="player-count">{game.playerCount} player(s)</span>
                    <span className="created-at">
                      {new Date(game.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <button onClick={() => joinGame(game.id)}>Join Game</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  };
  
  export default GameLobby;