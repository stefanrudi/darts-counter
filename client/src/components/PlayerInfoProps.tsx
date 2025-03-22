import React from "react";

interface PlayerInfoProps {
  playerName: string;
  updateName: (name: string) => void;
}

const PlayerInfo: React.FC<PlayerInfoProps> = ({ playerName, updateName }) => {
  return (
    <div className="player-info">
      <label>
        Your Name:
        <input
          type="text"
          value={playerName}
          onChange={(e) => updateName(e.target.value)}
          maxLength={20}
        />
      </label>
    </div>
  );
};

export default PlayerInfo;