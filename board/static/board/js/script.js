const rawData = document.getElementById('questions-data').textContent;
const gameData = JSON.parse(rawData);
let currentRoundIndex = 0;
let currentQuestion = null;

const boardScreen = document.getElementById('board-screen');
const questionScreen = document.getElementById('question-screen');
const questionText = document.getElementById('question-text');

function initGame() {
    console.log("Loaded! Data: ", gameData);
    renderBoard();
}
function renderBoard() {
    boardScreen.innerHTML = '';
    const currentRound = gameData.rounds[currentRoundIndex];
    currentRound.categories.forEach((category) => {
        const columnDiv = document.createElement('div');
        columnDiv.classList.add('category-column');
        const headerDiv = document.createElement('div');
        headerDiv.classList.add('category-header');
        headerDiv.textContent = category.name;
        columnDiv.appendChild(headerDiv);
        category.questions.forEach((question) => {
            const cellDiv = document.createElement('div');
            cellDiv.classList.add('question-cell');
            cellDiv.textContent = question.price;
            columnDiv.appendChild(cellDiv);
        });
        boardScreen.appendChild(columnDiv);
    });
}
document.addEventListener('DOMContentLoaded', initGame);