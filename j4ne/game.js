import { captions } from './captions.js';

// Configuration
const VIDEO_PATH = 'videos/';
// Only include letters that have video files
const availableVideos = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'n', 'p', 't', 'y'];
const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');

// DOM elements
const gameScreen = document.getElementById('gameScreen');
const videoPlayer = document.getElementById('videoPlayer');
const captionLetter = document.getElementById('captionLetter');
const captionSentence = document.getElementById('captionSentence');

// Video cache
const videoCache = {};
let isPlaying = false;

// Preload all videos
async function preloadVideos() {
    let loaded = 0;
    const total = availableVideos.length;

    console.log(`Starting to load ${total} videos...`);

    for (const letter of availableVideos) {
        console.log(`Loading ${letter}.mp4...`);
        try {
            const video = document.createElement('video');
            video.preload = 'auto';
            video.src = `${VIDEO_PATH}${letter}.mp4`;
            
            // Wait for video to be loadable
            await new Promise((resolve) => {
                video.addEventListener('canplaythrough', () => {
                    videoCache[letter] = video;
                    loaded++;
                    console.log(`Loaded ${letter}.mp4 (${loaded}/${total})`);
                    updateProgress(loaded, total);
                    resolve();
                }, { once: true });
                
                video.addEventListener('error', (e) => {
                    console.error(`Failed to load ${letter}.mp4:`, e);
                    loaded++;
                    updateProgress(loaded, total);
                    resolve(); // Continue even if video fails
                }, { once: true });
                
                // Timeout after 3 seconds
                setTimeout(() => {
                    if (!videoCache[letter]) {
                        console.warn(`Timeout loading ${letter}.mp4`);
                        loaded++;
                        updateProgress(loaded, total);
                        resolve();
                    }
                }, 3000);
            });
        } catch (error) {
            console.error(`Error preloading ${letter}.mp4:`, error);
            loaded++;
            updateProgress(loaded, total);
        }
    }

    console.log('All videos loaded or timed out');
    // All videos loaded (or attempted)
    startGame();
}

// Update loading progress
function updateProgress(loaded, total) {
    const percentage = Math.round((loaded / total) * 100);
    progressFill.style.width = `${percentage}%`;
    loadingText.textContent = `${percentage}%`;
}

// Start the game
function startGame() {
    setTimeout(() => {
        loadingScreen.style.display = 'none';
        gameScreen.style.display = 'flex';
        setupKeyboardListeners();
    }, 500);
}

// Setup keyboard listeners
function setupKeyboardListeners() {
    const hiddenInput = document.getElementById('hiddenInput');
    const instructions = document.querySelector('.instructions');
    
    // Focus hidden input to trigger keyboard on mobile
    function focusInput() {
        hiddenInput.focus();
    }
    
    // Auto-focus on page load (may not work on all mobile browsers)
    setTimeout(focusInput, 100);
    
    // Focus when user taps anywhere
    document.addEventListener('click', focusInput);
    document.addEventListener('touchstart', focusInput);
    
    // Listen to keyboard events
    document.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();
        
        // Check if it's a letter
        if (letters.includes(key) && !isPlaying) {
            playVideo(key);
        }
    });
    
    // Also listen to input changes for mobile
    hiddenInput.addEventListener('input', (e) => {
        const value = e.target.value;
        if (value.length > 0) {
            const key = value.charAt(value.length - 1).toLowerCase();
            if (letters.includes(key) && !isPlaying) {
                playVideo(key);
            }
            // Clear input for next letter
            hiddenInput.value = '';
        }
    });
}

// Play video for the pressed key
function playVideo(letter) {
    const hiddenInput = document.getElementById('hiddenInput');
    
    // Check if this letter has a video file
    if (!availableVideos.includes(letter)) {
        console.warn(`No video for ${letter}`);
        showCaption(letter);
        return;
    }

    isPlaying = true;
    
    // Load and play video directly
    videoPlayer.src = `${VIDEO_PATH}${letter}.mp4`;
    videoPlayer.load();
    
    // Show caption
    showCaption(letter);
    
    // Play video
    videoPlayer.play().catch(err => {
        console.error('Error playing video:', err);
        isPlaying = false;
        hiddenInput.focus(); // Refocus on error
    });
    
    // Reset when video ends - keep last frame and caption visible
    videoPlayer.onended = () => {
        isPlaying = false;
        // Keep video on last frame and caption visible until next letter
        // Just refocus input to bring keyboard back
        hiddenInput.focus();
    };
    
    // Also allow interrupting
    setTimeout(() => {
        isPlaying = false;
    }, 500);
}

// Show caption for the letter
function showCaption(letter) {
    const text = captions[letter] || `Letter ${letter.toUpperCase()}`;
    
    // Split the caption to get just the sentence part (after the dash)
    const parts = text.split(' - ');
    const letterPart = parts[0] || letter.toUpperCase();
    const sentencePart = parts[1] || text;
    
    // Display the sentence part
    captionSentence.innerHTML = sentencePart;
    
    // Remove any existing scrolling class
    captionSentence.classList.remove('scrolling');
    
    // Check if text overflows and add scrolling if needed
    setTimeout(() => {
        const containerWidth = captionSentence.parentElement.offsetWidth;
        const textWidth = captionSentence.scrollWidth;
        
        if (textWidth > containerWidth) {
            captionSentence.classList.add('scrolling');
        }
    }, 100);
    
    // Trigger animation by removing and re-adding
    captionSentence.style.animation = 'none';
    setTimeout(() => {
        captionSentence.style.animation = '';
    }, 10);
}

// Initialize
console.log('Starting alphabet game...');
setupKeyboardListeners();
console.log('Keyboard listeners set up. Press any letter key!');