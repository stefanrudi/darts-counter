import WebSocket from "ws";
import { games, players } from "../models/Store";
import { addPlayerToGame, createGame, moveToNextPlayer, processThrow } from "../services/GameService";
import { Game, Player } from "../utils/types";
import { error } from "console";


/**
 * Handler responsible for incoming messages 
 * @param ws 
 * @param message 
 * @param playerId 
 */
export function handleMessage(ws: WebSocket, message: string, playerId: string){
    try {
        const data = JSON.parse(message);
        updatePlayerConnection(playerId);

        switch (data.type) {
            case "create_game":
                handleCreateGame(ws, data.payload, playerId);
                break;
            case "join_game":
                handleJoinGame(data.payload, playerId);
                break;
            case "throw_dart":
                handleThrowDart(data.payload, playerId);
                break;
            case "update_name": 
                handleUpdateName(data.payload, playerId);
                break;
            case "leave_game":
                handleLeaveGame(data.payload, playerId);
                break;
            case "pong": 
                handleClientPong(playerId);
            case "reconnect": 
                handleReconnect(data.payload, playerId, ws);
        }
    } catch (err) {
        console.error("Error processing message:", err);
    }
}

function handleCreateGame(ws: WebSocket, payload: any, playerId: string): void {
    const game = createGame(payload.gameType);
    addPlayerToGame(game.id, playerId);

    // Notify creator
    ws.send(
        JSON.stringify({
            type: "game_created",
            payload: { gameId: game.id}
        })
    );

    // Notify all waiting clients about the new game
    broadcastAvailableGames();
}

function handleJoinGame(payload: any, playerId: string): void {
    const game: Game | null = addPlayerToGame(payload.gameId, playerId);
    if (game) {
        // Notify all players in the game
        broadcastGameState(game);

        // If this caused the game to start, broadcast available games update
        if (game.status === "playing") {
          broadcastAvailableGames();
        }
    }
}

function handleThrowDart(payload: any, playerId: string): void {
    const { gameId, position } = payload;
    const result = processThrow(gameId, playerId, position);

    if (result) {
        broadcastGameState(result.game);
    }
}

function handleUpdateName(payload: any, playerId: string): void {
    const { name } = payload;
    const player: Player | undefined = players.get(playerId);
    if (player) {
        player.name = name;

        // Update all games this player is in
        for (const game of games.values()) {
            if (game.players.includes(playerId)) {
                broadcastGameState(game);
            }
        }
    }
}

function handleLeaveGame(payload: any, playerId: string): void {
    const { gameId } = payload;
    const game = games.get(gameId);

    if (game) {
        // Remove player from game
        const playerIndex = game.players.indexOf(playerId);
        if (playerIndex > -1) {
            game.players.splice(playerIndex, 1);
    
            // Remove game when no players left
            if (game.players.length === 0) {
                games.delete(gameId);
                broadcastAvailableGames();
            } else {
                // If it was this player's turn, move to next player
                broadcastGameState(game);
            }
        }
    }
}

function handleClientPong(playerId: string): void {
    // Client-initiated pong (heartbeat response)
    const player: Player | undefined = players.get(playerId);
    updatePlayerConnection(playerId);
}

function handleReconnect(payload: any, playerId: string, ws: WebSocket): void {
    // Player is reconnecting with their ID
    const { reconnectId } = payload;
    const existingPlayer: Player | undefined = players.get(reconnectId);

    // Reconnect ID not found
    if (!existingPlayer) {
        ws.send(JSON.stringify({
            type: "reconnect_failed",
            payload: { error: "Player ID not found"}
        }));
        return;
    }
    
    // Close old connection if it exists
    if (existingPlayer.ws && existingPlayer.ws.readyState === WebSocket.OPEN) {
        existingPlayer.ws.close(1000, "Reconnecting from another client");
    }

    // Update the websocket connection
    existingPlayer.ws = ws;
    existingPlayer.isConnected = true;
    existingPlayer.lastPing = Date.now();

    // Send confirmation to client
    ws.send(JSON.stringify({
        type: "reconnect_success",
        payload: { id: reconnectId, name: existingPlayer.name }
    }));

    // Remove temporary player ID
    players.delete(playerId);

    // Re-assign playerId to the reconnected ID for the rest of this handler
    playerId = reconnectId;

    // Send active games this player is part of
    const playerGames = Array.from(games.values()).filter(g => g.players.includes(playerId));

    ws.send(JSON.stringify({
        type: "active_games",
        payload: {
            games: playerGames.map(game => ({
                id: game.id,
                gameType: game.gameType,
                status: game.status
            }))
        }
    }));

    // Update games states
    playerGames.forEach(game => {
        broadcastGameState(game);
    });
   
}

// Broadcast available games to all waiting clients
function broadcastAvailableGames(): void{
    const availableGames = Array.from(games.values()).filter(g => g.status === "waiting")
        .map(({ id, players, gameType, createdAt }) => ({
            id, 
            playerCount: players.length,
            gameType,
            createdAt
        }));

    for (const [playerId, player] of players.entries()){
        if (player.ws.readyState === WebSocket.OPEN) {
            try {
                player.ws.send(
                    JSON.stringify({
                        type: "available_games",
                        payload: { games: availableGames },
                    })
                );                
            } catch (error) {
                console.error(`Error sending available games to player ${playerId}:`, error);
                handlePlayerDisconnect(playerId, false);
            }
        }
    }
}

// Broadcast game state to all players in a game
function broadcastGameState(game: Game): void {
    // Create client-friendly game state (without WebSocket objects)
    // TODO: weird
    const gameState = {
        id: game.id,
        players: game.players.map((id) => ({
            id,
            name: players.get(id)?.name || 'Unknown Player',
            isConnected: players.get(id)?.isConnected || false,
            score: game.scores[id]
        })),
        gameType: game.gameType,
        currentPlayerId: game.currentPlayerId,
        status: game.status,        
        history: game.history.slice(-10),
        winner: game.winner || undefined        
    };

    for (const playerId of game.players) {
        const player = players.get(playerId);
        if (player && player.ws.readyState === WebSocket.OPEN) {
            try {
                player.ws.send(
                    JSON.stringify({
                        type: "game_state",
                        payload: { game: gameState }
                    })
                );                
            } catch (error) {
                console.error(`Error sending game state to player ${playerId}:`, error);
                handlePlayerDisconnect(playerId, false);
            }
        };
    }        
}

/**
 * Handler for Player Disconneting
 * @param playerId 
 * @param removePlayer 
 */
export function handlePlayerDisconnect(playerId: string, removePlayer: boolean): void {
    // Update player status
    const player: Player | undefined = players.get(playerId);
    if (player) {
        player.isConnected = false;

        // Remove player if specified
        if (removePlayer) players.delete(playerId);

        // Update all games this player is in
        for (const game of games.values()) {
            if (game.players.includes(playerId)) {
                // If it's disconnected player's turn, move to next player
                if (game.currentPlayerId === playerId && game.status === "playing") {
                    moveToNextPlayer(game);
                }

                // Remove player and game (if empty)
                if (removePlayer) {
                    const playerIndex = game.players.indexOf(playerId);
                    if (playerIndex > -1) {
                        game.players.splice(playerIndex, 1);

                        // If no players left, remove game
                        if (game.players.length === 0) {
                            games.delete(game.id);
                        } else {
                            broadcastGameState(game);
                        }
                    }
                } else {
                    // Just update game state to show disconnected player
                    broadcastGameState(game);
                }
            }
        }
        // Update available games list
        broadcastAvailableGames();
    }
}

/**
 * 
 * @param playerId 
 */
export function updatePlayerConnection(playerId: string): void {
    const player: Player | undefined = players.get(playerId);
    if (player) {
        player.lastPing = Date.now();
        player.isConnected = true;
    }
}