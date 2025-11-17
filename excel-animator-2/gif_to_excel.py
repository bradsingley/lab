#!/usr/bin/env python3
"""
Ultra-simple GIF to Excel VBA converter
Maximum Mac compatibility - no fancy features
"""

from PIL import Image, ImageSequence
import sys

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 gif_to_excel.py image.gif [width] [height] [grayscale]")
        print("  Add 'gray' or 'bw' as last argument for grayscale")
        sys.exit(1)
    
    gif_path = sys.argv[1]
    width = int(sys.argv[2]) if len(sys.argv) > 2 else 32
    height = int(sys.argv[3]) if len(sys.argv) > 3 else width
    grayscale = len(sys.argv) > 4 and sys.argv[4].lower() in ['gray', 'grayscale', 'bw', 'grey']
    
    print(f"Loading {gif_path}...")
    gif = Image.open(gif_path)
    
    # Extract frames
    frames = []
    for frame in ImageSequence.Iterator(gif):
        if grayscale:
            gray = frame.convert('L').resize((width, height), Image.Resampling.LANCZOS)
            gray = gray.quantize(colors=8).convert('L')
            frames.append(gray)
        else:
            rgb = frame.convert('RGB').resize((width, height), Image.Resampling.LANCZOS)
            # Reduce colors
            rgb = rgb.quantize(colors=8).convert('RGB')
            frames.append(rgb)
    
    print(f"Processing {len(frames)} frames at {width}x{height}...")
    
    # Generate VBA
    vba = f"""Sub Setup
    Dim i
    For i = 1 To {height}
        Rows(i).RowHeight = 15
        Columns(i).ColumnWidth = 2
    Next i
End Sub

Sub Animate
    Dim frame, delay, i
    delay = 0.2
    
    For i = 1 To 10
        For frame = 1 To {len(frames)}
            Select Case frame
"""
    
    # Add each frame as a separate case that calls a separate sub
    for f_idx in range(1, len(frames) + 1):
        vba += f"            Case {f_idx}: Frame{f_idx}\n"
    
    vba += """        End Select
        Application.Wait Now + TimeValue("0:00:00") + delay / 86400
        DoEvents
    Next frame
    Next i
End Sub

"""
    
    # Add each frame as its own Sub
    for f_idx, frame in enumerate(frames, 1):
        vba += f"Sub Frame{f_idx}\n"
        pixels = frame.load()
        for y in range(height):
            for x in range(width):
                if grayscale:
                    v = pixels[x, y]
                    vba += f"    Cells({y+1},{x+1}).Interior.Color=RGB({v},{v},{v})\n"
                else:
                    r, g, b = pixels[x, y]
                    vba += f"    Cells({y+1},{x+1}).Interior.Color=RGB({r},{g},{b})\n"
        vba += "End Sub\n\n"
    
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
    print(f"5. Run 'Setup' first")
    print(f"6. Run 'Animate' to play")

if __name__ == "__main__":
    main()
