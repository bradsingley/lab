"""
GIF to Excel Pixel Art Animator - Delta Compression
Only stores pixels that change between frames
"""

from PIL import Image, ImageSequence
import numpy as np
import os

def simplify_color(color, palette_size=16):
    """Reduce color to simplified palette"""
    r, g, b = color[:3]
    step = 256 // palette_size
    r = (r // step) * step
    g = (g // step) * step
    b = (b // step) * step
    return (r, g, b)

def process_gif_frame(frame, target_width=32, target_height=32, palette_size=16):
    """Process a single frame into simplified pixel grid"""
    frame = frame.convert('RGB')
    frame = frame.resize((target_width, target_height), Image.Resampling.NEAREST)
    pixels = np.array(frame)
    
    simplified = np.zeros_like(pixels)
    for i in range(pixels.shape[0]):
        for j in range(pixels.shape[1]):
            color = tuple(pixels[i, j])
            simplified[i, j] = simplify_color(color, palette_size)
    
    return simplified

def encode_delta(prev_frame, curr_frame):
    """Encode only pixels that changed"""
    height, width, _ = curr_frame.shape
    changes = []
    
    for y in range(height):
        for x in range(width):
            if prev_frame is None or not np.array_equal(prev_frame[y, x], curr_frame[y, x]):
                r, g, b = curr_frame[y, x]
                # Format: x,y,r,g,b
                changes.append(f"{x},{y},{r},{g},{b}")
    
    return '|'.join(changes) if changes else ""

def generate_vba_code(frame_deltas, width, height, frame_delay=200):
    """Generate VBA code with delta encoding"""
    
    vba_code = f'''Dim FRAME_DELAY
Dim NUM_FRAMES
Dim GRID_WIDTH
Dim GRID_HEIGHT
Dim START_COL
Dim START_ROW
Dim shouldStop
Dim frameDataResult

Sub InitializeAnimation
    FRAME_DELAY = {frame_delay}
    NUM_FRAMES = {len(frame_deltas)}
    GRID_WIDTH = {width}
    GRID_HEIGHT = {height}
    START_COL = 2
    START_ROW = 2
    Dim ws
    Set ws = ActiveSheet
    ws.Range(Cells(START_ROW, START_COL), Cells(START_ROW + GRID_HEIGHT - 1, START_COL + GRID_WIDTH - 1)).Interior.Color = RGB(255, 255, 255)
    ws.Range(Cells(START_ROW, START_COL), Cells(START_ROW + GRID_HEIGHT - 1, START_COL + GRID_WIDTH - 1)).ColumnWidth = 2
    ws.Range(Cells(START_ROW, START_COL), Cells(START_ROW + GRID_HEIGHT - 1, START_COL + GRID_WIDTH - 1)).RowHeight = 15
    DrawFrame 0
    MsgBox "Ready! Run StartAnimation to play.", vbInformation
End Sub

Sub StartAnimation
    Dim currentFrame As Integer
    shouldStop = False
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

Sub GetDelta frameIndex
    Select Case frameIndex
'''
    
    # Add frame deltas
    for idx, delta in enumerate(frame_deltas):
        if len(delta) > 800:
            chunks = [delta[i:i+800] for i in range(0, len(delta), 800)]
            # Limit chunks to avoid continuation issues
            while len(chunks) > 12:
                chunk_size = len(delta) // 12 + 1
                chunks = [delta[i:i+chunk_size] for i in range(0, len(delta), chunk_size)]
            
            vba_code += f'        Case {idx}\n'
            vba_code += '            frameDataResult = '
            for i, chunk in enumerate(chunks):
                if i == 0:
                    vba_code += f'"{chunk}"'
                else:
                    vba_code += f' & _\n                "{chunk}"'
            vba_code += '\n'
        else:
            vba_code += f'        Case {idx}: frameDataResult = "{delta}"\n'
    
    vba_code += '''    End Select
End Sub

Sub DrawFrame frameIndex
    Dim delta, changes()
    Dim i, parts()
    Dim x, y, r, g, b
    
    Call GetDelta(frameIndex)
    delta = frameDataResult
    If Len(delta) = 0 Then Exit Sub
    
    changes = Split(delta, "|")
    
    For i = LBound(changes) To UBound(changes)
        parts = Split(changes(i), ",")
        x = CInt(parts(0))
        y = CInt(parts(1))
        r = CInt(parts(2))
        g = CInt(parts(3))
        b = CInt(parts(4))
        Cells(START_ROW + y, START_COL + x).Interior.Color = RGB(r, g, b)
    Next i
End Sub
'''
    
    return vba_code

def gif_to_excel_animation(gif_path, output_path, target_width=32, target_height=32, 
                           palette_size=16, frame_delay=200):
    """Main function to convert GIF to Excel VBA animation"""
    
    print(f"Loading GIF: {gif_path}")
    gif = Image.open(gif_path)
    
    frame_deltas = []
    prev_frame = None
    frame_count = 0
    
    for frame in ImageSequence.Iterator(gif):
        print(f"Processing frame {frame_count + 1}...")
        curr_frame = process_gif_frame(frame, target_width, target_height, palette_size)
        delta = encode_delta(prev_frame, curr_frame)
        frame_deltas.append(delta)
        prev_frame = curr_frame.copy()
        frame_count += 1
    
    print(f"Processed {frame_count} frames")
    print("Generating VBA code...")
    
    vba_code = generate_vba_code(frame_deltas, target_width, target_height, frame_delay)
    
    with open(output_path, 'w') as f:
        f.write(vba_code)
    
    lines = len(vba_code.split('\n'))
    print(f"VBA code saved to: {output_path}")
    print(f"File size: {len(vba_code)} characters, {lines} lines")
    print("\nInstructions:")
    print("1. Open Excel")
    print("2. Press Alt+F11 to open VBA Editor")
    print("3. Insert > Module")
    print("4. Copy and paste the generated VBA code")
    print("5. Run 'InitializeAnimation' to set up")
    print("6. Run 'StartAnimation' to begin")
    print("7. Run 'StopAnimation' to stop")

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python gif_to_excel_delta.py <input_gif> [width] [height] [colors] [delay_ms]")
        print("\nExample: python gif_to_excel_delta.py mario.gif 32 32 16 200")
        sys.exit(1)
    
    gif_path = sys.argv[1]
    width = int(sys.argv[2]) if len(sys.argv) > 2 else 32
    height = int(sys.argv[3]) if len(sys.argv) > 3 else 32
    colors = int(sys.argv[4]) if len(sys.argv) > 4 else 16
    delay = int(sys.argv[5]) if len(sys.argv) > 5 else 200
    
    output_path = os.path.splitext(gif_path)[0] + '_delta.vba'
    
    gif_to_excel_animation(gif_path, output_path, width, height, colors, delay)
