import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Player, Throw } from "../../../server/src/game/types";

interface ThrowHistoryProps {
  players: Player[];
}

export function ThrowHistory({ players }: ThrowHistoryProps) {
  // Get all throws from all players, sorted by timestamp
  const allThrows = players
    .flatMap((player) =>
      player.throws.map((t) => ({
        ...t,
        playerName: player.name,
        playerId: player.id
      }))
    )
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

  // Group throws by turns (3 throws per turn)
  const throwsByTurn: {
    playerName: string;
    throws: Throw[];
    totalScore: number;
  }[] = [];

  players.forEach((player) => {
    for (let i = 0; i < player.throws.length; i += 3) {
      const turnThrows = player.throws.slice(i, i + 3);
      if (turnThrows.length > 0) {
        throwsByTurn.push({
          playerName: player.name,
          throws: turnThrows,
          totalScore: turnThrows.reduce((sum, t) => sum + t.totalScore, 0)
        });
      }
    }
  });

  // Sort turns by timestamp of the first throw in each turn
  throwsByTurn.sort(
    (a, b) =>
      new Date(b.throws[0].timestamp).getTime() -
      new Date(a.throws[0].timestamp).getTime()
  );

  function getDartLabel(t: Throw) {
    const { score, multiplier } = t;
    if (score === 25 && multiplier === 1) return "Single Bull";
    if (score === 25 && multiplier === 2) return "Bulls Eye";
    if (multiplier === 2) return `D${score}`;
    if (multiplier === 3) return `T${score}`;
    return `${score}`;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Throw History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-[400px] overflow-y-auto">
          {throwsByTurn.length === 0 ? (
            <div className="text-center text-muted-foreground">
              No throws yet
            </div>
          ) : (
            throwsByTurn.map((turn, index) => (
              <div key={index} className="border-b pb-2 last:border-0">
                <div className="flex justify-between items-center mb-1">
                  <div className="font-medium">{turn.playerName}</div>
                  <div className="text-sm text-muted-foreground">
                    Total: {turn.totalScore}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {turn.throws.map((t, i) => (
                    <div key={i} className="bg-muted p-2 rounded text-center">
                      {getDartLabel(t)}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
