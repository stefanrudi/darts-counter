import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Player } from "../../../server/src/game/types";
import { useGameStore } from "@/store/gameStore";
import { UserPlus, Trophy } from "lucide-react";

interface PlayerListProps {
  players: Player[];
  currentPlayerId: string;
  startingScore: number;
  localPlayerId: string;
  winner?: Player;
}

export function PlayerList({
  players,
  currentPlayerId,
  startingScore,
  localPlayerId,
  winner
}: PlayerListProps) {
  const { myPlayerId, currentGame } = useGameStore();
  return (
    <Card>
      <CardHeader>
        <CardTitle>Players</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {players.map((player) => (
            <div
              key={player.id}
              className={`p-3 rounded-lg ${
                winner?.id === player.id 
                ? "bg-yellow-500/20 border border-yellow-500"                
                : player.id === currentPlayerId
                  ? "bg-primary text-primary-foreground"
                  : player.id === localPlayerId
                    ? "bg-secondary"                    
                    : "bg-muted"
              }`}
            >
              <div className="flex justify-between items-center">
              <div className="font-medium flex items-center">
                  {player.name}
                  {player.id === myPlayerId && " (You)"}
                  {winner?.id === player.id && <Trophy className="ml-2 h-4 w-4 text-yellow-500" />}
                </div>
                <div className="text-xl font-bold">{player.score}</div>
              </div>
              <div className="w-full bg-background/20 h-2 mt-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${winner?.id === player.id ? "bg-yellow-500" : "bg-background/60"}`}
                  style={{
                    width: `${100 - (player.score / startingScore) * 100}%`
                  }}
                />
              </div>
            </div>
          ))}

          {players.length < currentGame!.maxPlayers && currentGame?.gameState === "waiting" && (
            <div className="p-3 rounded-lg border border-dashed border-muted-foreground/30 flex items-center justify-center text-muted-foreground">
              <UserPlus className="w-4 h-4 mr-2" />
              <span>Waiting for more players...</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
