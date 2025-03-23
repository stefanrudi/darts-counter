import { handlePlayerDisconnect } from "../controllers/wsController";
import WebSocket from "ws";
import { playerModel } from "../models/Player";

const PING_INTERVAL = 30000; // 30 seconds
const PING_TIMEOUT = 10000; // 10 seconds

let heartbeatInterval: NodeJS.Timeout | null = null;

/**
 * Setup heartbeat mechanism 
 */
export function setupHeartbeat(): void {
    heartbeatInterval = setInterval(() => {
        const now = Date.now();

        // Send ping to all connected clients
        for (const [playerId, player] of playerModel.getAllPlayerIds()) {
            // Skip already disconnected players
            if (!player.isConnected) continue;

            if (player.ws.readyState === WebSocket.OPEN) {
                // Check if player hasn't responded to previous ping
                if (player.lastPing && now - player.lastPing > PING_TIMEOUT) {
                    console.log(`Player ${playerId} timed out`);
                    player.isConnected = false;
                    handlePlayerDisconnect(playerId, false);
                    continue;
                }

                try {
                    (player.ws as any).ping();
                    player.lastPing = now;
                } catch (error) {
                    console.error(`Error sending ping to player ${playerId}:`, error);
                    player.isConnected = false;
                    handlePlayerDisconnect(playerId, false); 
                }
            } else if (player.ws.readyState === WebSocket.CLOSED || player.ws.readyState === WebSocket.CLOSING) {
                player.isConnected = false;
                handlePlayerDisconnect(playerId, false);
            }
        } 
    }, PING_INTERVAL);
}