import express, { Express } from "express";
import http, { Server as HTTPServer } from "http";
import WebSocket, { WebSocketServer } from "ws";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { handleMessage, handlePlayerDisconnect, updatePlayerConnection } from "./controllers/wsController";
import { setupHeartbeat } from "./services/WebSocketService";
import { playerModel } from "./models/Player";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Express app
const app: Express = express();
const server: HTTPServer = http.createServer(app);

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// WebSocket server
const wss: WebSocketServer = new WebSocketServer({ server });

// WebSocket connection handler
wss.on("connection", (ws: WebSocket) => {
  const playerId = uuidv4();
  playerModel.createPlayer(playerId, ws);

  // Send player their ID
  ws.send(
    JSON.stringify({
      type: "player_info",
      payload: { id: playerId },
    })
  );

  // Message handling
  ws.on("message", (message: string) => handleMessage(ws, message, playerId));

  // Connection event handling
  ws.on("close", () => handlePlayerDisconnect(playerId, true));
  ws.on("error", () => handlePlayerDisconnect(playerId, false));
  ws.on("pong", () => updatePlayerConnection(playerId));
});

// Initialize heartbeat mechanism
//setupHeartbeat();


// Start the server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
