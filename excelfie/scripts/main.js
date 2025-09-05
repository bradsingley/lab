// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const imageInput = document.getElementById('imageInput');
const uploadBtn = document.getElementById('uploadBtn');
const maxWidthInput = document.getElementById('maxWidth');
const pixelModeSelect = document.getElementById('pixelMode');
const thresholdInput = document.getElementById('threshold');
const thresholdValue = document.getElementById('thresholdValue');
const thresholdSetting = document.getElementById('thresholdSetting');
const thresholdLabel = document.getElementById('thresholdLabel');
const contrastInput = document.getElementById('contrast');
const contrastValue = document.getElementById('contrastValue');
const contrastSetting = document.getElementById('contrastSetting');
const cameraArea = document.getElementById('cameraArea');
const cameraBtn = document.getElementById('cameraBtn');
const cameraPreview = document.getElementById('cameraPreview');
const cameraVideo = document.getElementById('cameraVideo');
const captureBtn = document.getElementById('captureBtn');
const closeCameraBtn = document.getElementById('closeCameraBtn');
const captureCanvas = document.getElementById('captureCanvas');
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
let isProcessing = false;
let cameraStream = null;

// Event Listeners
uploadArea.addEventListener('click', (e) => {
    // Trigger file input click for any click inside the upload area
    // unless we're currently processing
    if (!isProcessing) {
        imageInput.click();
    }
});
imageInput.addEventListener('change', (e) => {
    // Only process if files were actually selected
    if (e.target.files && e.target.files.length > 0) {
        handleImageUpload();
    }
});

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
        // Process the dropped file directly without triggering the change event
        handleImageUpload(files[0]);
    }
});

// Settings change listeners
maxWidthInput.addEventListener('input', processImage);
pixelModeSelect.addEventListener('change', () => {
    updateThresholdDisplay();
    processImage();
});
thresholdInput.addEventListener('input', () => {
    thresholdValue.textContent = thresholdInput.value;
    processImage();
});
contrastInput.addEventListener('input', () => {
    contrastValue.textContent = parseFloat(contrastInput.value).toFixed(1);
    processImage();
});

// Camera event listeners
cameraArea.addEventListener('click', openCamera);
cameraBtn.addEventListener('click', openCamera);
captureBtn.addEventListener('click', capturePhoto);
closeCameraBtn.addEventListener('click', closeCamera);

// Update control visibility based on mode
function updateThresholdDisplay() {
    const pixelMode = pixelModeSelect.value;
    if (pixelMode === 'binary') {
        thresholdSetting.style.display = 'flex';
        contrastSetting.style.display = 'none';
        thresholdLabel.textContent = 'Black/White Threshold:';
    } else {
        thresholdSetting.style.display = 'none';
        contrastSetting.style.display = 'flex';
    }
}

// Export listeners
exportExcelBtn.addEventListener('click', exportToExcel);
exportTextBtn.addEventListener('click', exportAsText);

// Handle image upload
function handleImageUpload(droppedFile = null) {
    // Prevent double processing
    if (isProcessing) return;
    
    const file = droppedFile || imageInput.files[0];
    if (!file) {
        console.log('No file selected');
        return;
    }
    
    console.log('Processing file:', file.name, 'Type:', file.type);

    // More robust file type validation
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/svg+xml'];
    const isValidImage = validImageTypes.includes(file.type.toLowerCase()) || file.type.startsWith('image/');
    
    if (!isValidImage) {
        showMessage(`Please select a valid image file. Selected file type: ${file.type}`, 'error');
        isProcessing = false;
        return;
    }

    isProcessing = true;
    
    // Update upload area to show processing
    const uploadContent = uploadArea.querySelector('.upload-content');
    const originalContent = uploadContent.innerHTML;
    uploadContent.innerHTML = '<div class="upload-icon">⏳</div><p>Processing image...</p>';
    
    const reader = new FileReader();
    reader.onload = (e) => {
        originalImage = new Image();
        originalImage.onload = () => {
            displayOriginalImage();
            processImage();
            showMessage('Image uploaded successfully!', 'success');
            restoreUploadArea();
            isProcessing = false;
        };
        originalImage.onerror = () => {
            showMessage('Error loading image. Please try again.', 'error');
            uploadContent.innerHTML = originalContent;
            isProcessing = false;
        };
        originalImage.src = e.target.result;
    };
    reader.onerror = () => {
        showMessage('Error reading file. Please try again.', 'error');
        uploadContent.innerHTML = originalContent;
        isProcessing = false;
    };
    reader.readAsDataURL(file);
}

// Restore upload area to original state
function restoreUploadArea() {
    const uploadContent = uploadArea.querySelector('.upload-content');
    uploadContent.innerHTML = `
        <div class="upload-icon">📷</div>
        <p>Click to upload an image or drag and drop</p>
        <button id="uploadBtn" class="btn btn-primary">Choose Image</button>
    `;
    // No need to re-attach event listener - it's handled by event delegation on uploadArea
}

// Camera functionality
async function openCamera() {
    if (isProcessing) return;
    
    try {
        const constraints = {
            video: {
                facingMode: 'user', // Front-facing camera for selfies
                width: { ideal: 640 },
                height: { ideal: 480 }
            }
        };
        
        cameraStream = await navigator.mediaDevices.getUserMedia(constraints);
        cameraVideo.srcObject = cameraStream;
        cameraPreview.style.display = 'block';
        
        showMessage('Camera opened! Position yourself and click Capture.', 'success');
    } catch (error) {
        console.error('Camera error:', error);
        let errorMessage = 'Camera access denied or not available.';
        
        if (error.name === 'NotFoundError') {
            errorMessage = 'No camera found on this device.';
        } else if (error.name === 'NotAllowedError') {
            errorMessage = 'Camera permission denied. Please allow camera access.';
        } else if (error.name === 'NotSupportedError') {
            errorMessage = 'Camera not supported on this device.';
        }
        
        showMessage(errorMessage, 'error');
    }
}

function closeCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
    cameraVideo.srcObject = null;
    cameraPreview.style.display = 'none';
    showMessage('Camera closed.', 'success');
}

function capturePhoto() {
    if (!cameraStream || isProcessing) return;
    
    const canvas = captureCanvas;
    const video = cameraVideo;
    
    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas to image
    canvas.toBlob(blob => {
        const reader = new FileReader();
        reader.onload = (e) => {
            originalImage = new Image();
            originalImage.onload = () => {
                displayOriginalImage();
                processImage();
                showMessage('Photo captured successfully!', 'success');
                closeCamera();
                isProcessing = false;
            };
            originalImage.onerror = () => {
                showMessage('Error processing captured photo.', 'error');
                isProcessing = false;
            };
            originalImage.src = e.target.result;
        };
        reader.readAsDataURL(blob);
    }, 'image/jpeg', 0.8);
    
    isProcessing = true;
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
    const pixelMode = pixelModeSelect.value;
    
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
            
            if (pixelMode === 'binary') {
                // Binary mode: 0 or 1 based on threshold
                const isBlack = gray < threshold;
                row.push(isBlack ? 1 : 0);
            } else {
                // Grayscale mode: 0-9 with contrast adjustment
                const contrast = parseFloat(contrastInput.value);
                
                // Normalize gray to 0-1 range
                let normalizedGray = gray / 255;
                
                // Apply contrast adjustment (S-curve around midpoint)
                const midpoint = 0.5;
                if (normalizedGray < midpoint) {
                    normalizedGray = Math.pow(normalizedGray / midpoint, contrast) * midpoint;
                } else {
                    normalizedGray = 1 - Math.pow((1 - normalizedGray) / midpoint, contrast) * midpoint;
                }
                
                // Convert to 0-9 scale (inverted so 0=black, 9=white)
                const grayValue = Math.floor((1 - normalizedGray) * 10);
                row.push(Math.min(9, Math.max(0, grayValue)));
            }
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
    const pixelMode = pixelModeSelect.value;
    
    pixelatedCanvas.width = width;
    pixelatedCanvas.height = height;
    
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = (y * width + x) * 4;
            const pixelValue = pixelatedData[y][x];
            
            let grayValue;
            if (pixelMode === 'binary') {
                grayValue = pixelValue === 1 ? 0 : 255;
            } else {
                // Convert 0-9 grayscale to 0-255 range
                grayValue = 255 - (pixelValue * 25.5);
            }
            
            data[index] = grayValue;     // R
            data[index + 1] = grayValue; // G
            data[index + 2] = grayValue; // B
            data[index + 3] = 255;       // A
        }
    }
    
    ctx.putImageData(imageData, 0, 0);
}

// Create pixel grid display
function createPixelGrid() {
    pixelGrid.innerHTML = '';
    const pixelMode = pixelModeSelect.value;
    
    const table = document.createElement('table');
    
    for (let y = 0; y < pixelatedData.length; y++) {
        const row = document.createElement('tr');
        
        for (let x = 0; x < pixelatedData[y].length; x++) {
            const cell = document.createElement('td');
            const pixelValue = pixelatedData[y][x];
            
            if (pixelMode === 'binary') {
                cell.className = pixelValue === 1 ? 'black' : 'white';
                cell.textContent = '';
            } else {
                // Grayscale mode: show background color only, no text
                cell.className = 'grayscale';
                cell.textContent = '';
                const grayLevel = 255 - (pixelValue * 25.5);
                cell.style.backgroundColor = `rgb(${grayLevel}, ${grayLevel}, ${grayLevel})`;
            }
            
            row.appendChild(cell);
        }
        
        table.appendChild(row);
    }
    
    pixelGrid.appendChild(table);
}

// Export to Excel (CSV)
function exportToExcel() {
    if (!pixelatedData) return;
    
    const pixelMode = pixelModeSelect.value;
    let csv = '';
    
    for (let y = 0; y < pixelatedData.length; y++) {
        const row = pixelatedData[y].map(pixel => {
            if (pixelMode === 'binary') {
                return pixel ? '1' : '0';
            } else {
                return pixel.toString();
            }
        }).join(',');
        csv += row + '\n';
    }
    
    const filename = pixelMode === 'binary' ? 'pixelated_image_binary.csv' : 'pixelated_image_grayscale.csv';
    downloadFile(csv, filename, 'text/csv');
    showMessage(`${pixelMode === 'binary' ? 'Binary' : 'Grayscale'} CSV file exported successfully!`, 'success');
}

// Export as text
function exportAsText() {
    if (!pixelatedData) return;
    
    const pixelMode = pixelModeSelect.value;
    let text = '';
    
    for (let y = 0; y < pixelatedData.length; y++) {
        const row = pixelatedData[y].map(pixel => {
            if (pixelMode === 'binary') {
                return pixel ? '█' : ' ';
            } else {
                return pixel.toString();
            }
        }).join(pixelMode === 'binary' ? '' : ' ');
        text += row + '\n';
    }
    
    const filename = pixelMode === 'binary' ? 'pixelated_image_binary.txt' : 'pixelated_image_grayscale.txt';
    downloadFile(text, filename, 'text/plain');
    showMessage(`${pixelMode === 'binary' ? 'Binary' : 'Grayscale'} text file exported successfully!`, 'success');
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
    
    // Set initial contrast value
    contrastValue.textContent = parseFloat(contrastInput.value).toFixed(1);
    
    // Set initial control display
    updateThresholdDisplay();
    
    // Add some helpful instructions
    showMessage('Upload an image to get started!', 'success');
}); 