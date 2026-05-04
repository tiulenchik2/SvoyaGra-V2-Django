const rawData = document.getElementById('questions-data').textContent;
const gameData = JSON.parse(rawData);
let playedQuestions = JSON.parse(localStorage.getItem('playedQuestions')) || [];
let currentRoundIndex = 0;
let currentIntro = Number(localStorage.getItem('currentIntro')) || 0;
// 0 - Welcome, 1 - Rules, 2 - Qr, 3 - Categories
let currentQuestion = null;
let autoTimerTimeout = null;
let isFinalRound = false;
let countdownInterval = null;
let isTimerStopped = false; // Flag to track when timer is manually stopped or runs out

const TIME_LIMIT = 15; // change if needed

const timerContainer = document.getElementById('timer-container');
const timerBar = document.getElementById('timer-bar');
const introCategoryName = document.getElementById('intro-category');
const rightPane = document.getElementById('question-right-pane');
const questionImg = document.getElementById('question-image');

const introScreen0 = document.getElementById('intro-screen-0');
const introScreen1 = document.getElementById('intro-screen-1');
const introScreen2 = document.getElementById('intro-screen-2');
const introScreen3 = document.getElementById('intro-screen-3');
const boardScreen = document.getElementById('board-screen');
const questionScreen = document.getElementById('question-screen');
const questionText = document.getElementById('question-text');
const answerScreen = document.getElementById('answer-screen');
const answerText = document.getElementById('answer-text');
const answerExplanation = document.getElementById('answer-explanation');
const specialScreen = document.getElementById('special-screen');
const specialText = document.getElementById('special-text');
const gameOverScreen = document.getElementById('game-over-screen');

function hideScreen(screen) {
    if (screen) {
        screen.classList.add('hidden');
        screen.classList.remove('slide-in-anim', 'fade-in-scale-anim');
    }
}

function showScreen(screen, animationType = null) {
    const screens = [
        introScreen0, introScreen1, introScreen2, introScreen3,
        boardScreen, questionScreen, answerScreen, specialScreen, gameOverScreen
    ];
    screens.forEach(hideScreen);

    if (screen === boardScreen) {
        rightPane.classList.add('hidden');
    }

    void screen.offsetWidth;
    screen.classList.remove('hidden');
    screen.classList.add(animationType || (screen === boardScreen ? 'fade-in-scale-anim' : 'slide-in-anim'));
}
function initGame() {
    if (localStorage.getItem('currentIntro') === '3') {
        renderBoard();
        showScreen(boardScreen);
    } else {
        localStorage.setItem('currentIntro', 0);
        showScreen(introScreen0);
    }
}
// roll categories
async function runIntro3() {
    showScreen(introScreen3);
    const categories = gameData.rounds.flatMap(round =>
        round.categories.map(cat => cat.name)
    );
    for (const catName of categories) {
        introCategoryName.textContent = catName;
        introScreen3.classList.remove('hidden');
        await new Promise(r => setTimeout(r, 1000));
        introScreen3.classList.add('hidden');
        await new Promise(r => setTimeout(r, 500));
    }

    renderBoard();
    showScreen(boardScreen);
}
let typingInterval = null;
function typewriterEffect(text, element, speed = 40, onComplete = null) {
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
            typingInterval = null;
            if (onComplete) { onComplete(); }
        }
    }, speed);
}
function startTimer(seconds) {
    isTimerStopped = false;
    clearInterval(countdownInterval);
    timerContainer.classList.remove('hidden');
    timerBar.style.width = '100%';

    let totalMilliseconds = seconds * 1000;
    let currentMilliseconds = totalMilliseconds;
    countdownInterval = setInterval(() => {
        currentMilliseconds -= 100;
        let percentage = (currentMilliseconds / totalMilliseconds) * 100;
        timerBar.style.width = percentage + '%';
        if (currentMilliseconds <= 0) {
            clearInterval(countdownInterval);
            countdownInterval = null;
            timerBar.style.width = '0%';
            isTimerStopped = true;
        }
    }, 100);
}
function stopTimer() {
    clearInterval(countdownInterval);
    countdownInterval = null;
    timerContainer.classList.add('hidden');
    isTimerStopped = true;
}
function checkRoundComplete() {
    const currentRound = gameData.rounds[currentRoundIndex];
    let allPlayed = true;
    currentRound.categories.forEach((category, catIndex) => {
        category.questions.forEach((question, qIndex) => {
            const uniqueId = `${currentRoundIndex}-${catIndex}-${qIndex}`;
            if (!playedQuestions.includes(uniqueId)) {
                allPlayed = false;
            }
        });
    });
    return allPlayed;
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
                if (question.image) {
                    rightPane.classList.remove('hidden');
                } else {
                    rightPane.classList.add('hidden');
                }
                if (question.type === 'cat' || question.type === 'auction') {
                    specialText.innerHTML = (question.type === 'cat') ? 'КІТ В<br>МІШКУ!' : "ПИТАННЯ<br>АУКЦІОН!";
                    showScreen(specialScreen);
                } else {
                    showScreen(questionScreen);
                    typewriterEffect(question.text, questionText, 40, () => {
                        if (question.image) {
                            questionImg.src = question.image;
                            questionImg.style.opacity = '0';
                            void questionImg.offsetWidth;
                            questionImg.style.transition = 'opacity 0.5s ease-in';
                            questionImg.style.opacity = '1';
                        }
                        autoTimerTimeout = setTimeout(() => {
                            startTimer(TIME_LIMIT);
                        }, 2000);
                    }); 
                }       
            });
            rowDiv.appendChild(cellDiv);
        });
        gridContainer.appendChild(rowDiv);
    });
    boardScreen.appendChild(gridContainer);
}
document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowUp') {
        switch (currentIntro) {
            case 0:
                currentIntro = 1;
                showScreen(introScreen1);
                break;
            case 1:
                currentIntro = 2;
                showScreen(introScreen2);
                break;
            case 2:
                currentIntro = 3;
                runIntro3();
                break;
            case 3:
                break;
        }
        localStorage.setItem('currentIntro', currentIntro); 
    }
    if (event.key === 'Enter') {
        if (!specialScreen.classList.contains('hidden')) {
            hideScreen(specialScreen);
            if (isFinalRound) {
                currentQuestion = gameData.final;
                document.getElementById('question-category').textContent = 'ФІНАЛ';
                document.getElementById('question-price').textContent = '???';
                document.getElementById('question-right-pane').classList.add('hidden');
                document.getElementById('question-image').src = '';
                showScreen(questionScreen);
                typewriterEffect(currentQuestion.text, questionText, 40, null);
            } else {
                showScreen(questionScreen);
                typewriterEffect(currentQuestion.text, questionText, 40, () => {
                    if (currentQuestion.image) {
                        questionImg.src = currentQuestion.image;
                        questionImg.style.opacity = '0';
                        void questionImg.offsetWidth;
                        questionImg.style.transition = 'opacity 0.5s ease-in';
                        questionImg.style.opacity = '1';
                    }
                    autoTimerTimeout = setTimeout(() => {
                        startTimer(TIME_LIMIT);
                    }, 2000);
                });
            }
        }
        else if (!questionScreen.classList.contains('hidden')) {
            if (!isTimerStopped && timerContainer.classList.contains('hidden') && !countdownInterval) {
                if (typingInterval) {
                    clearInterval(typingInterval);
                    typingInterval = null;
                    questionText.textContent = currentQuestion.text;
                }
                clearTimeout(autoTimerTimeout);
                startTimer(TIME_LIMIT);
            } 
            else if (!isTimerStopped && (!timerContainer.classList.contains('hidden') || countdownInterval)) {
                stopTimer();
            } 
            else if (isTimerStopped) {
                hideScreen(questionScreen);
                showScreen(answerScreen);
                questionImg.src = '';
                questionImg.style = '';
                answerText.textContent = currentQuestion.answer;
                if (currentQuestion.explanation) {
                    answerExplanation.textContent = `(${currentQuestion.explanation})`;
                    answerExplanation.classList.remove('hidden');
                } else {
                    answerExplanation.classList.add('hidden');
                }
            }
        }
        else if (!answerScreen.classList.contains('hidden') && isFinalRound) {
            hideScreen(answerScreen);
            showScreen(gameOverScreen);
        }
    }

    if (event.key === 'Escape' || event.key === 'Backspace') {
        let returnedToBoard = false;
        if (!specialScreen.classList.contains('hidden')) {
            hideScreen(specialScreen);
            showScreen(boardScreen);
            returnedToBoard = true;
        }
        else if (!questionScreen.classList.contains('hidden')) {
            if (typingInterval) { clearInterval(typingInterval); }
            clearTimeout(autoTimerTimeout);
            stopTimer();
            hideScreen(questionScreen);
            showScreen(boardScreen);
            returnedToBoard = true;
        }
        else if (!answerScreen.classList.contains('hidden')) {
            hideScreen(answerScreen);
            showScreen(boardScreen);
            returnedToBoard = true;
        }
        if (returnedToBoard) {
            if (checkRoundComplete()) {
                currentRoundIndex++;
                if (currentRoundIndex < gameData.rounds.length) {
                    renderBoard();
                } else {
                    isFinalRound = true;
                    hideScreen(boardScreen);
                    specialText.innerHTML = 'ФІНАЛЬНИЙ<br>РАУНД';
                    showScreen(specialScreen);
                }
            }
        }
    }
    if (event.shiftKey && event.key === 'R') {
        if (confirm("Скинути localstorage?")) {
            localStorage.clear();
            location.reload();
        }
    } 
});
document.addEventListener('DOMContentLoaded', initGame);