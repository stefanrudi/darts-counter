import React, { useState } from "react";

export function PlayerInfo() {
  const [nickname, setNickname] = useState("");

  return (
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
  );
};