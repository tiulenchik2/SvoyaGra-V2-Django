const rawData = document.getElementById('questions-data').textContent;
const gameData = JSON.parse(rawData);
let playedQuestions = JSON.parse(localStorage.getItem('playedQuestions')) || [];
let currentRoundIndex = 0;
let currentQuestion = null;

const boardScreen = document.getElementById('board-screen');
const questionScreen = document.getElementById('question-screen');
const questionText = document.getElementById('question-text');

function initGame() {
    console.log("Loaded! Data: ", gameData);
    renderBoard();
}
let typingInterval = null;
function typewriterEffect(text, element, speed = 40) {
    element.textContent = '';
    if (typingInterval) {
        clearInterval(typingInterval);
    }
    let i = 0;
    typingInterval = setInterval(() => {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
        } else {
            clearInterval(typingInterval);
        }
    }, speed);
}
function renderBoard() {
    boardScreen.innerHTML = '';
    const currentRound = gameData.rounds[currentRoundIndex];
    const roundTitle = document.createElement('div');
    roundTitle.id = 'round-title';
    roundTitle.innerHTML = `РАУНД<br>${currentRound.round_number}`;
    boardScreen.appendChild(roundTitle);
    const gridContainer = document.createElement('div');
    gridContainer.id = 'grid-container';

    currentRound.categories.forEach((category, catIndex) => {
        const rowDiv = document.createElement('div');
        rowDiv.classList.add('category-row');

        const headerDiv = document.createElement('div');
        headerDiv.classList.add('category-header');
        headerDiv.textContent = category.name;
        rowDiv.appendChild(headerDiv);

        category.questions.forEach((question, qIndex) => {
            const cellDiv = document.createElement('div');
            cellDiv.classList.add('question-cell');
            cellDiv.textContent = question.price;
            const uniqueId = `${currentRoundIndex}-${catIndex}-${qIndex}`;
            if (playedQuestions.includes(uniqueId)) {
                cellDiv.textContent = '';
                cellDiv.style.pointerEvents = 'none';
                cellDiv.style.backgroundColor = '#000000';
                cellDiv.style.borderColor = '#000000';
            }
            cellDiv.addEventListener('click', () => {
                currentQuestion = question;
                cellDiv.textContent = '';
                cellDiv.style.pointerEvents = 'none';
                cellDiv.style.backgroundColor = '#000000';
                cellDiv.style.borderColor = '#000000';
                playedQuestions.push(uniqueId);
                localStorage.setItem('playedQuestions', JSON.stringify(playedQuestions));
                document.getElementById('question-category').textContent = category.name;
                document.getElementById('question-price').textContent = question.price;
                const rightPane = document.getElementById('question-right-pane');
                const questionImg = document.getElementById('question-image');
                if (question.image) {
                    questionImg.src = question.image;
                    rightPane.classList.remove('hidden');
                } else {
                    questionImg.src = '';
                    rightPane.classList.add('hidden');
                }
                boardScreen.classList.add('hidden');
                questionScreen.classList.remove('hidden');
                typewriterEffect(question.text, questionText);
            });
            rowDiv.appendChild(cellDiv);
        });

        gridContainer.appendChild(rowDiv);
    });

    boardScreen.appendChild(gridContainer);
}
document.addEventListener('DOMContentLoaded', initGame);
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' || event.key === 'Backspace') {
        if (!questionScreen.classList.contains('hidden')) {
            if (typingInterval) { clearInterval(typingInterval); }
            questionScreen.classList.add('hidden');
            boardScreen.classList.remove('hidden');
        }
    }
})
window.addEventListener('beforeunload', (event) => {
    event.preventDefault();
    event.returnValue = '';
});