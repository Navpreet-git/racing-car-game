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


// Handle creating a new game
function createGame(){
    const username = document.getElementById("usernameInput").value;
    
    // Validate that a username is entered
    if (!username) {
        alert("Please enter a username!");
        return;
    }

    // Store the username and game code in localStorage
    localStorage.setItem('username', username);
    
    // Simulate game code generation (you can replace this with a real server-side game code later)
    const gameCode = Math.random().toString(36).substring(2, 7).toUpperCase(); // Generate a random 5-character game code

    // Store the game code in localStorage
    localStorage.setItem('gameCode', gameCode);

    // Redirect to MultiplayerScreen1.html after setting localStorage
    window.location.href = "MultiplayerScreen1.html";
}
