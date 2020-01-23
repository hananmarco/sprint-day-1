'use strict';
var gBoard;
var gLevel = [
    {
        SIZE: 4,
        MINES: 2
    },
    {
        SIZE: 8,
        MINES: 12
    },
    {
        SIZE: 12,
        MINES: 30
    }
];

var gGame = {
    isOn: true,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}

var gTimecounter = 0;
var gameInterval = null;
var gIsFirstClicked = true;
var gLevelIdx = 0;
var MINE = '💣';
var FLAG = '🚩';
var SMILE = '🙂';
var SUNGLASSES = '😎';
var SAD = '🙁';

function initGame() {
    gIsFirstClicked = true;
    document.querySelector('.smiley').innerText = SMILE;
    gBoard = buildBoard();
    renderBoard(gBoard);
}

function SetLevel(levelIdx) {
    gLevelIdx = levelIdx
    restart()
}
function buildBoard() {
    var size = gLevel[gLevelIdx].SIZE

    var board = []
    var board = new Array(size);
    for (var i = 0; i < size; i++) {
        board[i] = new Array(size);
    }
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            var cell = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
            board[i][j] = cell;
        }
    }
    return board;
}

function setMinesOnBoard(gBoard) {
    var count = 0;
    while (count < gLevel[gLevelIdx].MINES) {
        var iRandom = getRandomInt(0, gLevel[gLevelIdx].SIZE - 1);
        var jRandom = getRandomInt(0, gLevel[gLevelIdx].SIZE - 1);
        if (!gBoard[iRandom][jRandom].isMine) {
            gBoard[iRandom][jRandom].isMine = true;
            count++;
        }
    }
}

function setMinesNegsCount(board) {
    var minesCount;
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            minesCount = countNegs(i, j);
            board[i][j].minesAroundCount = minesCount;
        }
    }
}

function countNegs(posI, posJ) {
    var neighborsCount = 0
    for (var i = posI - 1; i <= posI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = posJ - 1; j <= posJ + 1; j++) {
            if (j < 0 || j >= gBoard.length) continue;
            if (i === posI && j === posJ) continue;
            if (gBoard[i][j].isMine === true) {
                neighborsCount++
            }
        }
    }
    return neighborsCount
}

function renderBoard(board) {
    var strHTML = ``;
    for (var i = 0; i < board.length; i++) {
        strHTML += `<tr>`;
        for (var j = 0; j < board[0].length; j++) {
            var currCell = board[i][j];
            var cellId = getCellId({ i: i, j: j })
            strHTML += `<td class="cell" id=${cellId} onclick="cellClicked(this,${i},${j})" onmousedown="cellMarked(this,event,${i},${j})">`

            strHTML += `</td>`
        }
        strHTML += `</tr>`;
    }
    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHTML;
}

function getCellId(location) {
    var cellId = 'cell-' + location.i + '-' + location.j;
    return cellId;
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

function cellClicked(elCell, i, j) {
    if (!gGame.isOn) return;
    if (gBoard[i][j].isShown || gBoard[i][j].isMarked) return;
    if (gIsFirstClicked) {
        setMinesOnBoard(gBoard, i, j)
        setMinesNegsCount(gBoard);
        gIsFirstClicked = false;
    }
    var cell = gBoard[i][j];
    if (cell.isMine) {
        revealAllMines()
        clearInterval(gameInterval)
        gameOver()
    }
    else {
        if (gTimecounter === 0) {
            startTimer();
        }
        if (cell.minesAroundCount !== 0) {
            cell.isShown = true
            renderCell(cell, i, j)
        }
        else {
            expandShown(gBoard, elCell, i, j)
        }
    }
}

function expandShown(board, elCell, posI, posJ) {
    for (var i = posI - 1; i <= posI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = posJ - 1; j <= posJ + 1; j++) {
            if (j < 0 || j >= board.length) continue;
            if (!board[i][j].isMine && !board[i][j].isMarked) {
                // console.log('!!')
                board[i][j].isShown = true;
                gGame.shownCount++
                renderCell(board[i][j], i, j);
            };
        }
    }
}

function cellMarked(elCell, event, i, j) {
    if (!gGame.isOn) return
    if (event.which === 3) {
        var cell = gBoard[i][j]
        if (cell.isMarked === true) {
            cell.isMarked = false
            gGame.markedCount--
        }
        else {
            cell.isMarked = true
            gGame.markedCount++
        }
        renderCell(cell, i, j)
    }
}

function renderCell(cell, i, j) {
    var elCell = document.querySelector(`#cell-${i}-${j}`)
    var strHTML = ``
    if (cell.isShown === true) {
        if (cell.isMine === true) {
            strHTML += MINE
        }
        else {
            strHTML += cell.minesAroundCount;
        }
    }
    if (cell.isMarked === true) {
        strHTML += FLAG
    }
    elCell.innerHTML = strHTML;
}

function revealAllMines() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            var cell = gBoard[i][j];
            if (cell.isMine) {
                cell.isShown = true;
                renderCell(cell, i, j)
            }
        }
    }
}

function gameOver() {
    document.querySelector('.smiley').innerText = SAD;
    gGame.isOn = false
}

function restart() {
    clearInterval(gameInterval)
    var elTimer = document.querySelector('.timer');
    elTimer.innerText = '0';
    gGame.isOn = true
    gGame.shownCount = 0
    initGame()
}

function startTimer() {
    gameInterval = setInterval(function () {
        gTimecounter++;
        var elTimer = document.querySelector('.timer');
        elTimer.innerText = gTimecounter;
    }, 1000);
}