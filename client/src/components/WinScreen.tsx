import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Trophy, PartyPopper, Home } from "lucide-react";
import confetti from "canvas-confetti";
import { Player } from "../../../server/src/game/types";

interface WinScreenProps {
  winner: Player;
  onBackToLobby: () => void;
  isMatchWinner: boolean;  
}

export function WinScreen({
  winner,
  onBackToLobby,
  isMatchWinner,
}: WinScreenProps) {
  const [showConfetti, setShowConfetti] = useState(isMatchWinner);

  // Trigger confetti effect when the component mounts
  useEffect(() => {
    if (showConfetti) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const interval: any = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);

        // Since particles fall down, start a bit higher than random
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);

      return () => {
        clearInterval(interval);
      };
    }
  }, [showConfetti]);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-card text-card-foreground rounded-lg shadow-lg max-w-md w-full p-6 animate-in zoom-in-95 duration-300">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center">
            <Trophy
              className={`h-10 w-10 ${
                isMatchWinner ? "text-yellow-500" : "text-primary"
              }`}
            />
          </div>

          <h2 className="text-3xl font-bold">
            {isMatchWinner ? "Match Complete!" : "Leg Complete!"}
          </h2>

          <div className="flex items-center space-x-2">
            <PartyPopper className="h-6 w-6 text-yellow-500" />
            <p className="text-xl">
              <span className="font-bold">{winner.name}</span>{" "}
              {isMatchWinner ? "has won the match!" : "has won this leg!"}
            </p>
            <PartyPopper className="h-6 w-6 text-yellow-500" />
          </div>

          <p className="text-muted-foreground">
            {isMatchWinner
              ? "Congratulations on a great game! Would you like to play again?"
              : "Get ready for the next leg!"}
          </p>

          <div className="pt-4 w-full space-y-2">
            {isMatchWinner ? (
              <Button onClick={onBackToLobby} className="w-full" size="lg">
                <Home className="mr-2 h-4 w-4" />
                Back to Lobby
              </Button>
            ) : null}

            {!isMatchWinner && (
              <Button
                onClick={onBackToLobby}
                variant="outline"
                className="w-full"
              >
                <Home className="mr-2 h-4 w-4" />
                Back to Lobby
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
