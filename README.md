# Multiplayer Dartscounter
A real-time multiplayer dartboard game using React, Node.js, Express, and WebSocket.

## Features
- Real-time multiplayer gameplay with WebSocket
- Interactive dartboard with accurate scoring
- Game lobby system to create and join games
- Throw history tracking

## Project Structure
```
dartboard-game/
├── client/                  # React frontend
│   ├── public/
│   └── src/
│       ├── components/
│       │   ├── Dartboard.js    # Interactive dartboard component
│       │   ├── GameBoard.js    # Game interface component
│       │   └── GameLobby.js    # Lobby interface component
│       ├── App.js           # Main React component
│       ├── App.css          # Styles
│       └── index.js         # React entry point
└── server/
    └── server.js            # Express & WebSocket server
```