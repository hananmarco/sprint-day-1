'use strict';

var gBoard = [];
var gLevels = [{ SIZE: 4, MINES: 2 }, { SIZE: 6, MINES: 5 }, { SIZE: 8, MINES: 15 }];
var gCurrLevel;
var gState = {
    isGameOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
};
var gConsoleInterval;
var gUserInterval;
var MINE = '💣';
var FLAG = '🚩';


function initGame(levelIdx) {
    // CR: good stuff
    resetGameStats();
    gCurrLevel = gLevels[levelIdx];
    buildBoard(gBoard, gCurrLevel);
    renderBoard(gBoard);
    toggleBestTime();
    showBestTime();
    setSmiley(0);
    setMineCounter();
    setSecondsCounter();
    console.table(gBoard);
}


function resetGameStats() {
    gBoard = [];
    gState = {
        isGameOn: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0
    };
    clearInterval(gConsoleInterval);
    clearInterval(gUserInterval);
    console.clear();
    var elWinMsg = document.querySelector('.win-msg');
    // CR: better use contains / toggle()
    if (elWinMsg.classList !== 'hidden') elWinMsg.classList.add('hidden');
    var elLoseMsg = document.querySelector('.lose-msg');
    if (elLoseMsg.classList !== 'hidden') elLoseMsg.classList.add('hidden');
}


function buildBoard(board, level) {
    console.log(board)
    for (var i = 0; i < level.SIZE; i++) {
        board.push([]);
        for (var j = 0; j < level.SIZE; j++) {
            var cell = {
                bombsAroundCount: 0,
                isShown: false,
                isBomb: false,
                isMarked: false
            };
            board[i].push(cell);
        }
    }
    return board;
}


function renderBoard(board) {
    var strHTML = '';
    for (var i = 0; i < board.length; i++) {
        strHTML += `<tr>`;
        for (var j = 0; j < board.length; j++) {
            var currCell = board[i][j];
            strHTML += `<td onmouseup="mouseUp(event, this, ${i}, ${j})" class="cell-${i}-${j}"></td>`;
        }
        strHTML += `</tr>`;
    }
    var elGameBoard = document.querySelector('.game-board');
    elGameBoard.innerHTML = strHTML;
}


function mouseUp(event, elCell, i, j) {
    switch (event.which) {
        case 1:
            firstClick(elCell, i, j);
            break;
        case 3:
            if (!gState.isGameOn) break;
            else {
                if (!gBoard[i][j].isMarked) {
                    gBoard[i][j].isMarked = true;
                    gState.markedCount++;
                    // CR: TD inside TD...?
                    elCell.innerHTML = `<td>${FLAG}</td>`;
                } else {
                    gBoard[i][j].isMarked = false;
                    gState.markedCount--;
                    elCell.innerHTML = `<td></td>`;
                }
                setMineCounter();
                checkGameOver()
                break;
            }
    }
}

// CR: wrong function name
function firstClick(elCell, iElCell, jElCell) {
    if (gState.isGameOn) cellClicked(elCell, iElCell, jElCell);
    else {

        gConsoleInterval = setInterval(function () {
            gState.secsPassed++;
        }, 1000);
        gState.isGameOn = true;
        // CR: better use a single interval
        gUserInterval = setInterval(function () {       // Update of the seconds counter depends on gConsoleInterval, so if gConsoleInterval is cleared then it's not necessary to clear gUserInterval, but I cleared it anyway.
            setSecondsCounter();
        }, 1000);
        placeBombsRandomly(gBoard, gCurrLevel, iElCell, jElCell);
        for (var i = 0; i < gBoard.length; i++) {
            for (var j = 0; j < gBoard.length; j++) {
                setMinesNegsCount(gBoard, i, j);
            }
        }
        cellClicked(elCell, iElCell, jElCell);
    }
}


function placeBombsRandomly(board, level, iClickedCell, jClickedCell) {
    // CR: remove this line
    boardCoords = [];
    var boardCoords = getBoardCoords(board);

    for (var i = 0; i < level.MINES; i++) {
        var randomIdx = getRandomInt(0, boardCoords.length);
        // CR: like
        var mineCoords = boardCoords.splice(randomIdx, 1);
        if (iClickedCell !== mineCoords[0].i && jClickedCell !== mineCoords[0].j) {
            board[mineCoords[0].i][mineCoords[0].j].isBomb = true;
        } else i--;
        // CR: better use WHILE loop, and do not mess with i--
    }
}

function getBoardCoords(board) {
    var boardCoords = [];
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            var cellCoords = { i: i, j: j };
            boardCoords.push(cellCoords);
        }
    }
    return boardCoords;
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}


function setMinesNegsCount(board, i, j) {
    var currCell = board[i][j];
    for (var iIdx = i - 1; iIdx <= i + 1 && iIdx < board.length; iIdx++) {
        if (iIdx < 0) continue;
        for (var jIdx = j - 1; jIdx <= j + 1 && jIdx < board.length; jIdx++) {
            if (jIdx < 0) continue;
            else if (iIdx === i && jIdx === j) continue;
            else {
                var currNegCell = board[iIdx][jIdx];
                if (currNegCell.isBomb) currCell.bombsAroundCount++;
            }
        }
    }
}


function cellClicked(elCell, i, j) {
    var currCell = gBoard[i][j];
    if (currCell.isShown) return;
    currCell.isShown = true;
    gState.shownCount++;
    elCell.classList.add('shown');
    if (currCell.isBomb) {
        elCell.innerHTML = `<td>${MINE}</td>`;
        gState.isGameOn = false;
        elCell.classList.add('bomb');
        setSmiley(1);
        var elLoseMsg = document.querySelector('.lose-msg');
        elLoseMsg.classList.remove('hidden');
        console.log('User lost the game');
    } else {
        if (currCell.bombsAroundCount > 0) {
            var bombsCount = currCell.bombsAroundCount.toString();
            elCell.innerHTML = `<td>${bombsCount}`;
        } else {
            expandShown(gBoard, i, j);
        }
    }
    checkGameOver();
}


function expandShown(board, i, j) {
    for (var iIdx = i - 1; iIdx <= i + 1 && iIdx < board.length; iIdx++) {
        if (iIdx < 0) continue;
        for (var jIdx = j - 1; jIdx <= j + 1 && jIdx < board.length; jIdx++) {
            if (jIdx < 0) continue;
            else if (iIdx === i && jIdx === j) continue;
            else {
                var currNegCell = board[iIdx][jIdx];
                if (!currNegCell.isShown && !currNegCell.isMarked) {
                    currNegCell.isShown = true;
                    gState.shownCount++;
                    var negCellClass = 'cell-' + iIdx + '-' + jIdx;
                    var elNegCell = document.querySelector(`.${negCellClass}`);

                    // CR: DRY - better have a revealCell() function
                    elNegCell.classList.add('shown');
                    if (currNegCell.bombsAroundCount > 0) {
                        var bombsCount = currNegCell.bombsAroundCount.toString();
                        elNegCell.innerHTML = `<td>${bombsCount}`;
                    } else {
                        expandShown(board, iIdx, jIdx);
                    }
                }
            }
        }
    }
}


function setSmiley(gameState) {
    var elSmiley = document.querySelector('.smiley');
    switch (gameState) {
        case 0:
            elSmiley.innerHTML = `<img src="img/smiley.png" />`;
            break;
        case 1:
            elSmiley.innerHTML = `<img src="img/dead.png" />`;
            break;
        case 2:
            elSmiley.innerHTML = `<img src="img/sunglasses.png" />`;
            break;
    }
}


function setMineCounter() {
    var elMineCounter = document.querySelector('.mine-count');
    elMineCounter.innerText = `Mines left: ${gCurrLevel.MINES - gState.markedCount}`;
}


function setSecondsCounter() {
    var elSecondsCounter = document.querySelector('.seconds-count');
    elSecondsCounter.innerText = `Seconds passed: ${gState.secsPassed}`;
}


function toggleBestTime() {
    var elBeginnerBestTime = document.querySelector('.beginner');
    var elMediumBestTime = document.querySelector('.medium');
    var elExpertBestTime = document.querySelector('.expert');
    if (gCurrLevel === gLevels[0]) {
        elBeginnerBestTime.classList.remove('hidden');
        elMediumBestTime.classList.add('hidden');
        elExpertBestTime.classList.add('hidden');
    } else if (gCurrLevel === gLevels[1]) {
        elMediumBestTime.classList.remove('hidden');
        elBeginnerBestTime.classList.add('hidden');
        elExpertBestTime.classList.add('hidden');
    } else {
        elExpertBestTime.classList.remove('hidden');
        elBeginnerBestTime.classList.add('hidden');
        elMediumBestTime.classList.add('hidden');
    }
}


function setBestTime() {
    if (gCurrLevel === gLevels[0]) {
        var prevBestTime = localStorage.getItem('Beginner Level Best Time');
        var currTime = gState.secsPassed;
        if (prevBestTime === null || currTime < prevBestTime) {
            prevBestTime = localStorage.setItem('Beginner Level Best Time', currTime);
        }
    } else if (gCurrLevel === gLevels[1]) {
        var prevBestTime = localStorage.getItem('Medium Level Best Time');
        var currTime = gState.secsPassed;
        if (prevBestTime === null || currTime < prevBestTime) {
            prevBestTime = localStorage.setItem('Medium Level Best Time', currTime);
        }
    } else {
        var prevBestTime = localStorage.getItem('Expert Level Best Time');
        var currTime = gState.secsPassed;
        if (prevBestTime === null || currTime < prevBestTime) {
            prevBestTime = localStorage.setItem('Expert Level Best Time', currTime);
        }
    }
}


function showBestTime() {
    if (gCurrLevel === gLevels[0]) {
        var bestTime = localStorage.getItem('Beginner Level Best Time');
        var elBeginnerBestTime = document.querySelector('.beginner .seconds');
        if (bestTime === null) return;
        elBeginnerBestTime.innerText = ` ${bestTime} seconds`;
    } else if (gCurrLevel === gLevels[1]) {
        var bestTime = localStorage.getItem('Medium Level Best Time');
        var elMediumBestTime = document.querySelector('.medium .seconds');
        if (bestTime === null) return;
        elMediumBestTime.innerText = ` ${bestTime} seconds`;
    } else {
        var bestTime = localStorage.getItem('Expert Level Best Time');
        var elExpertBestTime = document.querySelector('.expert .seconds');
        if (bestTime === null) return;
        elExpertBestTime.innerText = ` ${bestTime} seconds`;
    }
}


function checkGameOver() {
    var markedBombs = countMarkedBombs();
    if (!gState.isGameOn) {
        clearInterval(gConsoleInterval);
        clearInterval(gUserInterval);
        disableClicking();
    } else if ((gState.shownCount === gCurrLevel.SIZE ** 2 - gCurrLevel.MINES) && (markedBombs === gCurrLevel.MINES)) {
        // CR: DRY - better use the init function
        gState.isGameOn = false;
        clearInterval(gConsoleInterval);
        clearInterval(gUserInterval);
        setBestTime();
        showBestTime();
        setSmiley(2);
        disableClicking();
        var elWinMsg = document.querySelector('.win-msg');
        elWinMsg.classList.remove('hidden');
        console.log('User won the game');
    }
}

// CR: function works hard, better just use the counters
// also - this function returns undefined 
function countMarkedBombs() {
    var markedBombs = 0;
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            var currCell = gBoard[i][j];
            if (currCell.isBomb && currCell.isMarked) markedBombs++;
            if (markedBombs === gCurrLevel.MINES) return markedBombs;
        }
    }
}


//disabling right-click menu
document.oncontextmenu = function () {
    return false;
}


// CR: better use a global gIsGameOn
//disabling clicking on the board after game is over
function disableClicking() {
    var elCells = document.querySelectorAll('td');
    for (var i = 0; i < elCells.length; i++) {
        var elCell = elCells[i];
        elCell.onclick = '';
        elCell.onmouseup = '';
    }
}
