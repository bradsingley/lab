const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const trailCanvas = document.getElementById('trailCanvas');
const trailCtx = trailCanvas.getContext('2d');
const circle = document.getElementById('circle');
const status = document.getElementById('status');
const clearBtn = document.getElementById('clearBtn');

let isTracking = false;
let lastX = null;
let lastY = null;

// Set trail canvas size
trailCanvas.width = window.innerWidth;
trailCanvas.height = window.innerHeight;

// Trail drawing settings
trailCtx.strokeStyle = 'black';
trailCtx.lineWidth = 8;
trailCtx.lineCap = 'round';
trailCtx.lineJoin = 'round';

// Clear button
clearBtn.addEventListener('click', () => {
    trailCtx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);
    lastX = null;
    lastY = null;
});

// Resize trail canvas on window resize
window.addEventListener('resize', () => {
    const imageData = trailCtx.getImageData(0, 0, trailCanvas.width, trailCanvas.height);
    trailCanvas.width = window.innerWidth;
    trailCanvas.height = window.innerHeight;
    trailCtx.putImageData(imageData, 0, 0);
    trailCtx.strokeStyle = 'black';
    trailCtx.lineWidth = 8;
    trailCtx.lineCap = 'round';
    trailCtx.lineJoin = 'round';
});

// Initialize MediaPipe Hands
const hands = new Hands({
    locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
    }
});

hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});

hands.onResults(onResults);

// Start camera
async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: 640,
                height: 480,
                facingMode: 'user'
            }
        });
        
        video.srcObject = stream;
        
        video.addEventListener('loadeddata', () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            status.textContent = 'Point with your index finger to draw';
            setTimeout(() => {
                status.classList.add('hidden');
            }, 3000);
            isTracking = true;
        });
        
        // Start hand detection
        const camera = new Camera(video, {
            onFrame: async () => {
                await hands.send({ image: video });
            },
            width: 640,
            height: 480
        });
        camera.start();
        
    } catch (err) {
        console.error('Error accessing camera:', err);
        status.textContent = 'Camera access denied';
    }
}

function onResults(results) {
    if (!isTracking) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];
        
        // Index finger tip is landmark 8
        const indexTip = landmarks[8];
        
        // Map to screen coordinates (mirror horizontally for natural feel)
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        
        const circleX = (1 - indexTip.x) * screenWidth;
        const circleY = indexTip.y * screenHeight;
        
        // Update circle position
        circle.style.left = `${circleX}px`;
        circle.style.top = `${circleY}px`;
        
        // Draw trail
        if (lastX !== null && lastY !== null) {
            trailCtx.beginPath();
            trailCtx.moveTo(lastX, lastY);
            trailCtx.lineTo(circleX, circleY);
            trailCtx.stroke();
        }
        
        lastX = circleX;
        lastY = circleY;
        
        // Draw debug point on video canvas
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(indexTip.x * canvas.width, indexTip.y * canvas.height, 5, 0, 2 * Math.PI);
        ctx.fill();
    } else {
        // Reset last position when hand is not detected
        lastX = null;
        lastY = null;
    }
}

// Initialize
startCamera();
