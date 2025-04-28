"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Users } from "lucide-react";
import { GameInterface } from "../../../server/src/game/types";
import { Badge } from "./ui/badge";

interface GameListProps {
  games: GameInterface[];
  onJoinGame: (gameId: string) => void;
}

export function GameList({ games, onJoinGame }: GameListProps) {
  const availableGames = games.filter(
    (game) => game.players.length < game.maxPlayers
  );

  if (availableGames.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Available Games</CardTitle>
          <CardDescription>
            No games available. Create a new one!
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Available Games</CardTitle>
        <CardDescription>Join an existing game</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {availableGames.map((game) => (
            <div
              key={game.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div>
                <h3 className="font-medium">{game.name}</h3>
                <div className="text-sm text-muted-foreground">
                  {game.startingScore} points, {game.checkoutType} checkout
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="w-4 h-4 mr-1" />
                    {game.players.length} / {game.maxPlayers} players
                  </div>
                  <Badge variant="outline">Best of {game.bestOf}</Badge>
                </div>
              </div>
              <Button onClick={() => onJoinGame(game.id)}>Join</Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
