class Board {
    constructor(size = 8) {
        this.size = size;
        this.board = this.initializeBoard();
    }

    initializeBoard() {
        const board = Array.from({ length: this.size }, () => Array(this.size).fill(null));
        const mid = Math.floor(this.size / 2);
        board[mid - 1][mid - 1] = 'W';
        board[mid][mid] = 'W';
        board[mid - 1][mid] = 'B';
        board[mid][mid - 1] = 'B';
        return board;
    }

    renderBoard() {
        const boardElement = document.getElementById('board');
        boardElement.innerHTML = '';
        this.board.forEach((row, rowIndex) => {
            const rowElement = document.createElement('div');
            rowElement.className = 'row';
            row.forEach((cell, colIndex) => {
                const cellElement = document.createElement('div');
                cellElement.className = 'cell';
                cellElement.dataset.row = rowIndex;
                cellElement.dataset.col = colIndex;
                if (cell) {
                    const pieceElement = document.createElement('div');
                    pieceElement.className = `piece ${cell}`;
                    cellElement.appendChild(pieceElement);
                }
                rowElement.appendChild(cellElement);
            });
            boardElement.appendChild(rowElement);
        });
    }

    updateBoard(row, col, color) {
        if (this.board[row][col] === null) {
            this.board[row][col] = color;
            this.renderBoard();
        }
    }
}