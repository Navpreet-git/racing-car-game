function showRules(){
    const rules = document.getElementById("rulesBlock");
    if(rules.style.display === "none"){
        rules.style.display = "block";
    } else{
        rules.style.display = "none";
    }
}

function joinGame(){
    window.location.href = "joinGame.html" ; // name of file with winmdow of join game
}

function createGame(){
    window.location.href = "createGame.html" ; // name of file with window of game creation
}

function replay(){
    window.location.href = ""; // name of file with lobby
}

function returnHome(){
    window.location.href = "index.html";
}

function showWinner(winnerName) {
    const winnerElement = document.getElementById('winnerName');
    const nameSpan = document.getElementById('winner');
    
    nameSpan.textContent = winnerName;
    winnerElement.style.display = 'block';
}

function showScreen(screenId) {
    // Hide all screens
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => screen.classList.add('hidden'));
  
    // Show the selected screen
    document.getElementById(screenId).classList.remove('hidden');
  }

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

