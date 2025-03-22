import { useState, useCallback, useEffect } from "react";
import { Game, GameType } from "../types";

interface UseGameProps {
  playerId: string | null;
  sendMessage: (type: string, payload: any) => boolean;
  registerMessageHandler: (
    handler: (event: MessageEvent) => void
  ) => () => void;
}

export const useGame = ({
  playerId,
  sendMessage,
  registerMessageHandler,
}: UseGameProps) => {
  const [playerName, setPlayerName] = useState<string>("");
  const [currentGame, setCurrentGame] = useState<Game | null>(null);
  const [availableGames, setAvailableGames] = useState<Game[]>([]);
  const [view, setView] = useState<"lobby" | "game">("lobby");

  // Listen for messages from server
  useEffect(() => {
    const messageHandler = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case "player_info":
            // Handle in parent component
            break;

          case "available_games":
            setAvailableGames(data.payload.games);
            break;

          case "game_created":
            console.log("Game created:", data.payload.gameId);
            break;

          case "game_state":
            setCurrentGame(data.payload.game);
            setView("game");
            break;

          default:
            console.log("Unknown message type:", data.type);
        }
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    };
    const cleanup = registerMessageHandler(messageHandler);
    return cleanup;
  }, [registerMessageHandler]);

  // Update player name
  const updateName = useCallback(
    (name: string) => {
      setPlayerName(name);
      sendMessage("update_name", { name });
    },
    [sendMessage]
  );

  // Create a new game
  const createGame = useCallback(
    (gameType: GameType) => {
      sendMessage("create_game", { gameType });
    },
    [sendMessage]
  );

  // Join an existing game
  const joinGame = useCallback(
    (gameId: string) => {
      sendMessage("join_game", { gameId });
    },
    [sendMessage]
  );

  // Leave current game
  const leaveGame = useCallback(() => {
    if (currentGame) {
      sendMessage("leave_game", { gameId: currentGame.id });
      setCurrentGame(null);
      setView("lobby");
    }
  }, [currentGame, sendMessage]);

  // Handle dart throw
  const handleThrow = useCallback(
    (position: number) => {
      if (currentGame) {
        // Check if it's this player's turn
        if (currentGame.currentPlayerIndex === playerId) {
          sendMessage("throw_dart", {
            gameId: currentGame.id,
            position,
          });
        } else {
          console.log("Not your turn!");
        }
      }
    },
    [currentGame, playerId, sendMessage]
  );

  // Initialize player name if needed
  useEffect(() => {
    if (playerId && !playerName) {
      const defaultName = `Player ${Math.floor(Math.random() * 1000)}`;
      setPlayerName(defaultName);
      sendMessage("update_name", { name: defaultName });
    }
  }, [playerId, playerName, sendMessage]);

  return {
    playerName,
    updateName,
    currentGame,
    availableGames,
    view,
    createGame,
    joinGame,
    leaveGame,
    handleThrow,
  };
};
