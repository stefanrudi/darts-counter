import express, { Express } from "express";
import http, { Server as HTTPServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { handleConnection } from "./websockets/connectionHandlers";
import { Game } from "./game/Game";
import { GameManager } from "./game/GameManager";

// Initialize Express app
const app: Express = express();
const server: HTTPServer = http.createServer(app);

// Create socketIO websocket server
const io = new SocketIOServer(server, {
  cors: {
    origin: "http://localhost:5174", // Vite default port
    methods: ["GET", "POST"],
  }
});

const port = process.env.PORT || 3001;

// Intialize game manager
const gameManager = GameManager.getInstance();

// Basic HTTP route
app.get('/', (req, res) => {
  res.send('Darts WebSocket Server is running!');
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);
  handleConnection(socket, io, gameManager);
});

server.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
