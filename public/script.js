const socket = io();
const canvas = document.createElement('canvas');
let username = "";
let playerX, playerY, velocityX = 0, velocityY = 0, speed = 2;
let isInCreateMode = false;

function showRules(){
    const rules = document.getElementById("rulesBlock");
    if(rules.style.display === "none"){
        rules.style.display = "block";
    } else{
        rules.style.display = "none";
    }
}
function toggleElementVisibility(elementId) {
    const element = document.getElementById(elementId);
    element.style.display = (element.style.display === "none" || element.style.display === "") ? "block" : "none";
}

function updatePlayerList(playerListId, players) {
    const playerList = document.getElementById(playerListId);
    playerList.innerHTML = ""; // Clear current list
    players.forEach(player => {
        const li = document.createElement('li');
        li.textContent = player.username;
        playerList.appendChild(li);
    });
}

function handleUsernameInput() {
    username = document.querySelector('.usernameInput').value.trim();
    if (!username) {
        alert("Please enter a username!");
        return false;
    }
    return true;
}

function createGame() {
    if (!handleUsernameInput()) return;

    socket.emit('createGame', username);
    isInCreateMode = true; // Flag for create game mode

    socket.on('gameCreated', ({ gameCode }) => {
        console.log(`Game created with code: ${gameCode}`);
        document.querySelector('.initialScreen').style.display = 'none';
        document.querySelector('.createGame').style.display = 'block';
        document.querySelector('.joinGame').style.display = 'none';
        document.getElementById('game-code-box').textContent = gameCode;
    });

    socket.on('lobbyUpdate', ({ players }) => updatePlayerList('player-list', players));
}

function joinGame() {
    if (!handleUsernameInput()) return;
    isInCreateMode = false; // Flag for join game mode

    document.querySelector('.initialScreen').style.display = 'none';
    document.querySelector('.createGame').style.display = 'none';
    document.querySelector('.joinGame').style.display = 'block';
}

function joinGameWithCode() {
    const gameCode = document.getElementById('game-code-input').value.trim();
    if (!gameCode) {
        alert("Please enter a game code!");
        return;
    }

    socket.emit('joinGame', { gameCode, username });

    socket.on('gameJoined', ({ success, message, gameCode }) => {
        if (success) {
            console.log(`Joined game with code: ${gameCode}`);
            document.getElementById('lobby-player-list').innerHTML = "";
        } else {
            alert(message || "Unable to join the game.");
        }
    });

    socket.on('lobbyUpdate', ({ players }) => updatePlayerList('lobby-player-list', players));
}

function createGameCanvas(player) {
    playerX = player.x;
    playerY = player.y;

    const canvas = document.createElement('canvas');
    canvas.id = 'gameCanvas';
    canvas.width = 800;
    canvas.height = 600;
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    const carImg = new Image();
    carImg.src = '/images/car.png';

    carImg.onload = () => {
        function gameLoop() {
            if (playerX + velocityX >= 0 && playerX + velocityX <= canvas.width - 50) playerX += velocityX;
            if (playerY + velocityY >= 0 && playerY + velocityY <= canvas.height - 50) playerY += velocityY;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(carImg, playerX, playerY, 50, 50);
            requestAnimationFrame(gameLoop);
        }

        gameLoop();
    };
}

function handleKeyMovement(e, isKeyDown) {
    if (e.key === 'ArrowUp') velocityY = isKeyDown ? -speed : 0;
    if (e.key === 'ArrowDown') velocityY = isKeyDown ? speed : 0;
    if (e.key === 'ArrowLeft') velocityX = isKeyDown ? -speed : 0;
    if (e.key === 'ArrowRight') velocityX = isKeyDown ? speed : 0;

    if (isKeyDown) {
        socket.emit('playerMove', { x: playerX, y: playerY });
    }
}

document.getElementById('play-button').addEventListener('click', () => {
    if (isInCreateMode) {
        const gameCode = document.getElementById('game-code-box').textContent;

        socket.emit('startGame', gameCode);

        socket.on('gameStarted', (player) => {
            console.log(`Game started for player ${player.username} at (${player.x}, ${player.y})`);

            document.querySelector('.initialScreen').style.display = 'none';
            document.querySelector('.createGame').style.display = 'none';
            document.querySelector('.joinGame').style.display = 'none';
            document.getElementById('game-code-box').style.display = 'none';
            document.getElementById('player-list').style.display = 'none';

            createGameCanvas(player);

            document.addEventListener('keydown', (e) => handleKeyMovement(e, true));
            document.addEventListener('keyup', (e) => handleKeyMovement(e, false));
        });
    } else {
        const gameCode = document.getElementById('game-code-input').value.trim();

        socket.emit('startGame', gameCode);

        socket.on('gameStarted', (player) => {
            console.log(`Game started for player ${player.username} at (${player.x}, ${player.y})`);

            document.querySelector('.initialScreen').style.display = 'none';
            document.querySelector('.createGame').style.display = 'none';
            document.querySelector('.joinGame').style.display = 'none';
            document.getElementById('game-code-box').style.display = 'none';
            document.getElementById('player-list').style.display = 'none';

            createGameCanvas(player);

            document.addEventListener('keydown', (e) => handleKeyMovement(e, true));
            document.addEventListener('keyup', (e) => handleKeyMovement(e, false));
        });
    }
});
function showInitialScreen() {
    document.querySelector('.initialScreen').style.display = 'block';
    document.querySelector('.createGame').style.display = 'none';
    document.querySelector('.joinGame').style.display = 'none';
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
