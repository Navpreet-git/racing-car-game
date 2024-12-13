// Retrieve the game code and username from localStorage
const gameCode = localStorage.getItem('gameCode');
const username = localStorage.getItem('username');

// Display the game code in the corresponding div
document.getElementById('game-code-box').textContent = gameCode;

// Add the current player's name to the player list
const playerList = document.getElementById('player-list');
const playerItem = document.createElement('li');
playerItem.textContent = username;
playerList.appendChild(playerItem);
