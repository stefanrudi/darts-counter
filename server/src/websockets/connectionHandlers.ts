import { Socket, Server as SocketIOServer } from 'socket.io';
import { GameManager } from "../game/GameManager";
import { CreateGamePayload, JoinGamePayload, ThrowDartPayload } from './types';

export function handleConnection(socket: Socket, io: SocketIOServer, gameManager: GameManager) {

    socket.on('create_game', (payload: CreateGamePayload) => {
        const { nickname, gameType, variant } = payload;

        const game = gameManager.createGame(gameType, variant);
        const player = game.addPlayer(socket.id, nickname);

        if (!player) {
            socket.emit('error_occurred', { message: 'Failed to add player to created game.' });
            gameManager.deleteGame(game.gameId);
            return;
        }

        socket.join(game.gameId);
        console.log(`Player ${player.nickname} (${socket.id}) created and joined game ${game.gameId}`);

        // Send game state back to the creator
        socket.emit('game_update', game.getCurrentState());
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

        socket.join(game.gameId);
        console.log(`Player ${player.nickname} (${socket.id}) joined game ${game.gameId}`);

        // Notify all players in the game about the new player
        io.to(game.gameId).emit('game_update', game.getCurrentState());
    });

    socket.on('throw_dart', (payload: ThrowDartPayload) => {
        const { gameId, segment } = payload;
        const game = gameManager.getGame(gameId);
        if (!game) {
            socket.emit('error_occurred', { message: `Game ${payload.gameId} not found.` });
            return;
        }

        const result = game.handleThrow(socket.id, payload.segment);
        if ('error' in result) {
            socket.emit('error_occurred', { message: result.error });
        } else {
            // Broadcast updated state to everyone in the game room
            io.to(game.gameId).emit('game_update', result);

            // Check if game ended and maybe clean up
            if (result.isGameOver) {
                console.log(`Game ${game.gameId} ended. Winner: ${result.winner?.nickname}`);
                gameManager.deleteGame(game.gameId);
            }
        }
    });

    socket.on('get_available_games', () => {
        const availableGames  = gameManager.getAvailableGames();
        socket.emit('available_games', availableGames);
    });

    socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
        // Find which game the player was in
        const game = gameManager.findGameByPlayerId(socket.id);
        if (game) {
            console.log(`Player ${socket.id} disconnecting from game ${game.gameId}`);
            const removed = game.removePlayer(socket.id);
            if (removed) {
                // Notify remaining players
                io.to(game.gameId).emit('player_left', { playerId: socket.id });

                // Send updated state
                io.to(game.gameId).emit('game_update', game.getCurrentState());

                // If game becomes empty or unplayable, potentially remove it
                if (game.players.length === 0 || game.isGameOver) {
                    console.log(`Removing game ${game.gameId} after player disconnect.`);
                    gameManager.deleteGame(game.gameId);
                }
            }
        }
    });
}