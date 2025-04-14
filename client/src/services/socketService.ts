import { io, Socket } from 'socket.io-client';
import { Game } from '../../../server/src/game/types';
import { CreateGamePayload, JoinGamePayload, ThrowDartPayload, LeaveGamePayload } from '../../../server/src/websockets/types';

const SERVER_URL = 'http://localhost:3001';

class SocketService {
    private socket: Socket | null = null;

    connect(): Promise<Socket> {
        return new Promise((resolve, reject) => {
            if (this.socket?.connected) {
                console.warn('Socket already connected');
                resolve(this.socket);
                return;
            }

            this.socket = io(SERVER_URL, {
                transports: ['websocket'],
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
            });

            this.socket.on('connect', () => {
                console.log('Connected to WebSocket server:', this.socket?.id);
                resolve(this.socket!);
            });

            this.socket.on('connect_error', (error) => {
                console.error('Connection error:', error);
                reject(error);
            });

            this.socket.on('disconnect', (reason) => {
                console.warn('Disconnected from WebSocket server:', reason);
            });

            this.socket.on('error_occurred', (error: { message: string }) => {
                console.error('Server Error:', error.message);
                alert(`Server Error: ${error.message}`); // Simple alert for now
            });
        });
    }

    disconnect(): void {
        this.socket?.disconnect();
        this.socket = null;
        console.log('Disconnected manually from WebSocket server!');
    }

    // --- Emit Functions ---
    emit(event: string, payload?: any) {
        this.socket?.emit(event, payload);
    }

    createGame(payload: CreateGamePayload) {
        this.emit('create_game', payload);
    }

    joinGame(payload: JoinGamePayload) {
        this.emit('join_game', payload);
    }

    leaveGame(payload: LeaveGamePayload) {
        this.emit('leave_game', payload);
    }

    throwDart(payload: ThrowDartPayload) {
        this.emit('throw_dart', payload);
    }

    getAvailableGames() {
        this.emit('get_available_games');
    }

    // --- Listener Functions ---
    onGameUpdate(listener: (gameState: Game) => void) {
        this.socket?.on('game_update', listener);
    }

    offGameUpdate() {
        this.socket?.off('game_update');
    }

    onPlayerJoined(listener: (data: { nickname: string }) => void) {
        this.socket?.on('player_joined', listener);
    }

    offPlayerJoined() {
        this.socket?.off('player_joined');
    }

    onPlayerLeft(listener: (data: { playerId: string }) => void) {
        this.socket?.on('player_left', listener);
    }

    offPlayerLeft() {
        this.socket?.off('player_left');
    }

    onAvailableGames(listener: (games: any[]) => void) {
        this.socket?.on('available_games', listener);
    }

    offAvailableGames() {
        this.socket?.off('available_games');
    }
}

export const socketService = new SocketService();