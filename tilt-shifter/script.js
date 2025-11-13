let player;
let blurIntensity = 10;
let focusPosition = 50;
let focusWidth = 30;

// Initialize YouTube API
function onYouTubeIframeAPIReady() {
    console.log('YouTube API ready');
}

// Extract YouTube video ID from URL
function extractVideoId(url) {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
}

// Load video
function loadVideo() {
    const urlInput = document.getElementById('youtube-url');
    const videoId = extractVideoId(urlInput.value);
    
    if (!videoId) {
        alert('Please enter a valid YouTube URL');
        return;
    }
    
    if (player) {
        player.loadVideoById(videoId);
    } else {
        player = new YT.Player('player', {
            videoId: videoId,
            width: '100%',
            height: '100%',
            playerVars: {
                autoplay: 1,
                controls: 1,
                modestbranding: 1,
                rel: 0
            }
        });
    }
    
    document.getElementById('video-container').style.display = 'block';
}

// Update blur effect
function updateBlurEffect() {
    const overlay = document.getElementById('blur-overlay');
    
    // Calculate gradient stops based on focus position and width
    const focusStart = Math.max(0, focusPosition - focusWidth / 2);
    const focusEnd = Math.min(100, focusPosition + focusWidth / 2);
    
    // Create gradient for background
    const gradient = `linear-gradient(
        to bottom,
        rgba(0,0,0,0.1) 0%,
        transparent ${focusStart}%,
        transparent ${focusEnd}%,
        rgba(0,0,0,0.1) 100%
    )`;
    
    // Create mask for blur
    const mask = `linear-gradient(
        to bottom,
        black 0%,
        transparent ${focusStart}%,
        transparent ${focusEnd}%,
        black 100%
    )`;
    
    overlay.style.background = gradient;
    overlay.style.backdropFilter = `blur(${blurIntensity}px)`;
    overlay.style.webkitBackdropFilter = `blur(${blurIntensity}px)`;
    overlay.style.maskImage = mask;
    overlay.style.webkitMaskImage = mask;
}

// Event listeners
document.getElementById('load-btn').addEventListener('click', loadVideo);

document.getElementById('youtube-url').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        loadVideo();
    }
});

document.getElementById('blur-intensity').addEventListener('input', (e) => {
    blurIntensity = parseInt(e.target.value);
    document.getElementById('blur-value').textContent = blurIntensity;
    updateBlurEffect();
});

document.getElementById('focus-position').addEventListener('input', (e) => {
    focusPosition = parseInt(e.target.value);
    document.getElementById('focus-value').textContent = focusPosition;
    updateBlurEffect();
});

document.getElementById('focus-width').addEventListener('input', (e) => {
    focusWidth = parseInt(e.target.value);
    document.getElementById('width-value').textContent = focusWidth;
    updateBlurEffect();
});

// Initialize with default values
updateBlurEffect();
