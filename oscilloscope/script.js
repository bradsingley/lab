const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const timeScale = document.getElementById('timeScale');
const voltScale = document.getElementById('voltScale');
const timeValue = document.getElementById('timeValue');
const voltValue = document.getElementById('voltValue');
const xIntensity = document.getElementById('xIntensity');
const yIntensity = document.getElementById('yIntensity');
const xValue = document.getElementById('xValue');
const yValue = document.getElementById('yValue');
const status = document.getElementById('status');

let audioContext;
let analyser;
let dataArray;
let bufferLength;
let animationId;
let isRunning = false;

// Set canvas resolution
function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2; // Retina display support
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Update control displays
timeScale.addEventListener('input', (e) => {
    timeValue.textContent = e.target.value;
});

voltScale.addEventListener('input', (e) => {
    voltValue.textContent = e.target.value;
});

xIntensity.addEventListener('input', (e) => {
    xValue.textContent = e.target.value;
});

yIntensity.addEventListener('input', (e) => {
    yValue.textContent = e.target.value;
});

// Start/Stop button
startBtn.addEventListener('click', async () => {
    if (!isRunning) {
        await startOscilloscope();
    } else {
        stopOscilloscope();
    }
});

async function startOscilloscope() {
    try {
        // Request microphone access
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Create audio context
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        
        // Connect microphone to analyser
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);
        
        // Configure analyser
        analyser.fftSize = 2048;
        bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
        
        // Update UI
        isRunning = true;
        startBtn.textContent = 'STOP';
        startBtn.classList.add('active');
        status.classList.add('hidden');
        
        // Start drawing
        draw();
        
    } catch (err) {
        console.error('Error accessing microphone:', err);
        status.textContent = 'Microphone access denied';
        status.classList.remove('hidden');
    }
}

function stopOscilloscope() {
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    
    if (audioContext) {
        audioContext.close();
    }
    
    isRunning = false;
    startBtn.textContent = 'START';
    startBtn.classList.remove('active');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width / 2, canvas.height / 2);
}

function draw() {
    animationId = requestAnimationFrame(draw);
    
    // Get waveform data
    analyser.getByteTimeDomainData(dataArray);
    
    const width = canvas.width / 2;
    const height = canvas.height / 2;
    
    // Clear with slight fade for persistence effect
    ctx.fillStyle = 'rgba(10, 30, 26, 0.15)';
    ctx.fillRect(0, 0, width, height);
    
    // Draw waveform
    ctx.beginPath();
    
    const timeScaleValue = parseInt(timeScale.value);
    const voltScaleValue = parseInt(voltScale.value);
    const xIntensityValue = parseInt(xIntensity.value);
    const yIntensityValue = parseInt(yIntensity.value);
    
    // Adjust line width based on intensity (X = horizontal density, Y = vertical density)
    ctx.lineWidth = 1 + (xIntensityValue / 5);
    ctx.shadowBlur = 5 + (xIntensityValue * 2);
    
    // Adjust brightness/opacity based on Y intensity
    const brightness = 0.3 + (yIntensityValue / 10) * 0.7;
    ctx.strokeStyle = `rgba(0, 255, 136, ${brightness})`;
    ctx.shadowColor = `rgba(0, 255, 136, ${brightness})`;
    
    // Adjust sampling based on time scale
    const sliceWidth = (width * timeScaleValue) / bufferLength;
    let x = 0;
    
    for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0; // Normalize to 0-2 range
        const y = (v * height * (voltScaleValue / 5)) / 2; // Scale based on volt control
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
        
        x += sliceWidth;
        
        // Stop if we've gone past the canvas
        if (x > width) break;
    }
    
    ctx.stroke();
    
    // Reset shadow for performance
    ctx.shadowBlur = 0;
}

// Show initial status
status.classList.remove('hidden');
