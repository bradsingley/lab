// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const imageInput = document.getElementById('imageInput');
const uploadBtn = document.getElementById('uploadBtn');
const maxWidthInput = document.getElementById('maxWidth');
const thresholdInput = document.getElementById('threshold');
const thresholdValue = document.getElementById('thresholdValue');
const previewSection = document.getElementById('previewSection');
const exportSection = document.getElementById('exportSection');
const originalCanvas = document.getElementById('originalCanvas');
const pixelatedCanvas = document.getElementById('pixelatedCanvas');
const pixelGrid = document.getElementById('pixelGrid');
const exportExcelBtn = document.getElementById('exportExcelBtn');
const exportTextBtn = document.getElementById('exportTextBtn');

// Global variables
let originalImage = null;
let pixelatedData = null;

// Event Listeners
uploadArea.addEventListener('click', () => imageInput.click());
uploadBtn.addEventListener('click', () => imageInput.click());
imageInput.addEventListener('change', handleImageUpload);

// Drag and drop functionality
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        imageInput.files = files;
        handleImageUpload();
    }
});

// Settings change listeners
maxWidthInput.addEventListener('input', processImage);
thresholdInput.addEventListener('input', () => {
    thresholdValue.textContent = thresholdInput.value;
    processImage();
});

// Export listeners
exportExcelBtn.addEventListener('click', exportToExcel);
exportTextBtn.addEventListener('click', exportAsText);

// Handle image upload
function handleImageUpload() {
    const file = imageInput.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        showMessage('Please select a valid image file.', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        originalImage = new Image();
        originalImage.onload = () => {
            displayOriginalImage();
            processImage();
            showMessage('Image uploaded successfully!', 'success');
        };
        originalImage.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// Display original image
function displayOriginalImage() {
    const ctx = originalCanvas.getContext('2d');
    const maxWidth = parseInt(maxWidthInput.value);
    
    // Calculate dimensions
    const ratio = originalImage.height / originalImage.width;
    const width = Math.min(originalImage.width, maxWidth);
    const height = width * ratio;
    
    originalCanvas.width = width;
    originalCanvas.height = height;
    
    ctx.drawImage(originalImage, 0, 0, width, height);
}

// Process image to create pixelated version
function processImage() {
    if (!originalImage) return;
    
    const maxWidth = parseInt(maxWidthInput.value);
    const threshold = parseInt(thresholdInput.value);
    
    // Calculate dimensions
    const ratio = originalImage.height / originalImage.width;
    const width = Math.min(originalImage.width, maxWidth);
    const height = width * ratio;
    
    // Create temporary canvas for processing
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = width;
    tempCanvas.height = height;
    
    // Draw original image
    tempCtx.drawImage(originalImage, 0, 0, width, height);
    
    // Get image data
    const imageData = tempCtx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    // Process pixels
    pixelatedData = [];
    for (let y = 0; y < height; y++) {
        const row = [];
        for (let x = 0; x < width; x++) {
            const index = (y * width + x) * 4;
            const r = data[index];
            const g = data[index + 1];
            const b = data[index + 2];
            
            // Convert to grayscale
            const gray = 0.299 * r + 0.587 * g + 0.114 * b;
            
            // Apply threshold
            const isBlack = gray < threshold;
            row.push(isBlack ? 1 : 0);
        }
        pixelatedData.push(row);
    }
    
    displayPixelatedImage();
    createPixelGrid();
    
    // Show preview and export sections
    previewSection.style.display = 'block';
    exportSection.style.display = 'block';
}

// Display pixelated image
function displayPixelatedImage() {
    const ctx = pixelatedCanvas.getContext('2d');
    const width = pixelatedData[0].length;
    const height = pixelatedData.length;
    
    pixelatedCanvas.width = width;
    pixelatedCanvas.height = height;
    
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = (y * width + x) * 4;
            const isBlack = pixelatedData[y][x];
            
            data[index] = isBlack ? 0 : 255;     // R
            data[index + 1] = isBlack ? 0 : 255; // G
            data[index + 2] = isBlack ? 0 : 255; // B
            data[index + 3] = 255;                // A
        }
    }
    
    ctx.putImageData(imageData, 0, 0);
}

// Create pixel grid display
function createPixelGrid() {
    pixelGrid.innerHTML = '';
    
    const table = document.createElement('table');
    
    for (let y = 0; y < pixelatedData.length; y++) {
        const row = document.createElement('tr');
        
        for (let x = 0; x < pixelatedData[y].length; x++) {
            const cell = document.createElement('td');
            cell.className = pixelatedData[y][x] ? 'black' : 'white';
            row.appendChild(cell);
        }
        
        table.appendChild(row);
    }
    
    pixelGrid.appendChild(table);
}

// Export to Excel (CSV)
function exportToExcel() {
    if (!pixelatedData) return;
    
    let csv = '';
    
    for (let y = 0; y < pixelatedData.length; y++) {
        const row = pixelatedData[y].map(pixel => pixel ? '1' : '0').join(',');
        csv += row + '\n';
    }
    
    downloadFile(csv, 'pixelated_image.csv', 'text/csv');
    showMessage('CSV file exported successfully!', 'success');
}

// Export as text
function exportAsText() {
    if (!pixelatedData) return;
    
    let text = '';
    
    for (let y = 0; y < pixelatedData.length; y++) {
        const row = pixelatedData[y].map(pixel => pixel ? '█' : ' ').join('');
        text += row + '\n';
    }
    
    downloadFile(text, 'pixelated_image.txt', 'text/plain');
    showMessage('Text file exported successfully!', 'success');
}

// Download file helper
function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Show message
function showMessage(message, type = 'success') {
    // Remove existing messages
    const existingMessage = document.querySelector('.message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create new message
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    // Insert after header
    const header = document.querySelector('header');
    header.parentNode.insertBefore(messageDiv, header.nextSibling);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 3000);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Set initial threshold value
    thresholdValue.textContent = thresholdInput.value;
    
    // Add some helpful instructions
    showMessage('Upload an image to get started!', 'success');
}); 