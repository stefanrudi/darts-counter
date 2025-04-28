import { useEffect, useState } from "react";
import { GameInterface } from "../../../server/src/game/types";
import { socketService } from "../services/socketService";
import { useGameStore } from "../store/gameStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GameList } from "./GameList";
import { GameCreation } from "./GameCreation";
import { CreateGamePayload } from "../../../server/src/websockets/types";
import { GameCreationSettings } from "./GameCreation";

export function GameLobby() {
  const { playerName, isNameSet, setPlayerName, setIsNameSet } = useGameStore();
  const [games, setGames] = useState<GameInterface[]>();

  // Manage WebSocket events for available games
  useEffect(() => {
    // Fetch the initial list of available games
    socketService.getAvailableGames();

    socketService.onAvailableGames((games) => {
      setGames(games);
    });

    // Cleanup the listener on unmount
    return () => {
      socketService.offAvailableGames();
    };
  }, []);

  const handleNameSubmit = () => {
    if (playerName.trim()) {
      setIsNameSet(true);
    }
  };

  const handleCreateGame = (gameSettings: GameCreationSettings) => {
    const payload: CreateGamePayload = {
      gameName: gameSettings.name,
      nickname: playerName,
      variant: gameSettings.startingScore,
      checkoutType: gameSettings.checkoutType,
      maxPlayers: gameSettings.maxPlayers,
      legsToWin: gameSettings.legsToWin
    };
    socketService.createGame(payload);
  };

  const handleJoinGame = (gameId: string) => {
    const payload = {
      nickname: playerName,
      gameId: gameId.trim()
    };
    socketService.joinGame(payload);
  };

  if (!isNameSet) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Welcome to Darts Counter</CardTitle>
          <CardDescription>Please enter your name to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Enter your name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleNameSubmit}>Continue</Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Welcome, {playerName}!</h2>
        <Button variant="outline" onClick={() => setIsNameSet(false)}>
          Change Name
        </Button>
      </div>

      <Tabs defaultValue="join" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="join">Join Game</TabsTrigger>
          <TabsTrigger value="create">Create Game</TabsTrigger>
        </TabsList>
        <TabsContent value="join">
          <GameList games={games || []} onJoinGame={handleJoinGame} />
        </TabsContent>
        <TabsContent value="create">
          <GameCreation onCreateGame={handleCreateGame} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
