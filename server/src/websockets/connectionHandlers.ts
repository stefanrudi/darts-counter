import { Socket, Server as SocketIOServer } from 'socket.io';
import { GameManager } from "../game/GameManager";
import { CreateGamePayload, JoinGamePayload, LeaveGamePayload, ThrowDartPayload } from './types';

export function handleConnection(socket: Socket, io: SocketIOServer, gameManager: GameManager) {

    socket.on('create_game', (payload: CreateGamePayload) => {
        const { gameName, variant, checkoutType, maxPlayers, nickname } = payload;

        const game = gameManager.createGame(gameName, variant, checkoutType, maxPlayers);
        const player = game.addPlayer(socket.id, nickname);

        if (!player) {
            socket.emit('error_occurred', { message: 'Failed to add player to created game.' });
            gameManager.deleteGame(game.id);
            return;
        }

        socket.join(game.id);
        console.log(`Player ${player.name} (${socket.id}) created and joined game ${game.id}`);

        // Send game state back to the creator
        socket.emit('game_update', game.getCurrentState());

        // Notify all clients about the updated list of available games
        io.emit('available_games', gameManager.getAllWaitingGames());
    });

    socket.on('join_game', (payload: JoinGamePayload) => {
        const { nickname, gameId } = payload;

        const updatedGame = gameManager.addPlayerToGame(gameId, socket.id, nickname);
        if (!updatedGame) {
            socket.emit('error_occurred', { message: `Failed to join game ${gameId} to the game.` });
            return;
        }

        socket.join(gameId);
        console.log(`Player ${nickname} (${socket.id}) joined game ${gameId}`);

        // Notify all players in the game about the new player
        io.to(gameId).emit('game_update', updatedGame.getCurrentState());
    });

    socket.on('leave_game', (payload: LeaveGamePayload) => {
        const { gameId } = payload;

        // Attempt to remove the player from the game
        const updatedGame = gameManager.removePlayerFromGame(gameId, socket.id);
        if (!updatedGame) {
            socket.emit('error_occurred', { message: `Failed to leave game ${gameId}.` });
            return;
        }

        // Notify all players in the game about the player leaving
        io.to(gameId).emit("player_left", { socketId: socket.id });

        // If the game still has players, emit the updated game state
        if (updatedGame.players.length > 0 && updatedGame.gameState !== "finished") {
            io.to(gameId).emit('game_update', updatedGame.getCurrentState());
            return;
        }

        // If the game is empty or finished, delete it
        deleteGame(gameId);
    });

    function deleteGame(gameId: string) {
        const success = gameManager.deleteGame(gameId);
        if (!success) {
            console.log(`Failed to delete game ${gameId}.`);
            return;
        }
        console.log(`Game ${gameId} deleted.`);
        io.emit('available_games', gameManager.getAllWaitingGames());

        // Notify all clients that the game has been deleted
        io.to(gameId).emit('game_update', null);
    }

    socket.on('throw_dart', (payload: ThrowDartPayload) => {
        const { gameId, throws } = payload;
        const game = gameManager.getGame(gameId);
        if (!game) {
            socket.emit('error_occurred', { message: `Game ${payload.gameId} not found.` });
            return;
        }

        const result = gameManager.handleThrows(socket.id, game, throws);
        if ('error' in result) {
            socket.emit('error_occurred', { message: result.error });
        } else {
            // Broadcast updated state to everyone in the game room
            io.to(game.id).emit('game_update', result);

            // Check if game ended and maybe clean up
            if (result.gameState === 'finished') {
                console.log(`Game ${game.id} ended. Winner: ${result.winner?.name}`);
                // gameManager.deleteGame(game.id);
            }
        }
    });

    socket.on('get_available_games', () => {
        const availableGames = gameManager.getAllWaitingGames();
        socket.emit('available_games', availableGames);
    });

    socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
        // Find which game the player was in
        const game = gameManager.findGameByPlayerId(socket.id);
        if (game) {
            console.log(`Player ${socket.id} disconnecting from game ${game.id}`);
            const removed = game.removePlayer(socket.id);
            if (removed) {
                // Notify remaining players
                io.to(game.id).emit('player_left', { playerId: socket.id });

                // Send updated state
                io.to(game.id).emit('game_update', game.getCurrentState());

                // If game becomes empty or unplayable, potentially remove it
                if (game.players.length === 0 || game.gameState === "finished") {
                    console.log(`Removing game ${game.id} after player disconnect.`);
                    gameManager.deleteGame(game.id);
                }
            }
        }
    });
}