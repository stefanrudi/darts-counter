"use client";

import { useEffect, useState } from "react";
import { Dartboard } from "@/components/dartboard";
import { Button } from "@/components/ui/button";
import { Player, Throw } from "../../../server/src/game/types";
import { PlayerList } from "./PlayerList";
import { ThrowHistory } from "./ThrowHistory";
import { useGameStore } from "@/store/gameStore";
import { useNavigate, useParams } from "react-router-dom";
import { socketService } from "@/services/socketService";

export default function GameRoom({ params }: { params: { id: string } }) {
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);  
  const [currentThrow, setCurrentThrow] = useState<Throw | null>(null);
  const [throwsInTurn, setThrowsInTurn] = useState<Throw[]>([]);
  
  const {
    currentGame,
    myPlayerId,
    setCurrentGame: setGameState
  } = useGameStore();
  const navigate = useNavigate();

  // Handle dartboard click
  const handleDartboardScore = (score: number, multiplier: number) => {
    if (!currentGame || !currentPlayer || throwsInTurn.length >= 3) return;

    const throwScore = score * multiplier;
    const newThrow: Throw = {
      score,
      multiplier,
      totalScore: throwScore,
      timestamp: new Date().toISOString()
    };

    setCurrentThrow(newThrow);
    setThrowsInTurn([...throwsInTurn, newThrow]);
  };

  // Submit current turn
  const handleSubmitTurn = () => {
    if (!currentGame || !currentPlayer || throwsInTurn.length === 0) return;

    socketService.throwDart({
      gameId: currentGame.id,
      throws: throwsInTurn
    });

    setCurrentPlayer(currentGame.currentPlayer);

    // Reset throws for next turn
    setThrowsInTurn([]);
    setCurrentThrow(null);
  };

  // Reset current turn
  const handleResetTurn = () => {
    setThrowsInTurn([]);
    setCurrentThrow(null);
  };

  // Leave game and return to lobby
  const handleLeaveGame = () => {
    socketService.leaveGame({ gameId: currentGame!.id });
    setGameState(null);
    //navigate("/lobby"); // Redirect to the lobby or home page
  };

  if (!currentGame) {
    return <div className="container mx-auto p-4">Loading game...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{currentGame?.name}</h1>
        <Button variant="outline" onClick={handleLeaveGame}>
          Leave Game
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-muted p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">
              Current Turn: {currentPlayer?.name}
            </h2>
            <div className="flex space-x-2 mb-4">
              {[0, 1, 2].map((index) => (
                <div
                  key={index}
                  className="w-16 h-16 border rounded-lg flex items-center justify-center text-xl font-bold"
                >
                  {throwsInTurn[index] ? throwsInTurn[index].totalScore : "-"}
                </div>
              ))}
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={handleSubmitTurn}
                disabled={throwsInTurn.length === 0}
              >
                Submit Turn
              </Button>
              <Button
                variant="outline"
                onClick={handleResetTurn}
                disabled={throwsInTurn.length === 0}
              >
                Reset
              </Button>
            </div>
          </div>

          <Dartboard onScore={handleDartboardScore} />
        </div>

        <div className="space-y-6">
          <PlayerList
            players={currentGame!.players}
            currentPlayerId={currentGame?.currentPlayer?.id || ""}
            startingScore={currentGame!.startingScore}
          />

          <ThrowHistory players={currentGame!.players} />
        </div>
      </div>
    </div>
  );
}
