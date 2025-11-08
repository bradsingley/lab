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
    """Generate VBA code for Excel animation with data stored as strings"""
    
    # Convert frame data to compressed string format
    frame_strings = []
    for frame_data in all_frames_data:
        # Group by color and create compact representation
        color_groups = {}
        for pixel in frame_data:
            color = pixel['color']
            if color not in color_groups:
                color_groups[color] = []
            # Skip white pixels
            if color != '#ffffff':
                color_groups[color].append(f"{pixel['x']},{pixel['y']}")
        
        # Create string: "color:x1,y1,x2,y2;color:x1,y1..."
        frame_parts = []
        for color, positions in color_groups.items():
            if positions:  # Only include if there are pixels
                frame_parts.append(f"{color}:{';'.join(positions)}")
        frame_strings.append('|'.join(frame_parts))
    
    vba_code = '''Option Explicit

' Animation settings
Const FRAME_DELAY As Long = {delay}
Const NUM_FRAMES As Integer = {num_frames}
Const GRID_WIDTH As Integer = {width}
Const GRID_HEIGHT As Integer = {height}
Const START_COL As Integer = 2
Const START_ROW As Integer = 2

Dim frameData() As String
Dim shouldStop As Boolean

Sub InitializeAnimation()
    LoadFrameData
    Dim ws As Worksheet
    Set ws = ActiveSheet
    ws.Range(Cells(START_ROW, START_COL), Cells(START_ROW + GRID_HEIGHT - 1, START_COL + GRID_WIDTH - 1)).Clear
    ws.Range(Cells(START_ROW, START_COL), Cells(START_ROW + GRID_HEIGHT - 1, START_COL + GRID_WIDTH - 1)).ColumnWidth = 2
    ws.Range(Cells(START_ROW, START_COL), Cells(START_ROW + GRID_HEIGHT - 1, START_COL + GRID_WIDTH - 1)).RowHeight = 15
    DrawFrame 0
    MsgBox "Animation initialized. Run StartAnimation to begin.", vbInformation
End Sub

Sub LoadFrameData()
    ReDim frameData(0 To NUM_FRAMES - 1)
'''.format(
        delay=frame_delay,
        num_frames=len(all_frames_data),
        width=max(p['x'] for f in all_frames_data for p in f) if all_frames_data else 32,
        height=max(p['y'] for f in all_frames_data for p in f) if all_frames_data else 32
    )
    
    # Add frame data as strings (split into chunks to avoid line length limits)
    for idx, frame_str in enumerate(frame_strings):
        # VBA has a 1024 character line limit, so we need to split long strings
        if len(frame_str) > 800:
            chunks = [frame_str[i:i+800] for i in range(0, len(frame_str), 800)]
            vba_code += f'    frameData({idx}) = '
            for i, chunk in enumerate(chunks):
                if i == 0:
                    vba_code += f'"{chunk}" & _\n'
                elif i == len(chunks) - 1:
                    vba_code += f'                    "{chunk}"\n'
                else:
                    vba_code += f'                    "{chunk}" & _\n'
        else:
            vba_code += f'    frameData({idx}) = "{frame_str}"\n'
    
    vba_code += '''End Sub

Sub StartAnimation()
    Dim currentFrame As Integer
    shouldStop = False
    currentFrame = 0
    
    Do While Not shouldStop
        DrawFrame currentFrame
        currentFrame = (currentFrame + 1) Mod NUM_FRAMES
        DoEvents
    Loop
End Sub

Sub StopAnimation()
    shouldStop = True
End Sub

Sub DrawFrame(frameIndex As Integer)
    Dim ws As Worksheet
    Set ws = ActiveSheet
    
    ' Clear previous frame
    ws.Range(Cells(START_ROW, START_COL), _
             Cells(START_ROW + GRID_HEIGHT - 1, START_COL + GRID_WIDTH - 1)).Interior.Color = RGB(255, 255, 255)
    
    ' Parse and draw frame data
    Dim data As String
    data = frameData(frameIndex)
    
    If Len(data) = 0 Then Exit Sub
    
    Dim colorGroups As Variant
    Dim colorGroup As Variant
    Dim colorParts As Variant
    Dim hexColor As String
    Dim positions As Variant
    Dim pos As Variant
    Dim coords As Variant
    Dim r As Integer, g As Integer, b As Integer
    Dim x As Integer, y As Integer
    
    colorGroups = Split(data, "|")
    
    For Each colorGroup In colorGroups
        If Len(colorGroup) > 0 Then
            colorParts = Split(colorGroup, ":")
            If UBound(colorParts) >= 1 Then
                hexColor = colorParts(0)
                positions = Split(colorParts(1), ";")
                
                ' Convert hex to RGB
                r = CLng("&H" & Mid(hexColor, 2, 2))
                g = CLng("&H" & Mid(hexColor, 4, 2))
                b = CLng("&H" & Mid(hexColor, 6, 2))
                
                ' Draw all positions with this color
                For Each pos In positions
                    If Len(pos) > 0 Then
                        coords = Split(pos, ",")
                        If UBound(coords) >= 1 Then
                            x = CInt(coords(0))
                            y = CInt(coords(1))
                            Cells(START_ROW + y - 1, START_COL + x - 1).Interior.Color = RGB(r, g, b)
                        End If
                    End If
                Next pos
            End If
        End If
    Next colorGroup
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
