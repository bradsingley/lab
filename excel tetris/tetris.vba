Option Explicit

' Game constants
Const BOARD_WIDTH As Integer = 10
Const BOARD_HEIGHT As Integer = 20
Const START_ROW As Integer = 4
Const START_COL As Integer = 3

' Game variables
Dim Board(1 To 20, 1 To 10) As Integer
Dim BoardColors(1 To 20, 1 To 10) As Long
Dim CurrentPiece(0 To 3, 0 To 3) As Integer
Dim NextPiece(0 To 3, 0 To 3) As Integer
Dim CurrentX As Integer
Dim CurrentY As Integer
Dim CurrentPieceType As Integer
Dim NextPieceType As Integer
Dim CurrentRotation As Integer
Dim Score As Long
Dim Level As Integer
Dim GameRunning As Boolean
Dim LinesCleared As Integer

' Piece colors
Dim PieceColors(0 To 6) As Long

Sub InitializeGame()
    ' Initialize piece colors (classic Tetris colors)
    PieceColors(0) = RGB(0, 255, 255)    ' I - Cyan
    PieceColors(1) = RGB(255, 255, 0)    ' O - Yellow
    PieceColors(2) = RGB(128, 0, 128)    ' T - Purple
    PieceColors(3) = RGB(0, 255, 0)      ' S - Green
    PieceColors(4) = RGB(255, 0, 0)      ' Z - Red
    PieceColors(5) = RGB(0, 0, 255)      ' J - Blue
    PieceColors(6) = RGB(255, 165, 0)    ' L - Orange
    
    ' Clear board
    Dim i As Integer, j As Integer
    For i = 1 To BOARD_HEIGHT
        For j = 1 To BOARD_WIDTH
            Board(i, j) = 0
            BoardColors(i, j) = 0
        Next j
    Next i
    
    ' Initialize game state
    Score = 0
    Level = 1
    LinesCleared = 0
    GameRunning = True
    
    ' Setup worksheet
    SetupWorksheet
    
    ' Setup keyboard controls
    SetupKeyboardControls
    
    ' Generate first next piece
    Randomize
    NextPieceType = Int(Rnd * 7)
    
    ' Spawn first piece
    SpawnPiece
    
    ' Start game loop
    GameLoop
    
    ' Remove keyboard controls when game ends
    RemoveKeyboardControls
End Sub

Sub SetupWorksheet()
    Dim ws As Worksheet
    Set ws = ActiveSheet
    
    ws.Cells.Clear
    ws.Cells.Interior.ColorIndex = 0
    
    ' Set overall background
    ws.Cells.Interior.Color = RGB(20, 20, 40)
    
    Dim i As Integer, j As Integer
    
    ' Create decorative top border
    For j = START_COL - 1 To START_COL + BOARD_WIDTH
        With ws.Cells(START_ROW - 2, j)
            .Interior.Color = RGB(60, 60, 100)
            .Borders.Color = RGB(100, 100, 150)
        End With
        With ws.Cells(START_ROW - 1, j)
            .Interior.Color = RGB(80, 80, 120)
            .Borders.Color = RGB(120, 120, 170)
        End With
    Next j
    
    ' Create game board area with border
    For i = 1 To BOARD_HEIGHT
        ' Left border
        With ws.Cells(START_ROW + i - 1, START_COL - 1)
            .Interior.Color = RGB(60, 60, 100)
            .Borders.Color = RGB(100, 100, 150)
            .ColumnWidth = 2
            .RowHeight = 15
        End With
        
        ' Game cells
        For j = 1 To BOARD_WIDTH
            With ws.Cells(START_ROW + i - 1, START_COL + j - 1)
                .Interior.Color = RGB(10, 10, 30)
                .Borders.Color = RGB(40, 40, 80)
                .ColumnWidth = 2
                .RowHeight = 15
            End With
        Next j
        
        ' Right border
        With ws.Cells(START_ROW + i - 1, START_COL + BOARD_WIDTH)
            .Interior.Color = RGB(60, 60, 100)
            .Borders.Color = RGB(100, 100, 150)
            .ColumnWidth = 2
            .RowHeight = 15
        End With
    Next i
    
    ' Create decorative bottom border
    For j = START_COL - 1 To START_COL + BOARD_WIDTH
        With ws.Cells(START_ROW + BOARD_HEIGHT, j)
            .Interior.Color = RGB(80, 80, 120)
            .Borders.Color = RGB(120, 120, 170)
        End With
        With ws.Cells(START_ROW + BOARD_HEIGHT + 1, j)
            .Interior.Color = RGB(60, 60, 100)
            .Borders.Color = RGB(100, 100, 150)
        End With
    Next j
    
    ' Add title
    With ws.Cells(START_ROW - 2, START_COL + 2)
        .Value = "T E T R I S"
        .Font.Bold = True
        .Font.Size = 14
        .Font.Color = RGB(255, 255, 255)
        .HorizontalAlignment = xlCenter
    End With
    ws.Range(ws.Cells(START_ROW - 2, START_COL + 2), ws.Cells(START_ROW - 2, START_COL + 7)).Merge
    
    ' Style the info panel
    Dim infoCol As Integer
    infoCol = START_COL + BOARD_WIDTH + 2
    
    With ws.Cells(START_ROW, infoCol)
        .Value = "SCORE"
        .Font.Bold = True
        .Font.Size = 12
        .Font.Color = RGB(255, 255, 0)
    End With
    
    With ws.Cells(START_ROW + 1, infoCol)
        .Value = Score
        .Font.Size = 16
        .Font.Color = RGB(255, 255, 255)
        .NumberFormat = "0"
    End With
    
    With ws.Cells(START_ROW + 3, infoCol)
        .Value = "LEVEL"
        .Font.Bold = True
        .Font.Size = 12
        .Font.Color = RGB(0, 255, 255)
    End With
    
    With ws.Cells(START_ROW + 4, infoCol)
        .Value = Level
        .Font.Size = 16
        .Font.Color = RGB(255, 255, 255)
    End With
    
    With ws.Cells(START_ROW + 6, infoCol)
        .Value = "LINES"
        .Font.Bold = True
        .Font.Size = 12
        .Font.Color = RGB(255, 0, 255)
    End With
    
    With ws.Cells(START_ROW + 7, infoCol)
        .Value = LinesCleared
        .Font.Size = 16
        .Font.Color = RGB(255, 255, 255)
    End With
    
    With ws.Cells(START_ROW + 10, infoCol)
        .Value = "NEXT"
        .Font.Bold = True
        .Font.Size = 12
        .Font.Color = RGB(200, 200, 200)
    End With
    
    ' Create next piece preview box
    For i = 0 To 3
        For j = 0 To 3
            With ws.Cells(START_ROW + 11 + i, infoCol + j)
                .Interior.Color = RGB(10, 10, 30)
                .Borders.Color = RGB(40, 40, 80)
                .ColumnWidth = 2
                .RowHeight = 15
            End With
        Next j
    Next i
    
    ' Create control buttons
    CreateControlButtons ws
End Sub

Sub CreateControlButtons(ws As Worksheet)
    Dim btnLeft As Button, btnRight As Button, btnRotate As Button, btnDown As Button, btnDrop As Button, btnStart As Button
    Dim infoCol As Integer
    infoCol = START_COL + BOARD_WIDTH + 2
    
    On Error Resume Next
    ws.Buttons.Delete
    On Error GoTo 0
    
    Dim btnTop As Double, arrowTop As Double
    btnTop = (START_ROW + BOARD_HEIGHT + 3) * 15
    arrowTop = btnTop
    
    ' Start button (near next piece preview, aligned with column O)
    Set btnStart = ws.Buttons.Add(14 * 72, (START_ROW + 16) * 15, 100, 30)
    btnStart.OnAction = "InitializeGame"
    btnStart.Caption = "START"
    btnStart.Font.Size = 12
    btnStart.Font.Bold = True
    
    ' Drop button (aligned with column B)
    Set btnDrop = ws.Buttons.Add(1 * 72, arrowTop + 30, 80, 25)
    btnDrop.OnAction = "HardDropKey"
    btnDrop.Caption = "DROP"
    btnDrop.Font.Size = 9
    
    ' Rotate button (up arrow position)
    Set btnRotate = ws.Buttons.Add((START_COL + 1) * 72 + 30, arrowTop, 50, 25)
    btnRotate.OnAction = "RotateKey"
    btnRotate.Caption = "ROTATE"
    btnRotate.Font.Size = 9
    
    ' Left button (left arrow position)
    Set btnLeft = ws.Buttons.Add(START_COL * 72 + 30, arrowTop + 30, 50, 25)
    btnLeft.OnAction = "MoveLeft"
    btnLeft.Caption = "LEFT"
    btnLeft.Font.Size = 9
    
    ' Down button (down arrow position - between left and right)
    Set btnDown = ws.Buttons.Add((START_COL + 1) * 72 + 30, arrowTop + 30, 50, 25)
    btnDown.OnAction = "MoveDown"
    btnDown.Caption = "DOWN"
    btnDown.Font.Size = 9
    
    ' Right button (right arrow position)
    Set btnRight = ws.Buttons.Add((START_COL + 2) * 72 + 30, arrowTop + 30, 50, 25)
    btnRight.OnAction = "MoveRight"
    btnRight.Caption = "RIGHT"
    btnRight.Font.Size = 9
End Sub

Sub GetPieceShape(pieceType As Integer, rotation As Integer)
    Dim i As Integer, j As Integer
    
    ' Clear current piece
    For i = 0 To 3
        For j = 0 To 3
            CurrentPiece(i, j) = 0
        Next j
    Next i
    
    ' Define pieces based on type and rotation
    Select Case pieceType
        Case 0 ' I-piece
            Select Case rotation
                Case 0
                    CurrentPiece(1, 0) = 1: CurrentPiece(1, 1) = 1
                    CurrentPiece(1, 2) = 1: CurrentPiece(1, 3) = 1
                Case 1
                    CurrentPiece(0, 2) = 1: CurrentPiece(1, 2) = 1
                    CurrentPiece(2, 2) = 1: CurrentPiece(3, 2) = 1
                Case 2
                    CurrentPiece(2, 0) = 1: CurrentPiece(2, 1) = 1
                    CurrentPiece(2, 2) = 1: CurrentPiece(2, 3) = 1
                Case 3
                    CurrentPiece(0, 1) = 1: CurrentPiece(1, 1) = 1
                    CurrentPiece(2, 1) = 1: CurrentPiece(3, 1) = 1
            End Select
            
        Case 1 ' O-piece (square)
            CurrentPiece(1, 1) = 1: CurrentPiece(1, 2) = 1
            CurrentPiece(2, 1) = 1: CurrentPiece(2, 2) = 1
            
        Case 2 ' T-piece
            Select Case rotation
                Case 0
                    CurrentPiece(0, 1) = 1
                    CurrentPiece(1, 0) = 1: CurrentPiece(1, 1) = 1: CurrentPiece(1, 2) = 1
                Case 1
                    CurrentPiece(0, 1) = 1
                    CurrentPiece(1, 1) = 1: CurrentPiece(1, 2) = 1
                    CurrentPiece(2, 1) = 1
                Case 2
                    CurrentPiece(1, 0) = 1: CurrentPiece(1, 1) = 1: CurrentPiece(1, 2) = 1
                    CurrentPiece(2, 1) = 1
                Case 3
                    CurrentPiece(0, 1) = 1
                    CurrentPiece(1, 0) = 1: CurrentPiece(1, 1) = 1
                    CurrentPiece(2, 1) = 1
            End Select
            
        Case 3 ' S-piece
            Select Case rotation
                Case 0, 2
                    CurrentPiece(0, 1) = 1: CurrentPiece(0, 2) = 1
                    CurrentPiece(1, 0) = 1: CurrentPiece(1, 1) = 1
                Case 1, 3
                    CurrentPiece(0, 1) = 1
                    CurrentPiece(1, 1) = 1: CurrentPiece(1, 2) = 1
                    CurrentPiece(2, 2) = 1
            End Select
            
        Case 4 ' Z-piece
            Select Case rotation
                Case 0, 2
                    CurrentPiece(0, 0) = 1: CurrentPiece(0, 1) = 1
                    CurrentPiece(1, 1) = 1: CurrentPiece(1, 2) = 1
                Case 1, 3
                    CurrentPiece(0, 2) = 1
                    CurrentPiece(1, 1) = 1: CurrentPiece(1, 2) = 1
                    CurrentPiece(2, 1) = 1
            End Select
            
        Case 5 ' J-piece
            Select Case rotation
                Case 0
                    CurrentPiece(0, 0) = 1
                    CurrentPiece(1, 0) = 1: CurrentPiece(1, 1) = 1: CurrentPiece(1, 2) = 1
                Case 1
                    CurrentPiece(0, 1) = 1: CurrentPiece(0, 2) = 1
                    CurrentPiece(1, 1) = 1
                    CurrentPiece(2, 1) = 1
                Case 2
                    CurrentPiece(1, 0) = 1: CurrentPiece(1, 1) = 1: CurrentPiece(1, 2) = 1
                    CurrentPiece(2, 2) = 1
                Case 3
                    CurrentPiece(0, 1) = 1
                    CurrentPiece(1, 1) = 1
                    CurrentPiece(2, 0) = 1: CurrentPiece(2, 1) = 1
            End Select
            
        Case 6 ' L-piece
            Select Case rotation
                Case 0
                    CurrentPiece(0, 2) = 1
                    CurrentPiece(1, 0) = 1: CurrentPiece(1, 1) = 1: CurrentPiece(1, 2) = 1
                Case 1
                    CurrentPiece(0, 1) = 1
                    CurrentPiece(1, 1) = 1
                    CurrentPiece(2, 1) = 1: CurrentPiece(2, 2) = 1
                Case 2
                    CurrentPiece(1, 0) = 1: CurrentPiece(1, 1) = 1: CurrentPiece(1, 2) = 1
                    CurrentPiece(2, 0) = 1
                Case 3
                    CurrentPiece(0, 0) = 1: CurrentPiece(0, 1) = 1
                    CurrentPiece(1, 1) = 1
                    CurrentPiece(2, 1) = 1
            End Select
    End Select
End Sub

Sub SpawnPiece()
    ' Use the next piece as current
    CurrentPieceType = NextPieceType
    CurrentRotation = 0
    CurrentX = 3
    CurrentY = 0
    
    GetPieceShape CurrentPieceType, CurrentRotation
    
    ' Generate new next piece
    Randomize
    NextPieceType = Int(Rnd * 7)
    DrawNextPiece
    
    If Not CanPlacePiece(CurrentX, CurrentY) Then
        GameRunning = False
        MsgBox "Game Over!" & vbCrLf & vbCrLf & "Final Score: " & Score & vbCrLf & "Lines: " & LinesCleared, vbInformation, "Tetris"
    End If
End Sub

Function CanPlacePiece(x As Integer, y As Integer) As Boolean
    Dim i As Integer, j As Integer
    
    For i = 0 To 3
        For j = 0 To 3
            If CurrentPiece(i, j) = 1 Then
                Dim boardX As Integer, boardY As Integer
                boardX = x + j
                boardY = y + i
                
                ' Check boundaries
                If boardX < 1 Or boardX > BOARD_WIDTH Or boardY > BOARD_HEIGHT Then
                    CanPlacePiece = False
                    Exit Function
                End If
                
                ' Check collision with placed pieces (only if within board and above row 0)
                If boardY >= 1 And boardY <= BOARD_HEIGHT Then
                    If boardX >= 1 And boardX <= BOARD_WIDTH Then
                        If Board(boardY, boardX) <> 0 Then
                            CanPlacePiece = False
                            Exit Function
                        End If
                    End If
                End If
            End If
        Next j
    Next i
    
    CanPlacePiece = True
End Function

Sub MovePiece(direction As String)
    If Not GameRunning Then Exit Sub
    
    Dim newX As Integer, newY As Integer
    newX = CurrentX
    newY = CurrentY
    
    Select Case direction
        Case "LEFT"
            newX = CurrentX - 1
        Case "RIGHT"
            newX = CurrentX + 1
        Case "DOWN"
            newY = CurrentY + 1
    End Select
    
    If CanPlacePiece(newX, newY) Then
        CurrentX = newX
        CurrentY = newY
    ElseIf direction = "DOWN" Then
        ' Lock piece in place
        LockPiece
    End If
    
    DrawBoard
End Sub

Sub RotatePiece()
    If Not GameRunning Then Exit Sub
    
    Dim oldRotation As Integer
    oldRotation = CurrentRotation
    
    CurrentRotation = (CurrentRotation + 1) Mod 4
    GetPieceShape CurrentPieceType, CurrentRotation
    
    If Not CanPlacePiece(CurrentX, CurrentY) Then
        ' Rotation failed, revert
        CurrentRotation = oldRotation
        GetPieceShape CurrentPieceType, CurrentRotation
    End If
    
    DrawBoard
End Sub

Sub HardDrop()
    If Not GameRunning Then Exit Sub
    
    Do While CanPlacePiece(CurrentX, CurrentY + 1)
        CurrentY = CurrentY + 1
    Loop
    
    LockPiece
    DrawBoard
End Sub

Sub LockPiece()
    Dim i As Integer, j As Integer
    
    ' Place piece on board with its color
    For i = 0 To 3
        For j = 0 To 3
            If CurrentPiece(i, j) = 1 Then
                Dim boardX As Integer, boardY As Integer
                boardX = CurrentX + j
                boardY = CurrentY + i
                
                If boardY >= 1 And boardY <= BOARD_HEIGHT And boardX >= 1 And boardX <= BOARD_WIDTH Then
                    Board(boardY, boardX) = 1
                    BoardColors(boardY, boardX) = PieceColors(CurrentPieceType)
                End If
            End If
        Next j
    Next i
    
    ' Check for completed lines
    CheckLines
    
    ' Spawn next piece
    SpawnPiece
End Sub

Sub CheckLines()
    Dim i As Integer, j As Integer
    Dim newLinesCleared As Integer
    Dim startTime As Double
    newLinesCleared = 0
    
    For i = BOARD_HEIGHT To 1 Step -1
        Dim fullLine As Boolean
        fullLine = True
        
        For j = 1 To BOARD_WIDTH
            If Board(i, j) = 0 Then
                fullLine = False
                Exit For
            End If
        Next j
        
        If fullLine Then
            newLinesCleared = newLinesCleared + 1
            
            ' Flash the line before clearing (visual feedback)
            For j = 1 To BOARD_WIDTH
                ActiveSheet.Cells(START_ROW + i - 1, START_COL + j - 1).Interior.Color = RGB(255, 255, 255)
            Next j
            
            ' Simple delay using DoEvents loop (Mac compatible)
            startTime = Timer
            Do While Timer < startTime + 0.1
                DoEvents
            Loop
            
            ' Move all lines above down
            Dim k As Integer
            For k = i To 2 Step -1
                For j = 1 To BOARD_WIDTH
                    Board(k, j) = Board(k - 1, j)
                    BoardColors(k, j) = BoardColors(k - 1, j)
                Next j
            Next k
            
            ' Clear top line
            For j = 1 To BOARD_WIDTH
                Board(1, j) = 0
                BoardColors(1, j) = 0
            Next j
            
            i = i + 1 ' Check this line again
        End If
    Next i
    
    ' Update score and stats
    If newLinesCleared > 0 Then
        LinesCleared = LinesCleared + newLinesCleared
        
        ' Scoring: Single=100, Double=300, Triple=500, Tetris=800
        Select Case newLinesCleared
            Case 1: Score = Score + 100 * Level
            Case 2: Score = Score + 300 * Level
            Case 3: Score = Score + 500 * Level
            Case 4: Score = Score + 800 * Level
        End Select
        
        Level = 1 + LinesCleared \ 10
        
        ActiveSheet.Cells(START_ROW + 1, START_COL + BOARD_WIDTH + 2).Value = Score
        ActiveSheet.Cells(START_ROW + 4, START_COL + BOARD_WIDTH + 2).Value = Level
        ActiveSheet.Cells(START_ROW + 7, START_COL + BOARD_WIDTH + 2).Value = LinesCleared
    End If
End Sub

Sub DrawBoard()
    Dim ws As Worksheet
    Set ws = ActiveSheet
    
    Dim i As Integer, j As Integer
    
    Application.ScreenUpdating = False
    
    ' Draw placed pieces with their colors
    For i = 1 To BOARD_HEIGHT
        For j = 1 To BOARD_WIDTH
            If Board(i, j) = 1 Then
                ws.Cells(START_ROW + i - 1, START_COL + j - 1).Interior.Color = BoardColors(i, j)
            Else
                ws.Cells(START_ROW + i - 1, START_COL + j - 1).Interior.Color = RGB(10, 10, 30)
            End If
        Next j
    Next i
    
    ' Draw current piece with its color
    For i = 0 To 3
        For j = 0 To 3
            If CurrentPiece(i, j) = 1 Then
                Dim boardY As Integer, boardX As Integer
                boardY = CurrentY + i
                boardX = CurrentX + j
                
                If boardY >= 1 And boardY <= BOARD_HEIGHT And boardX >= 1 And boardX <= BOARD_WIDTH Then
                    ws.Cells(START_ROW + boardY - 1, START_COL + boardX - 1).Interior.Color = PieceColors(CurrentPieceType)
                End If
            End If
        Next j
    Next i
    
    Application.ScreenUpdating = True
End Sub

Sub DrawNextPiece()
    Dim ws As Worksheet
    Set ws = ActiveSheet
    
    Dim i As Integer, j As Integer
    Dim infoCol As Integer
    infoCol = START_COL + BOARD_WIDTH + 2
    
    ' Clear preview area
    For i = 0 To 3
        For j = 0 To 3
            ws.Cells(START_ROW + 11 + i, infoCol + j).Interior.Color = RGB(10, 10, 30)
        Next j
    Next i
    
    ' Get next piece shape
    For i = 0 To 3
        For j = 0 To 3
            NextPiece(i, j) = 0
        Next j
    Next i
    
    ' Define next piece shape (always rotation 0)
    Select Case NextPieceType
        Case 0 ' I-piece
            NextPiece(1, 0) = 1: NextPiece(1, 1) = 1
            NextPiece(1, 2) = 1: NextPiece(1, 3) = 1
        Case 1 ' O-piece
            NextPiece(1, 1) = 1: NextPiece(1, 2) = 1
            NextPiece(2, 1) = 1: NextPiece(2, 2) = 1
        Case 2 ' T-piece
            NextPiece(0, 1) = 1
            NextPiece(1, 0) = 1: NextPiece(1, 1) = 1: NextPiece(1, 2) = 1
        Case 3 ' S-piece
            NextPiece(0, 1) = 1: NextPiece(0, 2) = 1
            NextPiece(1, 0) = 1: NextPiece(1, 1) = 1
        Case 4 ' Z-piece
            NextPiece(0, 0) = 1: NextPiece(0, 1) = 1
            NextPiece(1, 1) = 1: NextPiece(1, 2) = 1
        Case 5 ' J-piece
            NextPiece(0, 0) = 1
            NextPiece(1, 0) = 1: NextPiece(1, 1) = 1: NextPiece(1, 2) = 1
        Case 6 ' L-piece
            NextPiece(0, 2) = 1
            NextPiece(1, 0) = 1: NextPiece(1, 1) = 1: NextPiece(1, 2) = 1
    End Select
    
    ' Draw next piece in preview
    For i = 0 To 3
        For j = 0 To 3
            If NextPiece(i, j) = 1 Then
                ws.Cells(START_ROW + 11 + i, infoCol + j).Interior.Color = PieceColors(NextPieceType)
            End If
        Next j
    Next i
End Sub

Sub GameLoop()
    Dim lastMoveTime As Double
    lastMoveTime = Timer
    
    DrawBoard
    
    Do While GameRunning
        DoEvents
        
        ' Auto-drop piece based on level
        Dim dropInterval As Double
        dropInterval = 1 - (Level * 0.05)
        If dropInterval < 0.1 Then dropInterval = 0.1
        
        If Timer - lastMoveTime > dropInterval Then
            MovePiece "DOWN"
            lastMoveTime = Timer
        End If
    Loop
End Sub

' Control button macros
Sub MoveLeft()
    MovePiece "LEFT"
End Sub

Sub MoveRight()
    MovePiece "RIGHT"
End Sub

Sub MoveDown()
    MovePiece "DOWN"
End Sub

Sub RotateKey()
    RotatePiece
End Sub

Sub HardDropKey()
    HardDrop
End Sub

Sub SetupKeyboardControls()
    ' Map keyboard keys to game controls
    Application.OnKey "{LEFT}", "MoveLeft"
    Application.OnKey "{RIGHT}", "MoveRight"
    Application.OnKey "{DOWN}", "MoveDown"
    Application.OnKey "{UP}", "RotateKey"
    Application.OnKey " ", "HardDropKey"
End Sub

Sub RemoveKeyboardControls()
    ' Remove keyboard mappings
    Application.OnKey "{LEFT}"
    Application.OnKey "{RIGHT}"
    Application.OnKey "{DOWN}"
    Application.OnKey "{UP}"
    Application.OnKey " "
End Sub
