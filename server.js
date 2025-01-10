const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const host = '0.0.0.0'; // Listen on all interfaces
const port = 3000;
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));
 
const lobbies = {};
const playerGameMap = {}; // Map of socket.id to gameCode

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
        lobbies[gameCode] = { players: [{ id: socket.id, username }] };
        socket.join(gameCode);
        playerGameMap[socket.id] = gameCode;
        console.log(`Game created with code: ${gameCode} by ${username}`);
        socket.join(gameCode);

        socket.emit('gameCreated', { gameCode });
    });

    // Handle joining an existing game
    socket.on('joinGame', ({ gameCode, username }) => {
        if (lobbies[gameCode]) {
            lobbies[gameCode].players.push({ id: socket.id, username, x: 100, y: 100 });
            socket.join(gameCode);
            playerGameMap[socket.id] = gameCode;
    
            socket.emit('gameJoined', { success: true, gameCode });
    
            io.to(gameCode).emit('lobbyUpdate', { players: lobbies[gameCode].players });
    
            socket.emit('updatePlayers', getPlayersInGame(gameCode));
    
            console.log(`${username} joined game ${gameCode}`);
        } else {
            console.log(`Game code ${gameCode} not found.`);
            socket.emit('gameJoined', { success: false, message: 'Game not found' });
        }
    });

    socket.on('startGame', (gameCode) => {
        const lobby = lobbies[gameCode];
        if (lobby) {
            const player = lobby.players.find((p) => p.id === socket.id);
            if (player) {
                // // Set fixed starting positions for now
                // player.x = 100; // Fixed X coordinate
                // player.y = 100; // Fixed Y coordinate
    
                console.log(`Game started for player ${player.username} in game ${gameCode})`);
                socket.emit('gameStarted', player); // Send the full player object
                io.to(gameCode).emit('updatePlayers', getPlayersInGame(gameCode)); // Broadcast updated player positions
            }
        }
    });

    socket.on('playerMove', (position) => {
        const gameCode = playerGameMap[socket.id];
        if (!gameCode || !lobbies[gameCode]) {
            console.log(`Lobby not found for gameCode: ${gameCode} (socket ID: ${socket.id})`);
            return;
        }
        const player = lobbies[gameCode].players.find((p) => p.id === socket.id);
        if (!player) {
            console.log(`Player not found with socket ID: ${socket.id} in game ${gameCode}`);
            return;
        }
        // Update the player's position
        player.x = position.x;
        player.y = position.y;
        console.log(`Player ${player.username} moved to (${player.x}, ${player.y})`);
    
        // Broadcast the updated player positions to all players in the game
        io.to(gameCode).emit('updatePlayers', getPlayersInGame(gameCode)); // Broadcast new positions
    });
    
    function getPlayersInGame(gameCode) {
        return lobbies[gameCode].players.reduce((acc, player) => {
            acc[player.id] = { x: player.x, y: player.y, username: player.username };
            return acc;
        }, {});
    }


    socket.on('playerWon', ({ username }) => {
        const gameCode = playerGameMap[socket.id];
        if (gameCode && lobbies[gameCode]) {
            io.to(gameCode).emit('gameOver', { winner: username });
            console.log(`Player ${username} has won the game in lobby ${gameCode}`);
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

server.listen(port, host, () => {
    console.log(`Server running at http://${host}:${port}/`);
});