# Alphabet Game

An interactive keyboard-based video game where pressing letter keys (A-Z) plays corresponding videos with captions.

## Features

- **Keyboard-driven**: Press any letter key (A-Z) to play its video
- **Video preloading**: All videos are preloaded on startup for smooth playback
- **Loading progress**: Visual progress bar shows preloading status
- **Captions**: Each video has a custom text caption displayed below
- **Centered layout**: Video and caption are centered on screen
- **Responsive**: Works on different screen sizes

## Setup

### Video Files
Place your video files in the `j4ne/videos/` folder (relative to the alphabet-game directory):
- Videos should be named: `a.mp4`, `b.mp4`, `c.mp4`, ... `z.mp4`
- Supported format: MP4

### Captions
Edit `captions.js` to customize the text for each letter:
```javascript
export const captions = {
    a: "Your custom text for letter A",
    b: "Your custom text for letter B",
    // ... etc
};
```

## Usage

1. Open `index.html` in a web browser
2. Wait for videos to preload (progress bar will show status)
3. Press any letter key (A-Z) to play the corresponding video
4. The caption will appear below the video

## File Structure

```
alphabet-game/
├── index.html          # Main HTML file
├── styles.css          # Styling and layout
├── game.js            # Game logic and video handling
├── captions.js        # Caption text for each letter
└── README.md          # This file

j4ne/
└── videos/
    ├── a.mp4
    ├── b.mp4
    ├── ...
    └── z.mp4
```

## Technical Details

- **Preloading**: Videos are loaded into memory before the game starts
- **Error handling**: If a video fails to load, the game continues
- **Timeout**: Each video load attempt has a 5-second timeout
- **Play prevention**: Videos can't be interrupted while playing (with 500ms buffer)

## Customization

### Video Path
Change the video folder location in `game.js`:
```javascript
const VIDEO_PATH = '../j4ne/videos/';
```

### Styling
Modify `styles.css` to change colors, sizes, and layout.

## Browser Support

Works in modern browsers that support:
- ES6 modules
- HTML5 video
- Async/await
