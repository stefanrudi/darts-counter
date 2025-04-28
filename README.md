# Multiplayer Dartscounter

A real-time multiplayer dartboard game built with React, Node.js, Express, and WebSocket. This app allows players to compete in classic X01 dart games (e.g., 501, 301, 101) with real-time updates and automatic scoring.

---

## Features

- **Real-Time Multiplayer**: Play with friends in real-time using WebSocket.
- **Interactive Dartboard**: Clickable dartboard with accurate scoring.
- **Game Modes**: Choose between 501, 301, or 101 starting scores.
- **Checkout Rules**: Supports both single and double checkout rules.
- **Game Lobby**: Create or join game rooms with up to 8 players.
- **Throw History**: Track all throws, including valid and invalid ones.
- **Winner Detection**: Automatically determines the winner based on the game rules.

---

## How to Start the App

### 1. Clone the Repository
```bash
git clone https://github.com/stefanrudi/darts-counter.git
cd darts-counter
```

### 2. Install Dependencies
Navigate to the `server` and `client` directories and install the required dependencies:

#### For the Server:
```bash
cd server
npm install
```

#### For the Client:
```bash
cd ../client
npm install
```

### 3. Start the Server
Run the server from the `server` directory:
```bash
npm run dev
```
The server will start on `http://localhost:3001`.

### 4. Start the Client
Run the client from the `client` directory:
```bash
npm run dev
```
The client will start on `http://localhost:5174`.

---

## How to Play

1. **Enter Your Name**: Start by entering your username.
2. **Create or Join a Game**:
   - Create a new game room with your preferred settings (e.g., starting score, checkout type, max players).
   - Or join an existing game room from the list of available games.
3. **Play the Game**:
   - Take turns throwing darts by clicking on the interactive dartboard.
   - The app automatically calculates scores and tracks throw history.
4. **Win the Game**:
   - The winner is determined automatically based on the game rules (e.g., double checkout for 501).

---

## Project Structure

```
dartboard-game/
├── client/                  # React Frontend
└── server/                  # Server (Express & WebSocket)    
```

---

## Requirements

- **Node.js**: v16 or higher
- **npm**: v8 or higher

---

Enjoy playing darts with your friends! 🎯
