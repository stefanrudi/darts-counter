import { Socket, Server as SocketIOServer } from 'socket.io';
import { GameManager } from "../game/GameManager";
import { CreateGamePayload, JoinGamePayload, LeaveGamePayload, ThrowDartPayload } from './types';

export function handleConnection(socket: Socket, io: SocketIOServer, gameManager: GameManager) {

    socket.on('create_game', (payload: CreateGamePayload) => {
        const { nickname, gameType, variant } = payload;

        const game = gameManager.createGame(gameType, variant);
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
        io.emit('available_games', gameManager.getAvailableGames());
    });

    socket.on('join_game', (payload: JoinGamePayload) => {
        const { nickname, gameId } = payload;

        const game = gameManager.getGame(gameId);

        if (!game) {
            socket.emit('error_occurred', { message: `Game ${gameId} not found!` });
            return;
        }

        const player = game.addPlayer(socket.id, nickname);
        if (!player) {
            socket.emit('error_occurred', { message: `Failed to join game ${gameId} to the game.` });
            return;
        }

        socket.join(game.id);
        console.log(`Player ${player.name} (${socket.id}) joined game ${game.id}`);

        // Notify all players in the game about the new player
        io.to(game.id).emit('game_update', game.getCurrentState());
    });

    socket.on('leave_game', (payload: LeaveGamePayload) => {
        const { gameId } = payload;
        const game = gameManager.getGame(gameId);

        if (!game) {
            socket.emit('error_occurred', { message: `Game ${gameId} not found!` });
            return;
        }

        const playerId = socket.id;
        const removed = game.removePlayer(playerId);
        if (removed) {
            io.to(gameId).emit("player_left", { playerId });
            // Notify all players in the game about the new player
            io.to(game.id).emit('game_update', game.getCurrentState());

            if (game.players.length === 0 || game.isGameOver) {
                gameManager.deleteGame(gameId);
            }
        }
    });

    socket.on('throw_dart', (payload: ThrowDartPayload) => {
        const { gameId, segment } = payload;
        const game = gameManager.getGame(gameId);
        if (!game) {
            socket.emit('error_occurred', { message: `Game ${payload.gameId} not found.` });
            return;
        }

        const result = game.handleThrow(socket.id, segment);
        if ('error' in result) {
            socket.emit('error_occurred', { message: result.error });
        } else {
            // Broadcast updated state to everyone in the game room
            io.to(game.id).emit('game_update', result);

            // Check if game ended and maybe clean up
            if (result.isGameOver) {
                console.log(`Game ${game.id} ended. Winner: ${result.winner?.name}`);
                gameManager.deleteGame(game.id);
            }
        }
    });

    socket.on('get_available_games', () => {
        const availableGames = gameManager.getAvailableGames();
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
                if (game.players.length === 0 || game.isGameOver) {
                    console.log(`Removing game ${game.id} after player disconnect.`);
                    gameManager.deleteGame(game.id);
                }
            }
        }
    });
}