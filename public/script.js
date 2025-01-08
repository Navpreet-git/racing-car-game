const socket = io();
const canvas = document.createElement('canvas');
let username = "";
let playerX, playerY, velocityX = 0, velocityY = 0, speed = 2;
let isInCreateMode = false;
let otherPlayers = [];
let gameIsOver = false; // Flag to track if the game is over
let timer = null; // Timer interval
let elapsedTime = 0; // Total elapsed time in centiseconds (1/100s)

// Function to format time as MM.SS
function formatTime(time) {
    const minutes = Math.floor(time / 6000);
    const seconds = Math.floor((time % 6000) / 100);
    const centiseconds = time % 100;
    return `${String(minutes).padStart(2, '0')}.${String(seconds).padStart(2, '0')}`;
}

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
   
    const timerDisplay = document.createElement('div');
    timerDisplay.id = 'timerDisplay';
    timerDisplay.style.position = 'absolute';
    timerDisplay.style.top = '10px';
    timerDisplay.style.left = '10px';
    timerDisplay.style.fontSize = '24px';
    timerDisplay.style.fontWeight = 'bold';
    timerDisplay.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
    timerDisplay.style.padding = '5px';
    timerDisplay.style.borderRadius = '5px';
    document.body.appendChild(timerDisplay);


    const ctx = canvas.getContext('2d');
    const miniMapCtx = miniMapCanvas.getContext('2d');

    const carImg = new Image();
    carImg.src = '/images/car.png';


    carImg.onload = () => {
        let roadOffsetY = 0; // Track road offset for scrolling
        function drawRoad() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        
            // Road dimensions
            const roadWidth = canvas.width / 3;
            const roadX = (canvas.width - roadWidth) / 2;
        
            // Draw road
            ctx.fillStyle = "#333";
            ctx.fillRect(roadX, 0, roadWidth, canvas.height);
        
            // Draw road markings
            ctx.strokeStyle = "#fff";
            ctx.lineWidth = 2;
            const lineHeight = 40; // Height of each dashed line
            const gapHeight = 20; // Gap between dashed lines
        
            // Calculate the starting position of the dashed lines
            const startY = roadOffsetY % (lineHeight + gapHeight);
        
            // Draw the dashed lines
            for (let y = startY - (lineHeight + gapHeight); y < canvas.height; y += lineHeight + gapHeight) {
                ctx.beginPath();
                ctx.moveTo(roadX + roadWidth / 3, y);
                ctx.lineTo(roadX + roadWidth / 3, y + lineHeight);
                ctx.stroke();
        
                ctx.beginPath();
                ctx.moveTo(roadX + (2 * roadWidth) / 3, y);
                ctx.lineTo(roadX + (2 * roadWidth) / 3, y + lineHeight);
                ctx.stroke();
            }
        
            // Draw the finish line if it should appear
            if (roadOffsetY >= 3000 - canvas.height) {
                const finishLineY = canvas.height - (roadOffsetY - (3000 - canvas.height));
                ctx.fillStyle = "#FF0000"; // Red finish line
                ctx.fillRect(roadX, finishLineY, roadWidth, 10);
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
        let finishLineDrawn = false; // Flag to ensure finish line is drawn only once

        function gameLoop() {
            if (!gameIsOver) {
                const finishLineVisibleY = canvas.height - (3000 - roadOffsetY);
        
                // Stop road scrolling if the finish line is visible
                if (finishLineVisibleY <= 0) {
                    roadOffsetY = (roadOffsetY + speed) % 3000;
                }
        
                // Update player position based on velocity
                if (playerX + velocityX >= canvas.width / 3 && playerX + velocityX <= (canvas.width * 2) / 3 - 50) {
                    playerX += velocityX;
                }
                if (playerY + velocityY >= 0 && playerY + velocityY <= canvas.height - 50) {
                    playerY += velocityY;
                }
        
                // Redraw road and car
                drawRoad();
                ctx.drawImage(carImg, playerX, playerY, 50, 50);
                drawMiniMap();
        
                // Draw the finish line only once when it's visible
                if (!finishLineDrawn && finishLineVisibleY <= 0) {
                    ctx.fillStyle = "#FF0000"; // Red finish line
                    ctx.fillRect(roadX, finishLineVisibleY, roadWidth, 10);
                    finishLineDrawn = true; // Mark the finish line as drawn
                }
        
                // Ensure the finish line stays visible
                if (finishLineDrawn) {
                    ctx.fillStyle = "#FF0000"; // Red finish line
                    ctx.fillRect(roadX, finishLineVisibleY, roadWidth, 10);
                }
        
                // Check if the car reaches the finish line
                if (
                    finishLineVisibleY <= playerY + 50 && // Finish line is at or below the car's bottom edge
                    finishLineVisibleY >= playerY // Finish line is at or above the car's top edge
                ) {

                    socket.emit('playerWon', { username });
                    clearInterval(timer); // Stop the timer

                    gameIsOver = true; // Mark the game as over
                }
            }
        
            // Continue the game loop
            requestAnimationFrame(gameLoop);
        }
          

        const roadWidth = canvas.width / 3;
        const roadX = (canvas.width - roadWidth) / 2;
        playerX = roadX + roadWidth / 2 - 25; // Centered in the road's middle lane
        playerY = canvas.height - 60; 

        gameLoop();
    };

    document.addEventListener('keydown', (e) => {
        if (!timer) {
            timer = setInterval(() => {
                elapsedTime++;
                document.getElementById('timerDisplay').textContent = formatTime(elapsedTime);
                if (elapsedTime >= 9999) {
                    clearInterval(timer); // Stop timer at 99.99
                    gameIsOver = true;
                }
            }, 10);
        }
        handleKeyMovement(e, true);
    });

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

socket.on('gameOver', ({ winner }) => {
    gameIsOver = true; // Stop movement

    const winnerPopup = document.getElementById('winner-popup');
    const winnerMessage = document.getElementById('winner-message');
    
    winnerMessage.textContent = `${winner} has won the game!`;

    winnerPopup.style.display = 'block';
});


