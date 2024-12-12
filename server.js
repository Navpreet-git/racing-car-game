const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

const lobbies = {};

function generateGameCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 5; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Handle client connections
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Handle creating a new game
    socket.on('createGame', (username) => {
        const gameCode = generateGameCode();
        lobbies[gameCode] = { players: [{ id: socket.id, username }] }; // Add the creator to the new game
        socket.join(gameCode); // Join the socket to the game room
        console.log(`Game created with code: ${gameCode} by ${username}`);

        // Notify the creator and update the lobby for all participants
        socket.emit('gameCreated', { gameCode });
        io.to(gameCode).emit('lobbyUpdate', { players: lobbies[gameCode].players });
    });

    // Handle joining an existing game
    socket.on('joinGame', ({ gameCode, username }) => {
        if (lobbies[gameCode]) {
            lobbies[gameCode].players.push({ id: socket.id, username }); // Add the new player
            socket.join(gameCode); // Join the socket to the game room
            console.log(`${username} joined game ${gameCode}`);

            // Notify the new player and update the lobby for all participants
            socket.emit('gameJoined', { success: true, gameCode });
            io.to(gameCode).emit('lobbyUpdate', { players: lobbies[gameCode].players });
        } else {
            // Notify the player if the game code is invalid
            socket.emit('gameJoined', { success: false, message: 'Game not found' });
        }
    });

    // Handle user disconnection
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);

        // Check each game lobby for the disconnected player
        for (const [gameCode, lobby] of Object.entries(lobbies)) {
            const playerIndex = lobby.players.findIndex((player) => player.id === socket.id);
            if (playerIndex !== -1) {
                const [removedPlayer] = lobby.players.splice(playerIndex, 1); // Remove the player from the lobby
                console.log(`${removedPlayer.username} left game ${gameCode}`);

                // Notify remaining players in the game
                io.to(gameCode).emit('lobbyUpdate', { players: lobby.players });

                // Delete the lobby if there are no players left
                if (lobby.players.length === 0) {
                    delete lobbies[gameCode];
                    console.log(`Game ${gameCode} deleted as no players are left`);
                }
                break;
            }
        }
    });
});

server.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
