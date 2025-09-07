// DOM Elements - will be initialized when DOM is loaded
let uploadArea, imageInput, uploadBtn, maxWidthInput, pixelModeSelect;
let thresholdInput, thresholdValue, thresholdSetting, thresholdLabel;
let contrastInput, contrastValue, contrastSetting;
let grayscaleThresholdInput, grayscaleThresholdValue, grayscaleThresholdSetting;
let cameraArea, cameraBtn, cameraPreview, cameraVideo;
let captureBtn, closeCameraBtn, captureCanvas;
let previewSection, exportSection, originalCanvas, pixelatedCanvas, pixelGrid;
let exportExcelBtn, exportTextBtn;

// Global variables
let originalImage = null;
let pixelatedData = null;
let isProcessing = false;
let cameraStream = null;
let isOpeningCamera = false;

// Update control visibility based on mode
function updateThresholdDisplay() {
    const pixelMode = pixelModeSelect.value;
    if (pixelMode === 'binary') {
        thresholdSetting.style.display = 'flex';
        contrastSetting.style.display = 'none';
        grayscaleThresholdSetting.style.display = 'none';
        thresholdLabel.textContent = 'Black/White Threshold:';
    } else {
        thresholdSetting.style.display = 'none';
        contrastSetting.style.display = 'flex';
        grayscaleThresholdSetting.style.display = 'flex';
    }
}

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
    // Guard against double-invocation (e.g., bubbling from button to container)
    if (isProcessing || cameraStream || isOpeningCamera) return;
    isOpeningCamera = true;

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
    } finally {
        isOpeningCamera = false;
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
                // Grayscale mode: 0-9 with threshold-based adjustment
                const contrast = parseFloat(contrastInput.value);
                const grayscaleThreshold = parseInt(grayscaleThresholdInput.value);
                
                // Normalize gray to 0-1 range
                let normalizedGray = gray / 255;
                
                // Apply contrast adjustment (S-curve around midpoint)
                const midpoint = 0.5;
                if (normalizedGray < midpoint) {
                    normalizedGray = Math.pow(normalizedGray / midpoint, contrast) * midpoint;
                } else {
                    normalizedGray = 1 - Math.pow((1 - normalizedGray) / midpoint, contrast) * midpoint;
                }
                
                // Apply threshold-based mapping similar to binary but keeping 10 values
                const thresholdNormalized = grayscaleThreshold / 255;
                let mappedValue;
                
                if (normalizedGray < thresholdNormalized) {
                    // Below threshold: map to 0-4 range
                    mappedValue = Math.floor((normalizedGray / thresholdNormalized) * 5);
                } else {
                    // Above threshold: map to 5-9 range  
                    mappedValue = 5 + Math.floor(((normalizedGray - thresholdNormalized) / (1 - thresholdNormalized)) * 5);
                }
                
                // Convert to inverted 0-9 scale (0=black, 9=white)
                const grayValue = 9 - mappedValue;
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
    
    // Create CSS Grid container
    const gridContainer = document.createElement('div');
    gridContainer.className = 'pixel-grid-container';
    
    // Calculate grid dimensions
    const rows = pixelatedData.length;
    const cols = pixelatedData[0] ? pixelatedData[0].length : 0;
    
    // Set CSS Grid template
    gridContainer.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
    gridContainer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    // Set aspect ratio so the overall grid matches the image aspect
    // while each cell remains square (1fr x 1fr ensures square cells when aspect matches cols/rows)
    if (rows > 0 && cols > 0) {
        gridContainer.style.aspectRatio = `${cols} / ${rows}`;
    }
    
    // Create cells
    for (let y = 0; y < pixelatedData.length; y++) {
        for (let x = 0; x < pixelatedData[y].length; x++) {
            const cell = document.createElement('div');
            cell.className = 'pixel-cell';
            const pixelValue = pixelatedData[y][x];
            
            if (pixelMode === 'binary') {
                cell.classList.add(pixelValue === 1 ? 'black' : 'white');
            } else {
                // Grayscale mode: show background color
                cell.classList.add('grayscale');
                const grayLevel = 255 - (pixelValue * 25.5);
                cell.style.backgroundColor = `rgb(${grayLevel}, ${grayLevel}, ${grayLevel})`;
            }
            
            gridContainer.appendChild(cell);
        }
    }
    
    pixelGrid.appendChild(gridContainer);
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
    // Initialize DOM elements
    uploadArea = document.getElementById('uploadArea');
    imageInput = document.getElementById('imageInput');
    uploadBtn = document.getElementById('uploadBtn');
    maxWidthInput = document.getElementById('maxWidth');
    pixelModeSelect = document.getElementById('pixelMode');
    thresholdInput = document.getElementById('threshold');
    thresholdValue = document.getElementById('thresholdValue');
    thresholdSetting = document.getElementById('thresholdSetting');
    thresholdLabel = document.getElementById('thresholdLabel');
    contrastInput = document.getElementById('contrast');
    contrastValue = document.getElementById('contrastValue');
    contrastSetting = document.getElementById('contrastSetting');
    grayscaleThresholdInput = document.getElementById('grayscaleThreshold');
    grayscaleThresholdValue = document.getElementById('grayscaleThresholdValue');
    grayscaleThresholdSetting = document.getElementById('grayscaleThresholdSetting');
    cameraArea = document.getElementById('cameraArea');
    cameraBtn = document.getElementById('cameraBtn');
    cameraPreview = document.getElementById('cameraPreview');
    cameraVideo = document.getElementById('cameraVideo');
    captureBtn = document.getElementById('captureBtn');
    closeCameraBtn = document.getElementById('closeCameraBtn');
    captureCanvas = document.getElementById('captureCanvas');
    previewSection = document.getElementById('previewSection');
    exportSection = document.getElementById('exportSection');
    originalCanvas = document.getElementById('originalCanvas');
    pixelatedCanvas = document.getElementById('pixelatedCanvas');
    pixelGrid = document.getElementById('pixelGrid');
    exportExcelBtn = document.getElementById('exportExcelBtn');
    exportTextBtn = document.getElementById('exportTextBtn');

    // Set up event listeners
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

    grayscaleThresholdInput.addEventListener('input', () => {
        grayscaleThresholdValue.textContent = grayscaleThresholdInput.value;
        if (originalImage) {
            processImage();
        }
    });

    // Keep compatibility with blackPointInput if it exists
    const blackPointInput = document.getElementById('blackPoint');
    const blackPointValue = document.getElementById('blackPointValue');
    if (blackPointInput && blackPointValue) {
        blackPointInput.addEventListener('input', () => {
            blackPointValue.textContent = blackPointInput.value;
            if (originalImage) {
                processImage();
            }
        });
    }

    // Camera event listeners
    cameraArea.addEventListener('click', openCamera);
    // Prevent bubbling from the button to the area causing double-open
    cameraBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openCamera();
    });
    captureBtn.addEventListener('click', capturePhoto);
    closeCameraBtn.addEventListener('click', closeCamera);

    // Export listeners
    exportExcelBtn.addEventListener('click', exportToExcel);
    exportTextBtn.addEventListener('click', exportAsText);

    // Set initial threshold value
    thresholdValue.textContent = thresholdInput.value;
    
    // Set initial contrast value
    contrastValue.textContent = parseFloat(contrastInput.value).toFixed(1);
    
    // Set initial control display
    updateThresholdDisplay();
    
    // Removed auto instruction message on load
}); 