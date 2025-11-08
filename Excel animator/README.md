# GIF to Excel Pixel Art Animator

Convert animated GIFs into stop motion animations in Excel using VBA!

## Requirements

```bash
pip install Pillow numpy
```

## Usage

```bash
python gif_to_excel.py <input_gif> [width] [height] [colors] [delay_ms]
```

### Parameters

- `input_gif`: Path to your animated GIF file
- `width`: Grid width in pixels (default: 32)
- `height`: Grid height in pixels (default: 32)
- `colors`: Number of colors per channel for simplification (default: 16)
- `delay_ms`: Delay between frames in milliseconds (default: 200)

### Example

```bash
python gif_to_excel.py dancing_cat.gif 32 32 16 200
```

## How It Works

1. **Load GIF**: Reads the animated GIF and extracts all frames
2. **Resize**: Scales each frame to your target grid size
3. **Simplify Colors**: Reduces the color palette for a pixel art look
4. **Generate Coordinates**: Converts each pixel to (x, y, color) data
5. **Create VBA Code**: Generates Excel VBA code to animate the pixels

## Excel Setup

After running the script:

1. Open Excel
2. Press `Alt + F11` to open the VBA Editor
3. Click `Insert > Module`
4. Copy and paste the generated `.vba` file contents
5. Close the VBA Editor
6. In Excel, press `Alt + F8` to open Macros
7. Run `InitializeAnimation` to set up the grid
8. Run `StartAnimation` to start the animation
9. Run `StopAnimation` to stop

## Tips

- **Smaller is better**: Start with 16x16 or 32x32 for smoother performance
- **Fewer colors**: Use 8-16 colors per channel for cleaner pixel art
- **Frame delay**: 100-300ms works well for most animations
- **File size**: Keep GIFs under 50 frames for best Excel performance

## Advanced: Manual Frame Editing

The VBA code is fully editable! You can:
- Modify individual frame data
- Adjust colors
- Change animation speed
- Add custom effects

## Example Output

The script generates VBA code with:
- Grid initialization
- Frame-by-frame drawing functions
- Animation loop with timing
- Start/stop controls

Each frame is stored as a series of cell coloring commands optimized by grouping pixels of the same color.
