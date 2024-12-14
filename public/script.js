function showRules(){
    const rules = document.getElementById("rulesBlock");
    if(rules.style.display === "none"){
        rules.style.display = "block";
    } else{
        rules.style.display = "none";
    }
}

function joinGame(){
    window.location.href = "" ; // name of file with winmdow of join game
}

function createGame(){
    window.location.href = "" ; // name of file with window of game creation
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