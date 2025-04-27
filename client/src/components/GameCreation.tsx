"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export interface GameCreationSettings {
  name: string;
  startingScore: number;
  checkoutType: "double" | "single";
  maxPlayers: number;
}
interface GameCreationProps {
  onCreateGame: (gameSettings: GameCreationSettings) => void;
}

export function GameCreation({ onCreateGame }: GameCreationProps) {
  const [gameSettings, setGameSettings] = useState<GameCreationSettings>({
    name: "New Game",
    startingScore: 501,
    checkoutType: "double",
    maxPlayers: 2
  });

  const handleCreateGame = () => {
    onCreateGame(gameSettings); // Pass the game settings to the parent component
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Game</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="game-name">Game Name</Label>
          <Input
            id="game-name"
            value={gameSettings.name}
            onChange={(e) =>
              setGameSettings({ ...gameSettings, name: e.target.value })
            }
          />
        </div>

        <div className="space-y-2">
          <Label>Starting Score</Label>
          <RadioGroup
            defaultValue={gameSettings.startingScore.toString()}
            onValueChange={(value: string) =>
              setGameSettings({
                ...gameSettings,
                startingScore: Number.parseInt(value)
              })
            }
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="501" id="score-501" />
              <Label htmlFor="score-501">501</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="301" id="score-301" />
              <Label htmlFor="score-301">301</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="101" id="score-101" />
              <Label htmlFor="score-101">101</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label>Checkout Type</Label>
          <RadioGroup
            defaultValue={gameSettings.checkoutType}
            onValueChange={(value: string) =>
              setGameSettings({
                ...gameSettings,
                checkoutType: value as "double" | "single"
              })
            }
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="double" id="checkout-double" />
              <Label htmlFor="checkout-double">Double Checkout</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="single" id="checkout-single" />
              <Label htmlFor="checkout-single">Single Checkout</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor="max-players">Game Room Size</Label>
          <Input
            id="max-players"
            type="number"
            min="2"
            max="8"
            value={gameSettings.maxPlayers}
            onChange={(e) =>
              setGameSettings({
                ...gameSettings,
                maxPlayers: Number.parseInt(e.target.value)
              })
            }
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleCreateGame}>Create & Join Game</Button>
      </CardFooter>
    </Card>
  );
}
