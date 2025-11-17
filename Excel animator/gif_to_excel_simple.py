#!/usr/bin/env python3
"""
Simple GIF to Excel VBA converter for Mac compatibility
Creates compact VBA code using arrays
"""

from PIL import Image, ImageSequence
import numpy as np

def process_frame(frame, width, height, palette_size):
    """Convert frame to RGB array with reduced palette"""
    frame_rgb = frame.convert('RGB')
    frame_rgb = frame_rgb.resize((width, height), Image.Resampling.LANCZOS)
    
    # Quantize to reduce colors
    frame_quantized = frame_rgb.quantize(colors=palette_size)
    frame_rgb = frame_quantized.convert('RGB')
    
    return np.array(frame_rgb)

def generate_vba(frames, width, height, frame_delay):
    """Generate VBA code"""
    vba = f"""Const FRAME_DELAY = {frame_delay}
Const NUM_FRAMES = {len(frames)}
Const GRID_WIDTH = {width}
Const GRID_HEIGHT = {height}
Const START_COL = 2
Const START_ROW = 2

Dim shouldStop
Dim frameData()

Sub InitAnimation
    Dim i
    shouldStop = False
    ReDim frameData(0 To {len(frames) - 1}, 0 To {height - 1}, 0 To {width - 1}, 0 To 2)
    
    ' Load frame data
"""
    
    # Add frame data
    for f_idx, frame in enumerate(frames):
        for y in range(height):
            for x in range(width):
                r, g, b = frame[y, x]
                vba += f"    frameData({f_idx},{y},{x},0)={r}:frameData({f_idx},{y},{x},1)={g}:frameData({f_idx},{y},{x},2)={b}\n"
    
    vba += """    
    DrawFrame 0
    MsgBox "Ready! Run StartAnimation.", vbInformation
End Sub

Sub StartAnimation
    Dim currentFrame
    currentFrame = 0
    
    Do While Not shouldStop
        DrawFrame currentFrame
        Application.Wait Now + TimeValue("0:00:00") + (FRAME_DELAY / 1000 / 86400)
        currentFrame = (currentFrame + 1) Mod NUM_FRAMES
        DoEvents
    Loop
End Sub

Sub StopAnimation
    shouldStop = True
End Sub

Sub DrawFrame(frameNum)
    Dim x, y, r, g, b
    
    For y = 0 To GRID_HEIGHT - 1
        For x = 0 To GRID_WIDTH - 1
            r = frameData(frameNum, y, x, 0)
            g = frameData(frameNum, y, x, 1)
            b = frameData(frameNum, y, x, 2)
            Cells(START_ROW + y, START_COL + x).Interior.Color = RGB(r, g, b)
        Next x
    Next y
End Sub
"""
    
    return vba

def main():
    import sys
    
    if len(sys.argv) < 3:
        print("Usage: python3 gif_to_excel_simple.py input.gif width [height] [palette] [delay]")
        sys.exit(1)
    
    gif_path = sys.argv[1]
    width = int(sys.argv[2])
    height = int(sys.argv[3]) if len(sys.argv) > 3 else width
    palette_size = int(sys.argv[4]) if len(sys.argv) > 4 else 16
    frame_delay = int(sys.argv[5]) if len(sys.argv) > 5 else 200
    
    print(f"Loading GIF: {gif_path}")
    gif = Image.open(gif_path)
    
    frames = []
    for i, frame in enumerate(ImageSequence.Iterator(gif)):
        print(f"Processing frame {i + 1}...")
        frames.append(process_frame(frame, width, height, palette_size))
    
    print(f"Processed {len(frames)} frames")
    print("Generating VBA code...")
    
    vba_code = generate_vba(frames, width, height, frame_delay)
    
    output_path = "mario_simple.vba"
    with open(output_path, 'w') as f:
        f.write(vba_code)
    
    lines = len(vba_code.split('\n'))
    print(f"VBA code saved to: {output_path}")
    print(f"Lines: {lines}, Size: {len(vba_code)} bytes")
    print("\nInstructions:")
    print("1. Open Excel")
    print("2. Press Option+F11 (Mac) or Alt+F11 (Windows)")
    print("3. Insert > Module")
    print("4. Paste the VBA code")
    print("5. Run 'InitAnimation' first")
    print("6. Run 'StartAnimation' to play")

if __name__ == "__main__":
    main()
