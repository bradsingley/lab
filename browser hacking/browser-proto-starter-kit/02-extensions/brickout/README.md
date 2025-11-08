# 🎮 Brickout Browser Extension

Turn any webpage into a game of Breakout! Control a paddle with your mouse and bounce a ball to hit and hide HTML elements.

## Features

- **Mouse-controlled paddle** - Moves horizontally based on your cursor position
- **Launch button** - Click the button in the lower right to launch a new ball
- **Element destruction** - HTML elements act as "bricks" and get hidden when hit
- **Physics-based gameplay** - Ball bounces realistically off elements and walls
- **Visual feedback** - Elements fade out when hit

## How to Install

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `brickout` folder
5. The extension is now installed!

## How to Play

1. Click the Brickout extension icon in your browser toolbar
2. Click "Start Game" in the popup
3. Move your mouse to control the paddle at the bottom of the screen
4. Click the "🎮 Launch Ball" button in the lower right corner to start
5. Keep the ball from falling off the bottom of the screen
6. Hit HTML elements to make them disappear!

## Controls

- **Mouse movement** - Control paddle position (left/right)
- **Launch Ball button** - Click to send a new ball into play

## Tips

- The angle of the ball bounce off the paddle depends on where it hits
- Hit the ball with the edges of the paddle for sharper angles
- Larger elements are easier targets
- Text, images, buttons, divs - everything is fair game!

## Technical Details

- Built with vanilla JavaScript
- Uses Chrome Extension Manifest V3
- Content script injection for game overlay
- RequestAnimationFrame for smooth 60fps gameplay
- CSS transforms for hardware-accelerated rendering

## Customization

You can modify these constants in `content.js`:

- `PADDLE_WIDTH` - Width of the paddle (default: 100px)
- `PADDLE_HEIGHT` - Height of the paddle (default: 15px)
- `BALL_SIZE` - Diameter of the ball (default: 12px)
- `BALL_SPEED` - Speed multiplier (default: 3)

## Known Issues

- On pages with fixed positioning or z-index conflicts, some elements may appear above the game
- Very small elements (< 5px) are ignored to prevent micro-collisions

## Credits

Inspired by the classic Breakout arcade game. Built for educational purposes to demonstrate DOM manipulation and browser extension development.
