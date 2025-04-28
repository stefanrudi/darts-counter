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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "./ui/card";
import { Loader2, Users } from "lucide-react";
import { WinScreen } from "./WinScreen";

export default function GameRoom({ params }: { params: { id: string } }) {
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [currentThrow, setCurrentThrow] = useState<Throw | null>(null);
  const [throwsInTurn, setThrowsInTurn] = useState<Throw[]>([]);
  const [isLocalPlayerTurn, setIsLocalPlayerTurn] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [isCreator, setIsCreator] = useState(false);

  const { currentGame, setCurrentGame, myPlayerId } = useGameStore();
  const navigate = useNavigate();

  // Redirect to the lobby when the game state is cleared
  useEffect(() => {
    if (!currentGame) {
      navigate("/lobby");
    }
  }, [currentGame, navigate]);

  useEffect(() => {
    if (!currentGame) return;
    if (currentGame?.currentPlayer) {
      setCurrentPlayer(currentGame.currentPlayer);
      setIsLocalPlayerTurn(currentGame.currentPlayer.id === myPlayerId);
    }
    setIsCreator(currentGame.players[0].id === myPlayerId);
    setIsGameStarted(currentGame.gameState !== "waiting");
  }, [currentGame]);

  // Handle dartboard click
  const handleDartboardScore = (score: number, multiplier: number) => {
    if (
      !currentGame ||
      !currentPlayer ||
      !isLocalPlayerTurn ||
      throwsInTurn.length >= 3
    )
      return;

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
    if (
      !currentGame ||
      !currentPlayer ||
      !isLocalPlayerTurn ||
      throwsInTurn.length === 0
    )
      return;

    socketService.throwDart({
      gameId: currentGame.id,
      throws: throwsInTurn
    });

    setCurrentPlayer(currentGame.currentPlayer);

    // Reset throws for next turn
    setThrowsInTurn([]);
    setCurrentThrow(null);
  };

  const handleStartGame = () => {
    if (!currentGame || isGameStarted) return;
    socketService.startGame({ gameId: currentGame.id });
    setIsGameStarted(true);
  };

  const handleBackToLobby = () => {
    if (!currentGame) return;
    setCurrentGame(null);
    navigate("/lobby");
  };

  // Reset current turn
  const handleResetTurn = () => {
    setThrowsInTurn([]);
    setCurrentThrow(null);
  };

  // Leave game and return to lobby
  const handleLeaveGame = async () => {
    if (!currentGame || isLeaving) return;
    setIsLeaving(true);

    try {
      // Notify server to remove player from game
      socketService.leaveGame({ gameId: currentGame.id });
      setCurrentGame(null);
    } catch (error) {
      console.error("Error leaving the game:", error);
      alert("An error occurred while leaving the game.");
    } finally {
      setIsLeaving(false);
    }
  };

  if (!currentGame) {
    return <div className="container mx-auto p-4">Loading game...</div>;
  }

  const canStartGame =
    isCreator && currentGame.players.length >= 2 && !isGameStarted;

  return (
    <div className="container mx-auto p-4">
      {currentGame.winner && (
        <WinScreen
          winner={currentGame.winner}
          onBackToLobby={handleBackToLobby}
          isMatchWinner={!!currentGame.winner}          
        />
      )}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{currentGame?.name}</h1>
        <Button
          variant="outline"
          onClick={handleLeaveGame}
          disabled={isLeaving}
        >
          Leave Game
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {!isGameStarted ? (
            // Show waiting for players UI
            <Card className="bg-muted">
              <CardHeader>
                <CardTitle>Waiting for players to join</CardTitle>
                <CardDescription>
                  {currentGame.players.length} / {currentGame.maxPlayers}{" "}
                  players have joined
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center py-6">
                <Users className="h-10 w-10 text-primary mb-4" />
                <p className="text-center text-muted-foreground mb-6">
                  {isCreator
                    ? "You can start the game once at least 2 players have joined."
                    : "Waiting for the game creator to start the game."}
                </p>

                {isCreator && (
                  <Button
                    onClick={handleStartGame}
                    disabled={!canStartGame}
                    size="lg"
                  >
                    Start Game
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : isLocalPlayerTurn && !currentGame.winner ? (
            // Show active player UI
            <div className="bg-muted p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-2">Your Turn</h2>
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
          ) : !currentGame.winner ? (
            // Show waiting (inactive player) UI
            <Card className="bg-muted">
              <CardHeader>
                <CardTitle>Waiting for {currentPlayer?.name}'s turn</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center py-6">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                <p className="text-center text-muted-foreground">
                  It's currently {currentPlayer?.name}'s turn to throw.
                </p>
              </CardContent>
            </Card>
          ) : null}
          <Dartboard
            onScore={handleDartboardScore}
            disabled={
              !isLocalPlayerTurn || !isGameStarted || !!currentGame.winner
            }
          />
        </div>

        <div className="space-y-6">
          <PlayerList
            players={currentGame!.players}
            currentPlayerId={currentGame?.currentPlayer?.id || ""}
            startingScore={currentGame!.startingScore}
            localPlayerId={myPlayerId || ""}
            winner={currentGame.legWinner}
            bestOf={currentGame.bestOf}
            currentLeg={currentGame.currentLeg}
          />

          <ThrowHistory players={currentGame!.players} />
        </div>
      </div>
    </div>
  );
}
