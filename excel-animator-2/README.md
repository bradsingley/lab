# Excel Animator 2

A simple GIF to Excel VBA animation converter.

## Usage

```bash
python3 gif_to_excel.py your-image.gif [width] [height]
```

This will generate `animation.vba` that you can paste into Excel.

## Steps

1. Run the script to convert your GIF
2. Open Excel
3. Press **Option+F11** (Mac) or **Alt+F11** (Windows) to open VBA Editor
4. Insert > Module
5. Paste the generated VBA code
6. Run the **Setup** macro first (sets cell sizes)
7. Run the **Animate** macro to play the animation

## Example

```bash
python3 gif_to_excel.py animation.gif 32 32
```

Creates a 32x32 pixel animation in Excel cells.
