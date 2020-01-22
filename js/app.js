'use strict';


var gBoard;
var gLevel = {
    SIZE: 4,
    MINES: 2
};

var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}

var isFirstClicked = true;
var MAINE = '💣';
var FLAG = '🚩';


function initGame() {
    gBoard = buildBoard();
    renderBoard(gBoard);
}

function buildBoard() {

    var board = []
    var cell = {
        minesAroundCount: 0,
        isShown: true,
        isMine: false,
        isMarked: true
    }

    var board = new Array(gLevel.SIZE);
    for (var i = 0; i < gLevel.SIZE; i++) {
        board[i] = new Array(gLevel.SIZE);
    }

    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            board[i][j] = cell;
        }
    }
    console.log(board);
    return board;
}

function setMinesNegsCount() {
    var res;
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            res = countNegs(i, j);
            gBoard[i][j].minesAroundCount = res;
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
            if (gBoard[i][j] === MAINE) neighborsCount++
        }
    }
    return neighborsCount
}

function renderBoard(board) {

    var strHTML = '';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < board[0].length; j++) {

            var currCell = board[i][j];

            var cellClass = getClassName({ i: i, j: j })

            if (currCell.isMine === true) cellClass += ' MAINE';

            strHTML += '<td class="cell ' + cellClass + '" onclick="cellClicked(this, event,' + i + ',' + j + ')"</td>';



            // strHTML += '\t<td class="cell ' + cellClass + '" onclick="cellClicked(this, event,' + i + ',' + j + ')"';

            // '<td class="cell ' + cellClass + '"  onclick="cellClicked(this,' + i + ',' + j +
            // ')" onmousedown="cellMarked(this,event,' + i + ',' + j +
            // ')">' + currCell.minesAroundCount + '\n';

            // var tdId = `cell-${i}-${j}`;

            // if (currCell.isMine) {
            //     cellClass += ' mine';
            // }

            // strHTML += `<td id="${tdId}" class="${cellClass}" onclick="cellClicked(this)">
            //                 ${currCell}
            //             </td>`

            // strHtml += '<td class="cell ' + cellClass +
            //     '"  onclick="cellClicked(this,' + i + ',' + j +
            //     ')" "(this,event,' + i + ',' + j +
            //     ')">' + currCell. + '\n';

            // strHTML += '\t<td class="cell ' + cellClass + '" onclick="cellClicked(this, event,' + i + ',' + j + ')"\n';
            // strHTML += '\t</td>\n';

        }
        strHTML += '</tr>';
    }
    console.log('strHTML is:');
    console.log(strHTML);

    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHTML;
}

function getClassName(location) {
    var cellClass = 'cell-' + location.i + '-' + location.j;
    return cellClass;
}


function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}


function cellClicked(elCell, i, j) {
    if (gBoard[i][j].minesAroundCount) {
        gBoard[i][j].isShown = true;
        gGame.shownCount++;

    }
}
