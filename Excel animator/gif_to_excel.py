"""
GIF to Excel Pixel Art Animator
Converts an animated GIF into Excel-compatible VBA code for stop motion animation
"""

from PIL import Image, ImageSequence
import numpy as np
from collections import Counter
import os

def simplify_color(color, palette_size=16):
    """Reduce color to simplified palette"""
    r, g, b = color[:3]
    # Quantize each channel
    step = 256 // palette_size
    r = (r // step) * step
    g = (g // step) * step
    b = (b // step) * step
    return (r, g, b)

def rgb_to_hex(rgb):
    """Convert RGB tuple to hex color"""
    return '#{:02x}{:02x}{:02x}'.format(rgb[0], rgb[1], rgb[2])

def process_gif_frame(frame, target_width=32, target_height=32, palette_size=16):
    """Process a single frame into simplified pixel grid"""
    # Resize frame
    frame = frame.convert('RGB')
    frame = frame.resize((target_width, target_height), Image.Resampling.NEAREST)
    
    # Convert to numpy array
    pixels = np.array(frame)
    
    # Simplify colors
    simplified = np.zeros_like(pixels)
    for i in range(pixels.shape[0]):
        for j in range(pixels.shape[1]):
            color = tuple(pixels[i, j])
            simplified[i, j] = simplify_color(color, palette_size)
    
    return simplified

def generate_frame_data(frame_pixels):
    """Convert frame pixels to coordinate/color data"""
    height, width, _ = frame_pixels.shape
    frame_data = []
    
    for y in range(height):
        for x in range(width):
            color = tuple(frame_pixels[y, x])
            hex_color = rgb_to_hex(color)
            # Excel uses 1-based indexing
            frame_data.append({
                'x': x + 1,
                'y': y + 1,
                'color': hex_color
            })
    
    return frame_data

def generate_vba_code(all_frames_data, frame_delay=200):
    """Generate VBA code for Excel animation with data stored as arrays"""
    
    # Convert frame data to compressed format - but as arrays not strings
    frame_data_arrays = []
    for frame_data in all_frames_data:
        # Group by color and create compact representation
        pixels_by_color = {}
        for pixel in frame_data:
            color = pixel['color']
            # Skip white pixels
            if color != '#ffffff':
                if color not in pixels_by_color:
                    pixels_by_color[color] = []
                pixels_by_color[color].append((pixel['x'], pixel['y']))
        frame_data_arrays.append(pixels_by_color)
    
    vba_code = '''Option Explicit

' Animation settings
Const FRAME_DELAY As Long = {delay}
Const NUM_FRAMES As Integer = {num_frames}
Const GRID_WIDTH As Integer = {width}
Const GRID_HEIGHT As Integer = {height}
Const START_COL As Integer = 2
Const START_ROW As Integer = 2

Dim shouldStop As Boolean

Sub InitializeAnimation()
    Dim ws As Worksheet
    Set ws = ActiveSheet
    ws.Range(Cells(START_ROW, START_COL), Cells(START_ROW + GRID_HEIGHT - 1, START_COL + GRID_WIDTH - 1)).Interior.Color = RGB(255, 255, 255)
    ws.Range(Cells(START_ROW, START_COL), Cells(START_ROW + GRID_HEIGHT - 1, START_COL + GRID_WIDTH - 1)).ColumnWidth = 2
    ws.Range(Cells(START_ROW, START_COL), Cells(START_ROW + GRID_HEIGHT - 1, START_COL + GRID_WIDTH - 1)).RowHeight = 15
    DrawFrame 0
    MsgBox "Animation initialized. Run StartAnimation to begin.", vbInformation
End Sub

Sub StartAnimation()
    Dim currentFrame As Integer
    Dim rng As Range
    shouldStop = False
    currentFrame = 0
    Set rng = Range(Cells(START_ROW, START_COL), Cells(START_ROW + GRID_HEIGHT - 1, START_COL + GRID_WIDTH - 1))
    
    Do While Not shouldStop
        rng.Interior.Color = RGB(255, 255, 255)
        DrawFrame currentFrame
        Application.Wait Now + TimeValue("0:00:00") + (FRAME_DELAY / 1000 / 86400)
        currentFrame = (currentFrame + 1) Mod NUM_FRAMES
        DoEvents
    Loop
End Sub

Sub StopAnimation()
    shouldStop = True
End Sub
'''.format(
        delay=frame_delay,
        num_frames=len(all_frames_data),
        width=max(p['x'] for f in all_frames_data for p in f) if all_frames_data else 32,
        height=max(p['y'] for f in all_frames_data for p in f) if all_frames_data else 32
    )
    
    # Generate individual DrawFrame subroutines for each frame - only non-white pixels
    for idx, pixels_by_color in enumerate(frame_data_arrays):
        vba_code += f'\nSub DrawFrame{idx}()\n'
        vba_code += '    Dim ws As Worksheet\n'
        vba_code += '    Set ws = ActiveSheet\n'
        vba_code += '    \n'
        
        # Count total non-white pixels
        total_pixels = sum(len(positions) for positions in pixels_by_color.values())
        
        if total_pixels > 0:
            for color, positions in pixels_by_color.items():
                # Convert hex to RGB
                r = int(color[1:3], 16)
                g = int(color[3:5], 16)
                b = int(color[5:7], 16)
                
                # Set colored pixels
                for x, y in positions:
                    vba_code += f'    Cells(START_ROW+{y-1},START_COL+{x-1}).Interior.Color=RGB({r},{g},{b})\n'
        
        vba_code += 'End Sub\n'
    
    # Add dispatcher function
    vba_code += '''
Sub DrawFrame(frameIndex As Integer)
    Select Case frameIndex
'''
    
    for idx in range(len(frame_data_arrays)):
        vba_code += f'        Case {idx}: DrawFrame{idx}\n'
    
    vba_code += '''    End Select
End Sub
'''
    
    return vba_code

def gif_to_excel_animation(gif_path, output_path, target_width=32, target_height=32, 
                           palette_size=16, frame_delay=200):
    """Main function to convert GIF to Excel VBA animation"""
    
    print(f"Loading GIF: {gif_path}")
    
    # Load GIF
    gif = Image.open(gif_path)
    
    # Process each frame
    all_frames_data = []
    frame_count = 0
    
    for frame in ImageSequence.Iterator(gif):
        print(f"Processing frame {frame_count + 1}...")
        
        # Process frame
        frame_pixels = process_gif_frame(frame, target_width, target_height, palette_size)
        
        # Generate coordinate data
        frame_data = generate_frame_data(frame_pixels)
        all_frames_data.append(frame_data)
        
        frame_count += 1
    
    print(f"Processed {frame_count} frames")
    
    # Generate VBA code
    print("Generating VBA code...")
    vba_code = generate_vba_code(all_frames_data, frame_delay)
    
    # Save to file
    with open(output_path, 'w') as f:
        f.write(vba_code)
    
    print(f"VBA code saved to: {output_path}")
    print("\nInstructions:")
    print("1. Open Excel")
    print("2. Press Alt+F11 to open VBA Editor")
    print("3. Insert > Module")
    print("4. Copy and paste the generated VBA code")
    print("5. Close VBA Editor")
    print("6. Run 'InitializeAnimation' to set up")
    print("7. Run 'StartAnimation' to begin animation")
    print("8. Run 'StopAnimation' to stop")

# Example usage
if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python gif_to_excel.py <input_gif> [width] [height] [colors] [delay_ms]")
        print("\nExample: python gif_to_excel.py animation.gif 32 32 16 200")
        print("\nParameters:")
        print("  width: Grid width in pixels (default: 32)")
        print("  height: Grid height in pixels (default: 32)")
        print("  colors: Number of colors per channel (default: 16)")
        print("  delay_ms: Delay between frames in milliseconds (default: 200)")
        sys.exit(1)
    
    gif_path = sys.argv[1]
    width = int(sys.argv[2]) if len(sys.argv) > 2 else 32
    height = int(sys.argv[3]) if len(sys.argv) > 3 else 32
    colors = int(sys.argv[4]) if len(sys.argv) > 4 else 16
    delay = int(sys.argv[5]) if len(sys.argv) > 5 else 200
    
    output_path = os.path.splitext(gif_path)[0] + '_animation.vba'
    
    gif_to_excel_animation(gif_path, output_path, width, height, colors, delay)
