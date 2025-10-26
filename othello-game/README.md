# Othello Game

## Overview
This project is a simple implementation of the classic board game Othello (also known as Reversi). The game is played on an 8x8 board with two players taking turns to place their pieces. The objective is to have the majority of pieces on the board at the end of the game.

## Files
- **src/index.html**: The main HTML document that sets up the structure of the Othello game.
- **src/app.js**: The entry point for the game logic, initializing the game and managing the game state.
- **src/board.js**: Defines the `Board` class, managing the visual representation and state of the game board.
- **src/game.js**: Exports the `Game` class, handling the core game logic and rules.
- **src/styles.css**: Contains the styles for the game, defining the appearance of the board and pieces.

## How to Play
1. The game starts with two pieces of each color placed in the center of the board.
2. Players take turns placing their pieces on the board, with the goal of surrounding the opponent's pieces.
3. A player can only place a piece in a position that captures at least one of the opponent's pieces.
4. The game ends when neither player can make a valid move. The player with the most pieces on the board wins.

## Setup Requirements
To run the game, simply open the `src/index.html` file in a web browser. No additional setup is required.

## Future Improvements
- Implement an AI opponent for single-player mode.
- Add a scoring system to display the current score during the game.
- Enhance the user interface with animations and sound effects.