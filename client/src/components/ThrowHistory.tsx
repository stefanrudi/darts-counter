import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Player, Throw } from "../../../server/src/game/types";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "./ui/select";
import { ScrollArea } from "./ui/scroll-area";

interface ThrowHistoryProps {
  players: Player[];
}

export function ThrowHistory({ players }: ThrowHistoryProps) {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>("all");
  const [filteredTurns, setFilteredTurns] = useState<
    { playerName: string; throws: Throw[]; totalScore: number }[]
  >([]);

  // Group throws by turns (3 throws per turn)
  const throwsByTurn: {
    playerName: string;
    playerId: string;
    throws: Throw[];
    totalScore: number;
  }[] = [];

  players.forEach((player) => {
    for (let i = 0; i < player.throws.length; i += 3) {
      const turnThrows = player.throws.slice(i, i + 3);
      if (turnThrows.length > 0) {
        throwsByTurn.push({
          playerName: player.name,
          playerId: player.id,
          throws: turnThrows,
          totalScore: turnThrows.reduce(
            (sum, t) => sum + (t.valid ? t.totalScore : 0),
            0
          ) // Only count valid throws
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

  // Filter turns by selected player
  useEffect(() => {
    if (selectedPlayerId === "all") {
      setFilteredTurns(throwsByTurn);
    } else {
      setFilteredTurns(
        throwsByTurn.filter((turn) => turn.playerId === selectedPlayerId)
      );
    }
  }, [selectedPlayerId, players]);

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
        <div className="flex justify-between items-center">
          <CardTitle>Throw History</CardTitle>
          <Select value={selectedPlayerId} onValueChange={setSelectedPlayerId}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Filter by player" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Players</SelectItem>
              {players.map((player) => (
                <SelectItem key={player.id} value={player.id}>
                  {player.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="flex-grow pb-6 pt-0">
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-4">
            {filteredTurns.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                {throwsByTurn.length === 0
                  ? "No throws yet"
                  : "No throws for selected player"}
              </div>
            ) : (
              filteredTurns.map((turn, index) => (
                <div key={index} className="border-b pb-2 last:border-0">
                  <div className="flex justify-between items-center mb-1">
                    <div className="font-medium">{turn.playerName}</div>
                    <div className="text-sm text-muted-foreground">
                      Total: {turn.totalScore}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {turn.throws.map((t, i) => (
                      <div
                        key={i}
                        className={`p-2 rounded text-center ${
                          t.valid ? "bg-muted" : "bg-red-500 text-white"
                        }`}
                      >
                        {getDartLabel(t)}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
