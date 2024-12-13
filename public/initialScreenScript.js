// Show/hide the rules section
function showRules(){
    const rules = document.getElementById("rulesBlock");
    if(rules.style.display === "none"){
        rules.style.display = "block";
    } else{
        rules.style.display = "none";
    }
}

// Handle joining an existing game (you can fill this with socket event later)
function joinGame(){
    window.location.href = "MultiplayerScreen1.html"; // Go to MultiplayerScreen1 when joining a game
}

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
