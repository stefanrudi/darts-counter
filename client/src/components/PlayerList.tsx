import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Player } from "../../../server/src/game/types"

interface PlayerListProps {
  players: Player[]
  currentPlayerId: string
  startingScore: number
}

export function PlayerList({ players, currentPlayerId, startingScore }: PlayerListProps) {
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
                player.id === currentPlayerId ? "bg-primary text-primary-foreground" : "bg-muted"
              }`}
            >
              <div className="flex justify-between items-center">
                <div className="font-medium">{player.name}</div>
                <div className="text-xl font-bold">{player.score}</div>
              </div>
              <div className="w-full bg-background/20 h-2 mt-2 rounded-full overflow-hidden">
                <div
                  className="bg-background/60 h-full rounded-full"
                  style={{
                    width: `${100 - (player.score / startingScore) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
