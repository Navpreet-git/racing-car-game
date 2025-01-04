const socket = io();
const canvas = document.createElement('canvas');
let username = "";
let playerX, playerY, velocityX = 0, velocityY = 0, speed = 2;
let isInCreateMode = false;
let otherPlayers = [];


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

    document.querySelector('.initialScreen').style.display = 'none';
    document.querySelector('.createGame').style.display = 'none';
    document.querySelector('.joinGame').style.display = 'block';
}

function joinGameWithCode() {
    const gameCode = document.getElementById('game-code-input').value.trim();
    if (!handleUsernameInput()) return;

    document.querySelector('.initialScreen').style.display = 'none';
    document.querySelector('.createGame').style.display = 'none';
    document.querySelector('.joinGame').style.display = 'block';
    if (!gameCode) {
        alert("Please enter a game code!");
        return;
    }

    socket.emit('joinGame', { gameCode, username });
    isInCreateMode = false; // Flag for join game mode
    console.log('isInCreateMode set to ,' , isInCreateMode)
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

    const miniMapCanvas = document.createElement('canvas');
    miniMapCanvas.id = 'miniMapCanvas';
    miniMapCanvas.width = 200;
    miniMapCanvas.height = 150;
    const miniMapContainer = document.createElement('div');
    miniMapContainer.id = 'miniMapContainer';
    miniMapContainer.appendChild(miniMapCanvas);
    document.body.appendChild(miniMapContainer);

    // MiniMap styling
    miniMapContainer.style.position = 'absolute';
    miniMapContainer.style.right = '350px';
    miniMapContainer.style.border = '2px solid #000';
    miniMapContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
    miniMapContainer.style.borderRadius = '5px';

    const ctx = canvas.getContext('2d');
    const miniMapCtx = miniMapCanvas.getContext('2d');


    const carImg = new Image();
    carImg.src = '/images/car.png';

    carImg.onload = () => {
        function drawRoad() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Road dimensions
            const roadWidth = canvas.width / 3; 
            const roadX = (canvas.width - roadWidth) / 2; 

            ctx.fillStyle = "#333"; 
            ctx.fillRect(roadX, 0, roadWidth, canvas.height);

            ctx.strokeStyle = "#fff"; 
            ctx.lineWidth = 2;
            for (let y = 0; y < canvas.height; y += 40) {
                ctx.beginPath();
                ctx.moveTo(roadX + roadWidth / 3, y); 
                ctx.lineTo(roadX + roadWidth / 3, y + 20);
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(roadX + (2 * roadWidth) / 3, y); 
                ctx.lineTo(roadX + (2 * roadWidth) / 3, y + 20);
                ctx.stroke();
            }
        }

        function drawMiniMap() {
            miniMapCtx.clearRect(0, 0, miniMapCanvas.width, miniMapCanvas.height);

            const scale = miniMapCanvas.width / canvas.width;

            // Draw the road on the mini-map
            miniMapCtx.fillStyle = "#333";
            miniMapCtx.fillRect(
                (canvas.width / 3) * scale,
                0,
                (canvas.width / 3) * scale,
                miniMapCanvas.height
            );

            // Draw all players on the mini-map
            Object.keys(otherPlayers).forEach(playerId => {
                const { x, y, username: playerUsername } = otherPlayers[playerId];
                miniMapCtx.fillStyle = playerUsername === username ? "red" : "blue";
                miniMapCtx.fillRect(
                    x * scale,
                    y * scale,
                    10, // Size of player on mini-map
                    10
                );
            });
            
        }

        function gameLoop() {
            if (playerX + velocityX >= canvas.width / 3 && playerX + velocityX <= (canvas.width * 2) / 3 - 50) {
                playerX += velocityX;
            }
            if (playerY + velocityY >= 0 && playerY + velocityY <= canvas.height - 50) {
                playerY += velocityY;
            }

            drawRoad();
            ctx.drawImage(carImg, playerX, playerY, 50, 50);
            drawMiniMap();


            requestAnimationFrame(gameLoop);
        }

        const roadWidth = canvas.width / 3;
        const roadX = (canvas.width - roadWidth) / 2;
        playerX = roadX + roadWidth / 2 - 25; // Centered in the road's middle lane
        playerY = canvas.height - 60; 

        gameLoop();
    };

     // Listen for updates from the server about other players
     socket.on('updatePlayers', (players) => {
        otherPlayers = players; // Update the list of all players
    });

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
document.getElementById('play-button-join').addEventListener('click', () =>{ 

    console.log('isInCreateMode,',isInCreateMode)

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
});
document.getElementById('play-button').addEventListener('click', () => {
    
        console.log('isInCreateMode,',isInCreateMode)
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
