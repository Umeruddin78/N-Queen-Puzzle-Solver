'use strict'
const numberbox = document.getElementById("numberbox");
const slider = document.getElementById("slider");
const progressBar = document.getElementById("progress-bar");
const playButton = document.getElementById("play-button");

const queenIcon = '<i class="fas fa-chess-queen" style="color:#000"></i>';

let n, speed, tempSpeed, Board = 0;
let solutionsCount = [0, 2, 1, 1, 3, 11, 5, 41, 93];
let boardPositions = {};

// Update speed on slider change
speed = (100 - slider.value) * 10;
slider.oninput = function () {
    progressBar.style.width = `${this.value}%`;
    speed = (100 - slider.value) * 10;
}

class QueenSolver {
    constructor() {
        this.boards = {};
        this.boardCount = 0;
    }

    async solve() {
        Board = 0;
        this.boards[Board] = {};
        numberbox.disabled = true;
        await this.placeQueen(Board, 0, n);
        numberbox.disabled = false;
    }

    async placeQueen(boardIndex, row, size) {
        if (row === size) {
            this.boardCount++;
            const table = this.getBoardTable(this.boardCount);
            this.drawSolution(table, boardIndex, size);
            this.boards[this.boardCount] = { ...this.boards[boardIndex] };
            return true;
        }

        for (let col = 0; col < size; ++col) {
            await this.delay();
            await this.clearBoardColors(boardIndex);

            if (await this.isValidPlacement(boardIndex, row, col, size)) {
                const table = this.getBoardTable(boardIndex);
                this.markQueen(table, row, col, true);
                this.boards[boardIndex][row] = col;

                if (await this.placeQueen(boardIndex, row + 1, size)) await this.clearBoardColors(boardIndex);

                await this.delay();
                this.markQueen(table, row, col, false);
                delete this.boards[boardIndex][row];
            }
        }
    }

    async isValidPlacement(boardIndex, row, col, size) {
        const table = this.getBoardTable(boardIndex);
        const currentCell = this.getCell(table, row, col);
        currentCell.innerHTML = queenIcon;
        await this.delay();

        if (await this.checkDirection(table, row, col, size, -1, 0)) return false; // Check column
        if (await this.checkDirection(table, row, col, size, -1, -1)) return false; // Check left diagonal
        if (await this.checkDirection(table, row, col, size, -1, 1)) return false; // Check right diagonal

        return true;
    }

    async checkDirection(table, startRow, startCol, size, rowDelta, colDelta) {
        for (let r = startRow + rowDelta, c = startCol + colDelta; r >= 0 && c >= 0 && c < size; r += rowDelta, c += colDelta) {
            const cell = this.getCell(table, r, c);
            if (cell.innerHTML === queenIcon) {
                cell.style.backgroundColor = "#FB5607";
                return true;
            }
            cell.style.backgroundColor = "#ffca3a";
            await this.delay();
        }
        return false;
    }

    getBoardTable(index) {
        return document.getElementById(`table-${index}`);
    }

    getCell(table, row, col) {
        return table.rows[row].cells[col];
    }

    async clearBoardColors(boardIndex) {
        const table = this.getBoardTable(boardIndex);
        for (let row of table.rows) {
            for (let cell of row.cells) {
                cell.style.backgroundColor = ((row.rowIndex + cell.cellIndex) % 2 === 0) ? "#FCCD90" : "#FF9F1C";
            }
        }
    }

    drawSolution(table, boardIndex, size) {
        for (let row = 0; row < size; ++row) {
            const col = this.boards[boardIndex][row];
            this.getCell(table, row, col).innerHTML = queenIcon;
        }
    }

    markQueen(table, row, col, isPlaced) {
        this.getCell(table, row, col).innerHTML = isPlaced ? queenIcon : "-";
    }

    delay() {
        return new Promise((resolve) => setTimeout(resolve, speed));
    }
}

playButton.onclick = async function startVisualization() {
    const chessBoardContainer = document.getElementById("n-queen-board");
    const infoContainer = document.getElementById("queen-arrangement");

    n = parseInt(numberbox.value);
    if (n < 1 || n > 8) {
        alert("Please enter a valid number of queens (1-8)");
        return;
    }

    chessBoardContainer.innerHTML = '';
    infoContainer.innerHTML = `<p class="queen-info">For a ${n}x${n} board, ${solutionsCount[n] - 1} unique arrangements are possible.</p>`;

    const solver = new QueenSolver();
    solver.boardCount = solutionsCount[n];
    for (let i = 0; i < solutionsCount[n]; i++) {
        const table = createBoardTable(i, n);
        chessBoardContainer.appendChild(table);
    }

    await solver.solve();
};

function createBoardTable(index, size) {
    const div = document.createElement('div');
    const table = document.createElement('table');
    table.id = `table-${index}`;

    for (let row = 0; row < size; row++) {
        const tableRow = table.insertRow();
        for (let col = 0; col < size; col++) {
            const cell = tableRow.insertCell();
            cell.innerHTML = "-";
            cell.style.backgroundColor = (row + col) % 2 === 0 ? "#FCCD90" : "#FF9F1C";
            cell.style.border = "0.3px solid #373f51";
        }
    }
    div.appendChild(table);
    return div;
}
