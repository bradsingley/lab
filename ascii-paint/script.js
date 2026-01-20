// ASCII Paint Application

// Character palette - extracted from ASCII art block
const PALETTE_CHARS = [
  '░', ':', '(', ')', "'", '.', '-', '_',
  '~', '"', '`', '/', '\\', '|', '^', '=',
  '?', 'T', 'L', 'n', 'o', 'v', 'V', 'i',
  'I', '7', '8', 'l', ';', '!', ',', '<',
  '>', 'J', 'Y', ' '
];

class ASCIIPaint {
  constructor() {
    this.width = 40;
    this.height = 30;
    this.cells = [];
    this.selectedChar = '█';
    this.isErasing = false;
    this.showGrid = true;
    this.isPainting = false;
    this.isPanning = false;
    this.spaceHeld = false;
    this.referenceImage = null;
    
    // Mode: 'paint' or 'edit'
    this.mode = 'paint';
    
    // Cursor position for edit mode
    this.cursorX = 0;
    this.cursorY = 0;
    
    // Pan and zoom state
    this.panX = 50;
    this.panY = 50;
    this.zoom = 1;
    
    this.init();
  }
  
  init() {
    this.canvas = document.getElementById('canvas');
    this.container = document.getElementById('canvas-container');
    this.wrapper = document.getElementById('canvas-wrapper');
    
    // Create reference image element
    this.refImageEl = document.createElement('img');
    this.refImageEl.id = 'reference-image';
    this.refImageEl.style.display = 'none';
    this.container.insertBefore(this.refImageEl, this.canvas);
    
    this.buildPalette();
    this.buildCanvas();
    this.setupEventListeners();
    this.updateTransform();
    
    // Initialize grid button as active
    document.getElementById('toggleGrid').classList.add('active');
  }
  
  buildPalette() {
    const palette = document.getElementById('palette');
    palette.innerHTML = '';
    
    PALETTE_CHARS.forEach(char => {
      const el = document.createElement('div');
      el.className = 'palette-char';
      el.textContent = char;
      if (char === this.selectedChar) {
        el.classList.add('selected');
      }
      el.addEventListener('click', () => this.selectChar(char));
      palette.appendChild(el);
    });
  }
  
  selectChar(char) {
    this.selectedChar = char;
    this.isErasing = false;
    document.getElementById('eraseBtn').classList.remove('active');
    document.getElementById('currentChar').textContent = char;
    
    document.querySelectorAll('.palette-char').forEach(el => {
      el.classList.toggle('selected', el.textContent === char);
    });
  }
  
  buildCanvas() {
    this.canvas.innerHTML = '';
    this.canvas.style.gridTemplateColumns = `repeat(${this.width}, 10px)`;
    this.canvas.style.gridTemplateRows = `repeat(${this.height}, 16px)`;
    this.cells = [];
    
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const cell = document.createElement('div');
        cell.className = 'cell empty' + (this.showGrid ? ' show-grid' : '');
        cell.dataset.x = x;
        cell.dataset.y = y;
        cell.textContent = ' ';
        this.canvas.appendChild(cell);
        this.cells.push({ el: cell, char: ' ', empty: true });
      }
    }
  }
  
  getCell(x, y) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return null;
    return this.cells[y * this.width + x];
  }
  
  paintCell(x, y) {
    const cell = this.getCell(x, y);
    if (!cell) return;
    
    if (this.isErasing) {
      cell.char = ' ';
      cell.empty = true;
      cell.el.textContent = ' ';
      cell.el.classList.add('empty');
    } else {
      cell.char = this.selectedChar;
      cell.empty = false;
      cell.el.textContent = this.selectedChar;
      cell.el.classList.remove('empty');
    }
  }
  
  getCellFromEvent(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / (10 * this.zoom));
    const y = Math.floor((e.clientY - rect.top) / (16 * this.zoom));
    return { x, y };
  }
  
  updateTransform() {
    this.container.style.transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.zoom})`;
  }
  
  toggleGrid() {
    this.showGrid = !this.showGrid;
    const btn = document.getElementById('toggleGrid');
    btn.classList.toggle('active', this.showGrid);
    this.cells.forEach(cell => {
      cell.el.classList.toggle('show-grid', this.showGrid);
    });
  }
  
  resize(newWidth, newHeight) {
    // Save existing content
    const oldCells = [...this.cells];
    const oldWidth = this.width;
    const oldHeight = this.height;
    
    this.width = Math.max(5, Math.min(500, newWidth));
    this.height = Math.max(5, Math.min(500, newHeight));
    
    this.buildCanvas();
    
    // Restore content that fits
    for (let y = 0; y < Math.min(oldHeight, this.height); y++) {
      for (let x = 0; x < Math.min(oldWidth, this.width); x++) {
        const oldCell = oldCells[y * oldWidth + x];
        if (oldCell && !oldCell.empty) {
          this.paintCellDirect(x, y, oldCell.char);
        }
      }
    }
    
    // Update status bar
    document.getElementById('statusSize').textContent = `${this.width} × ${this.height}`;
  }
  
  paintCellDirect(x, y, char) {
    const cell = this.getCell(x, y);
    if (!cell) return;
    cell.char = char;
    cell.empty = false;
    cell.el.textContent = char;
    cell.el.classList.remove('empty');
  }
  
  clear() {
    this.cells.forEach(cell => {
      cell.char = ' ';
      cell.empty = true;
      cell.el.textContent = ' ';
      cell.el.classList.add('empty');
    });
  }
  
  loadImage(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Calculate grid size based on image dimensions
        // Using cell size of 10x16
        const cellWidth = 10;
        const cellHeight = 16;
        
        // Resize grid to match image aspect ratio
        const newWidth = Math.ceil(img.width / cellWidth);
        const newHeight = Math.ceil(img.height / cellHeight);
        
        // Update size inputs
        document.getElementById('canvasWidth').value = newWidth;
        document.getElementById('canvasHeight').value = newHeight;
        
        // Resize the canvas
        this.resize(newWidth, newHeight);
        
        // Set up reference image
        this.refImageEl.src = e.target.result;
        this.refImageEl.style.display = 'block';
        this.refImageEl.style.width = (newWidth * cellWidth) + 'px';
        this.refImageEl.style.height = (newHeight * cellHeight) + 'px';
        this.refImageEl.style.opacity = document.getElementById('imageOpacity').value / 100;
        
        this.referenceImage = img;
        
        // Show opacity controls and remove button
        document.getElementById('opacityGroup').style.display = 'flex';
        document.getElementById('removeImage').style.display = 'flex';
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
  
  removeImage() {
    this.refImageEl.style.display = 'none';
    this.refImageEl.src = '';
    this.referenceImage = null;
    document.getElementById('opacityGroup').style.display = 'none';
    document.getElementById('removeImage').style.display = 'none';
    document.getElementById('imageUpload').value = '';
  }
  
  copyAsText() {
    let text = '';
    for (let y = 0; y < this.height; y++) {
      let row = '';
      for (let x = 0; x < this.width; x++) {
        const cell = this.getCell(x, y);
        row += cell.empty ? ' ' : cell.char;
      }
      // Trim trailing spaces from each row
      text += row.trimEnd() + '\n';
    }
    // Remove trailing empty lines
    text = text.trimEnd();
    
    navigator.clipboard.writeText(text).then(() => {
      // Visual feedback
      const btn = document.getElementById('copyBtn');
      const originalText = btn.textContent;
      btn.textContent = '✓';
      btn.classList.add('active');
      setTimeout(() => {
        btn.textContent = originalText;
        btn.classList.remove('active');
      }, 1500);
    }).catch(err => {
      console.error('Failed to copy:', err);
      alert('Failed to copy to clipboard');
    });
  }
  
  toggleMode() {
    this.mode = this.mode === 'paint' ? 'edit' : 'paint';
    const btn = document.getElementById('modeBtn');
    btn.textContent = this.mode === 'paint' ? '✏️' : '✍️';
    btn.title = this.mode === 'paint' ? 'Paint Mode' : 'Edit Mode';
    btn.classList.toggle('active', this.mode === 'paint');
    
    // Update status indicator
    document.getElementById('statusMode').textContent = this.mode === 'paint' ? 'Paint' : 'Edit';
    
    // Update canvas cursor style
    this.canvas.classList.toggle('edit-mode', this.mode === 'edit');
    
    if (this.mode === 'edit') {
      this.updateCursor();
    } else {
      this.clearCursor();
    }
  }
  
  updateCursor() {
    // Clear previous cursor
    this.clearCursor();
    
    // Clamp cursor position
    this.cursorX = Math.max(0, Math.min(this.width - 1, this.cursorX));
    this.cursorY = Math.max(0, Math.min(this.height - 1, this.cursorY));
    
    // Add cursor class to current cell
    const cell = this.getCell(this.cursorX, this.cursorY);
    if (cell) {
      cell.el.classList.add('cursor');
    }
  }
  
  clearCursor() {
    this.cells.forEach(cell => cell.el.classList.remove('cursor'));
  }
  
  moveCursor(dx, dy) {
    this.cursorX = Math.max(0, Math.min(this.width - 1, this.cursorX + dx));
    this.cursorY = Math.max(0, Math.min(this.height - 1, this.cursorY + dy));
    this.updateCursor();
  }
  
  typeCharacter(char) {
    if (this.mode !== 'edit') return;
    
    // Paint the character at cursor position
    if (char === ' ') {
      const cell = this.getCell(this.cursorX, this.cursorY);
      if (cell) {
        cell.char = ' ';
        cell.empty = true;
        cell.el.textContent = ' ';
        cell.el.classList.add('empty');
      }
    } else {
      this.paintCellDirect(this.cursorX, this.cursorY, char);
    }
    
    // Move cursor right, wrap to next line if at end
    this.cursorX++;
    if (this.cursorX >= this.width) {
      this.cursorX = 0;
      this.cursorY++;
      if (this.cursorY >= this.height) {
        this.cursorY = this.height - 1;
        this.cursorX = this.width - 1;
      }
    }
    this.updateCursor();
  }
  
  pasteText(text) {
    if (this.mode !== 'edit') return;
    
    const lines = text.split('\n');
    let startX = this.cursorX;
    let y = this.cursorY;
    
    for (const line of lines) {
      let x = startX;
      for (const char of line) {
        if (x < this.width && y < this.height) {
          if (char === ' ') {
            const cell = this.getCell(x, y);
            if (cell) {
              cell.char = ' ';
              cell.empty = true;
              cell.el.textContent = ' ';
              cell.el.classList.add('empty');
            }
          } else if (char !== '\r') {
            this.paintCellDirect(x, y, char);
          }
          x++;
        }
      }
      y++;
      startX = 0; // Subsequent lines start at column 0
    }
    
    // Update cursor to end of pasted content
    this.cursorY = Math.min(this.height - 1, y - 1);
    this.updateCursor();
  }
  
  handleBackspace() {
    if (this.mode !== 'edit') return;
    
    // Move cursor back
    this.cursorX--;
    if (this.cursorX < 0) {
      this.cursorX = this.width - 1;
      this.cursorY--;
      if (this.cursorY < 0) {
        this.cursorY = 0;
        this.cursorX = 0;
      }
    }
    
    // Erase character at new position
    const cell = this.getCell(this.cursorX, this.cursorY);
    if (cell) {
      cell.char = ' ';
      cell.empty = true;
      cell.el.textContent = ' ';
      cell.el.classList.add('empty');
    }
    
    this.updateCursor();
  }
  
  setupEventListeners() {
    // Palette and tools
    document.getElementById('toggleGrid').addEventListener('click', () => this.toggleGrid());
    
    document.getElementById('eraseBtn').addEventListener('click', () => {
      this.isErasing = !this.isErasing;
      document.getElementById('eraseBtn').classList.toggle('active', this.isErasing);
      document.getElementById('currentChar').textContent = this.isErasing ? '⌫' : this.selectedChar;
      document.querySelectorAll('.palette-char').forEach(el => {
        el.classList.remove('selected');
      });
    });
    
    document.getElementById('clearBtn').addEventListener('click', () => this.clear());
    
    document.getElementById('copyBtn').addEventListener('click', () => this.copyAsText());
    
    document.getElementById('modeBtn').addEventListener('click', () => this.toggleMode());
    
    document.getElementById('resizeBtn').addEventListener('click', () => {
      const w = parseInt(document.getElementById('canvasWidth').value) || 40;
      const h = parseInt(document.getElementById('canvasHeight').value) || 30;
      this.resize(w, h);
    });
    
    // Image upload
    document.getElementById('imageUpload').addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        this.loadImage(e.target.files[0]);
      }
    });
    
    document.getElementById('removeImage').addEventListener('click', () => {
      this.removeImage();
    });
    
    document.getElementById('imageOpacity').addEventListener('input', (e) => {
      const opacity = e.target.value;
      document.getElementById('opacityValue').textContent = opacity + '%';
      this.refImageEl.style.opacity = opacity / 100;
    });
    
    // Painting and Edit mode
    this.canvas.addEventListener('mousedown', (e) => {
      if (this.spaceHeld) return;
      const { x, y } = this.getCellFromEvent(e);
      
      if (this.mode === 'edit') {
        // In edit mode, clicking sets the cursor position
        this.cursorX = Math.max(0, Math.min(this.width - 1, x));
        this.cursorY = Math.max(0, Math.min(this.height - 1, y));
        this.updateCursor();
      } else {
        // In paint mode, start painting
        this.isPainting = true;
        this.paintCell(x, y);
      }
    });
    
    this.canvas.addEventListener('mousemove', (e) => {
      const { x, y } = this.getCellFromEvent(e);
      
      // Update status bar position
      if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
        document.getElementById('statusPos').textContent = `${x}, ${y}`;
      }
      
      if (!this.isPainting || this.spaceHeld || this.mode === 'edit') return;
      this.paintCell(x, y);
    });
    
    this.canvas.addEventListener('mouseleave', () => {
      document.getElementById('statusPos').textContent = '';
    });
    
    document.addEventListener('mouseup', () => {
      this.isPainting = false;
    });
    
    // Panning with space bar and edit mode keyboard handling
    document.addEventListener('keydown', (e) => {
      // Don't handle if focus is on an input
      if (e.target.tagName === 'INPUT') return;
      
      if (e.code === 'Space' && !this.spaceHeld) {
        e.preventDefault();
        this.spaceHeld = true;
        this.wrapper.classList.add('panning');
        return;
      }
      
      // Edit mode keyboard handling
      if (this.mode === 'edit') {
        // Arrow keys for cursor movement
        if (e.code === 'ArrowLeft') {
          e.preventDefault();
          this.moveCursor(-1, 0);
        } else if (e.code === 'ArrowRight') {
          e.preventDefault();
          this.moveCursor(1, 0);
        } else if (e.code === 'ArrowUp') {
          e.preventDefault();
          this.moveCursor(0, -1);
        } else if (e.code === 'ArrowDown') {
          e.preventDefault();
          this.moveCursor(0, 1);
        } else if (e.code === 'Backspace') {
          e.preventDefault();
          this.handleBackspace();
        } else if (e.code === 'Delete') {
          e.preventDefault();
          // Delete character at cursor without moving
          const cell = this.getCell(this.cursorX, this.cursorY);
          if (cell) {
            cell.char = ' ';
            cell.empty = true;
            cell.el.textContent = ' ';
            cell.el.classList.add('empty');
          }
        } else if (e.code === 'Enter') {
          e.preventDefault();
          // Move to start of next line
          this.cursorX = 0;
          this.cursorY = Math.min(this.height - 1, this.cursorY + 1);
          this.updateCursor();
        } else if (e.code === 'Home') {
          e.preventDefault();
          this.cursorX = 0;
          this.updateCursor();
        } else if (e.code === 'End') {
          e.preventDefault();
          this.cursorX = this.width - 1;
          this.updateCursor();
        } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
          // Single character typed
          e.preventDefault();
          this.typeCharacter(e.key);
        }
      }
    });
    
    document.addEventListener('keyup', (e) => {
      if (e.code === 'Space') {
        this.spaceHeld = false;
        this.isPanning = false;
        this.wrapper.classList.remove('panning');
      }
    });
    
    // Paste event handler
    document.addEventListener('paste', (e) => {
      if (this.mode === 'edit' && e.target.tagName !== 'INPUT') {
        e.preventDefault();
        const text = e.clipboardData.getData('text');
        if (text) {
          this.pasteText(text);
        }
      }
    });
    
    let lastPanX, lastPanY;
    
    this.wrapper.addEventListener('mousedown', (e) => {
      if (this.spaceHeld) {
        this.isPanning = true;
        lastPanX = e.clientX;
        lastPanY = e.clientY;
      }
    });
    
    this.wrapper.addEventListener('mousemove', (e) => {
      if (this.isPanning && this.spaceHeld) {
        const dx = e.clientX - lastPanX;
        const dy = e.clientY - lastPanY;
        this.panX += dx;
        this.panY += dy;
        lastPanX = e.clientX;
        lastPanY = e.clientY;
        this.updateTransform();
      }
    });
    
    this.wrapper.addEventListener('mouseup', () => {
      this.isPanning = false;
    });
    
    // Zooming with scroll
    this.wrapper.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const newZoom = Math.max(0.25, Math.min(4, this.zoom * delta));
      
      // Zoom towards mouse position
      const rect = this.wrapper.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      const zoomRatio = newZoom / this.zoom;
      this.panX = mouseX - (mouseX - this.panX) * zoomRatio;
      this.panY = mouseY - (mouseY - this.panY) * zoomRatio;
      
      this.zoom = newZoom;
      this.updateTransform();
    }, { passive: false });
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new ASCIIPaint();
});
