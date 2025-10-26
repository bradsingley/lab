// This file serves as the entry point for the game logic. It initializes the game, sets up event listeners, and manages the game state.

document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    game.startGame();

    const boardElement = document.getElementById('board');
    boardElement.addEventListener('click', (event) => {
        const target = event.target;
        if (target.classList.contains('cell')) {
            const row = target.dataset.row;
            const col = target.dataset.col;
            game.makeMove(row, col);
        }
    });
});