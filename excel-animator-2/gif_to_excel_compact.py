#!/usr/bin/env python3
"""
Compact GIF to Excel VBA converter using arrays
Data loading split across multiple subs to avoid "Procedure too large"
"""

from PIL import Image, ImageSequence
import sys

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 gif_to_excel_compact.py image.gif [width] [height]")
        sys.exit(1)
    
    gif_path = sys.argv[1]
    width = int(sys.argv[2]) if len(sys.argv) > 2 else 32
    height = int(sys.argv[3]) if len(sys.argv) > 3 else width
    
    print(f"Loading {gif_path}...")
    gif = Image.open(gif_path)
    
    # Extract frames
    frames = []
    for frame in ImageSequence.Iterator(gif):
        gray = frame.convert('L').resize((width, height), Image.Resampling.LANCZOS)
        gray = gray.quantize(colors=16).convert('L')
        frames.append(gray)
    
    print(f"Processing {len(frames)} frames at {width}x{height}...")
    
    # Generate VBA header
    vba = f"""Dim frameData({len(frames)-1}, {height-1}, {width-1})

Sub Setup
    ' Load all frame data (1 sub per frame)
"""
    
    # Call each frame loader
    for f_idx in range(len(frames)):
        vba += f"    LoadFrame{f_idx}\n"
    
    vba += f"""
    ' Setup cells
    Dim i, j
    For i = 1 To {height}
        Rows(i).RowHeight = 15
    Next i
    For j = 1 To {width}
        Columns(j).ColumnWidth = 2
    Next j
End Sub

"""
    
    # Create separate subs for loading frame data (1 frame per sub)
    for f_idx in range(len(frames)):
        vba += f"Sub LoadFrame{f_idx}\n"
        frame = frames[f_idx]
        pixels = frame.load()
        for y in range(height):
            for x in range(width):
                v = pixels[x, y]
                vba += f"    frameData({f_idx},{y},{x})={v}\n"
        vba += "End Sub\n\n"
    
    # Add animation sub
    vba += f"""Sub Animate
    Dim frame, y, x, v, i
    Dim delay
    delay = 0.15
    
    For i = 1 To 10
        For frame = 0 To {len(frames)-1}
            For y = 0 To {height-1}
                For x = 0 To {width-1}
                    v = frameData(frame, y, x)
                    Cells(y+1, x+1).Interior.Color = RGB(v, v, v)
                Next x
            Next y
            Application.Wait Now + TimeValue("0:00:00") + delay / 86400
            DoEvents
        Next frame
    Next i
End Sub
"""
    
    output = "animation.vba"
    with open(output, 'w') as f:
        f.write(vba)
    
    lines = vba.count('\n')
    size_kb = len(vba) / 1024
    
    print(f"✓ Generated {output}")
    print(f"  {lines:,} lines, {size_kb:.1f}KB")
    print(f"\nInstructions:")
    print(f"1. Open Excel")
    print(f"2. Press Option+F11 (VBA Editor)")
    print(f"3. Insert > Module") 
    print(f"4. Paste the code")
    print(f"5. Run 'Setup' to load data and format cells")
    print(f"6. Run 'Animate' to play (loops 10 times)")

if __name__ == "__main__":
    main()
