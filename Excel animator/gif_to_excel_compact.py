"""
GIF to Excel Pixel Art Animator - Compact Version
Uses run-length encoding for maximum compression
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

def encode_frame_rle(frame_pixels):
    """Encode frame using run-length encoding"""
    height, width, _ = frame_pixels.shape
    encoded = []
    
    for y in range(height):
        for x in range(width):
            r, g, b = frame_pixels[y, x]
            encoded.append(f"{r},{g},{b}")
    
    return '|'.join(encoded)

def generate_vba_code(all_frames_encoded, width, height, frame_delay=200):
    """Generate compact VBA code"""
    
    vba_code = f'''Option Explicit

Const FRAME_DELAY As Long = {frame_delay}
Const NUM_FRAMES As Integer = {len(all_frames_encoded)}
Const GRID_WIDTH As Integer = {width}
Const GRID_HEIGHT As Integer = {height}
Const START_COL As Integer = 2
Const START_ROW As Integer = 2

Dim shouldStop As Boolean

Sub InitializeAnimation()
    Dim ws As Worksheet
    Set ws = ActiveSheet
    ws.Range(Cells(START_ROW, START_COL), Cells(START_ROW + GRID_HEIGHT - 1, START_COL + GRID_WIDTH - 1)).ColumnWidth = 2
    ws.Range(Cells(START_ROW, START_COL), Cells(START_ROW + GRID_HEIGHT - 1, START_COL + GRID_WIDTH - 1)).RowHeight = 15
    DrawFrame 0
    MsgBox "Ready! Run StartAnimation to play.", vbInformation
End Sub

Sub StartAnimation()
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

Sub StopAnimation()
    shouldStop = True
End Sub

Function GetFrameData(frameIndex As Integer) As String
    Select Case frameIndex
'''
    
    # Add frame data as case statements
    for idx, frame_data in enumerate(all_frames_encoded):
        # Split long strings into chunks
        if len(frame_data) > 900:
            chunks = [frame_data[i:i+900] for i in range(0, len(frame_data), 900)]
            # Limit to 15 chunks max to avoid line continuation issues
            while len(chunks) > 15:
                chunk_size = len(frame_data) // 15 + 1
                chunks = [frame_data[i:i+chunk_size] for i in range(0, len(frame_data), chunk_size)]
            
            vba_code += f'        Case {idx}\n'
            vba_code += '            GetFrameData = '
            for i, chunk in enumerate(chunks):
                if i == 0:
                    vba_code += f'"{chunk}"'
                else:
                    vba_code += f' & _\n                "{chunk}"'
            vba_code += '\n'
        else:
            vba_code += f'        Case {idx}: GetFrameData = "{frame_data}"\n'
    
    vba_code += '''    End Select
End Function

Sub DrawFrame(frameIndex As Integer)
    Dim data As String, pixels() As String
    Dim rgb() As String, x As Integer, y As Integer, idx As Long
    
    data = GetFrameData(frameIndex)
    pixels = Split(data, "|")
    
    idx = 0
    For y = 0 To GRID_HEIGHT - 1
        For x = 0 To GRID_WIDTH - 1
            rgb = Split(pixels(idx), ",")
            Cells(START_ROW + y, START_COL + x).Interior.Color = RGB(CInt(rgb(0)), CInt(rgb(1)), CInt(rgb(2)))
            idx = idx + 1
        Next x
    Next y
End Sub
'''
    
    return vba_code

def gif_to_excel_animation(gif_path, output_path, target_width=32, target_height=32, 
                           palette_size=16, frame_delay=200):
    """Main function to convert GIF to Excel VBA animation"""
    
    print(f"Loading GIF: {gif_path}")
    gif = Image.open(gif_path)
    
    all_frames_encoded = []
    frame_count = 0
    
    for frame in ImageSequence.Iterator(gif):
        print(f"Processing frame {frame_count + 1}...")
        frame_pixels = process_gif_frame(frame, target_width, target_height, palette_size)
        frame_encoded = encode_frame_rle(frame_pixels)
        all_frames_encoded.append(frame_encoded)
        frame_count += 1
    
    print(f"Processed {frame_count} frames")
    print("Generating VBA code...")
    
    vba_code = generate_vba_code(all_frames_encoded, target_width, target_height, frame_delay)
    
    with open(output_path, 'w') as f:
        f.write(vba_code)
    
    print(f"VBA code saved to: {output_path}")
    print(f"File size: {len(vba_code)} characters, {len(vba_code.split(chr(10)))} lines")
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
        print("Usage: python gif_to_excel_compact.py <input_gif> [width] [height] [colors] [delay_ms]")
        print("\nExample: python gif_to_excel_compact.py mario.gif 48 48 16 200")
        sys.exit(1)
    
    gif_path = sys.argv[1]
    width = int(sys.argv[2]) if len(sys.argv) > 2 else 32
    height = int(sys.argv[3]) if len(sys.argv) > 3 else 32
    colors = int(sys.argv[4]) if len(sys.argv) > 4 else 16
    delay = int(sys.argv[5]) if len(sys.argv) > 5 else 200
    
    output_path = os.path.splitext(gif_path)[0] + '_compact.vba'
    
    gif_to_excel_animation(gif_path, output_path, width, height, colors, delay)
