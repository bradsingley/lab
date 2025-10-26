# Font Sleuth Extension

Identify fonts instantly by hovering over any text on a webpage. The font name appears as a tooltip above your cursor.

## Installation

1. Open Chrome or Edge
2. Go to `chrome://extensions` (or `edge://extensions`)
3. Enable "Developer mode" in the top right
4. Click "Load unpacked"
5. Select the `font-sleuth` folder
6. Generate the icon files (see below)

## Generating Icons

1. Open `create_icons.html` in your browser
2. Right-click each canvas and select "Save Image As..."
3. Save them as `icon16.png`, `icon48.png`, and `icon128.png` in the `font-sleuth` folder
4. Reload the extension in Chrome

## Usage

Simply move your mouse over any text on a webpage. A tooltip will appear showing:
- Font family name
- Font size
- Font weight (if not normal)
- Font style (if italic)

### Toggle Control

- Click the Font Sleuth extension icon in the toolbar to open the popup
- Use the toggle switch to enable or disable the extension
- The status indicator shows whether the extension is currently active
- Extension is enabled by default

## Features

- Real-time font detection
- Clean, unobtrusive tooltip with smooth animations
- Shows computed font properties
- Works on all websites
- No clicking required
- Easy toggle control to enable/disable
- Remembers your preference across browser sessions

## Troubleshooting

If tooltips aren't appearing:
1. Make sure the extension is enabled using the toggle in the popup
2. Check that you're hovering over actual text content
3. Try refreshing the page
4. Verify the extension is loaded and active in the extensions manager
