import { captions } from './captions.js';

// Configuration
const VIDEO_PATH = 'videos/';
// Only include letters that have video files
const availableVideos = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'n', 'o', 'p', 'q', 'r', 't', 'v', 'w', 'x', 'y', 'z', 'space'];
const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');

// DOM elements - will be set after DOM loads
let gameScreen, videoPlayer, captionLetter, captionSentence, hintText, splashImage, infoIcon, infoModal, closeModal;

// State
let isPlaying = false;

// Setup keyboard listeners
function setupKeyboardListeners() {
    const hiddenInput = document.getElementById('hiddenInput');
    
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
        // Check if it's spacebar
        else if (key === ' ' && !isPlaying) {
            playVideo('space');
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
    
    // Hide splash image and show video player on first play
    if (splashImage && !splashImage.classList.contains('hidden')) {
        splashImage.classList.add('hidden');
    }
    if (videoPlayer && !videoPlayer.classList.contains('active')) {
        videoPlayer.classList.add('active');
    }
    
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

// Show hint text on page load
function showHintText() {
    if (captionSentence && captions.hint) {
        captionSentence.innerHTML = captions.hint;
    }
    // Also show in the separate hint text element if it exists
    if (hintText) {
        hintText.classList.remove('hidden');
    }
}

// Show caption for the letter
function showCaption(letter) {
    const text = captions[letter] || `Letter ${letter.toUpperCase()}`;
    
    // Hide hint text and info icon on first interaction
    if (hintText) {
        hintText.classList.add('hidden');
    }
    if (infoIcon) {
        infoIcon.classList.add('hidden');
    }
    
    // Split the caption to get just the sentence part (after the dash)
    const parts = text.split(' - ');
    const letterPart = parts[0] || letter.toUpperCase();
    const sentencePart = parts[1] || text;
    
    // Display the capital letter in the letter field (blank for space)
    if (letter === 'space') {
        captionLetter.innerHTML = '&nbsp;'; // Blank space
    } else {
        captionLetter.innerHTML = letter.toUpperCase();
    }
    
    // Display the sentence part
    captionSentence.innerHTML = sentencePart;
    
    // Trigger animation by removing and re-adding
    captionSentence.style.animation = 'none';
    setTimeout(() => {
        captionSentence.style.animation = '';
    }, 10);
}

// Initialize
console.log('Starting alphabet game...');

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, setting up game...');

    // Set DOM elements
    gameScreen = document.getElementById('gameScreen');
    videoPlayer = document.getElementById('videoPlayer');
    splashImage = document.getElementById('splashImage');
    captionLetter = document.getElementById('captionLetter');
    captionSentence = document.getElementById('captionSentence');
    hintText = document.getElementById('hintText');
    infoIcon = document.getElementById('infoIcon');
    infoModal = document.getElementById('infoModal');
    closeModal = document.getElementById('closeModal');
    
    // Set up info modal
    if (infoIcon) {
        infoIcon.addEventListener('click', function(e) {
            e.stopPropagation();
            if (infoModal) {
                infoModal.classList.remove('hidden');
            }
        });
    }
    
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            if (infoModal) {
                infoModal.classList.add('hidden');
            }
        });
    }
    
    // Close modal when clicking outside
    if (infoModal) {
        infoModal.addEventListener('click', function(e) {
            if (e.target === infoModal) {
                infoModal.classList.add('hidden');
            }
        });
    }

    console.log('Elements found:', { gameScreen: !!gameScreen, videoPlayer: !!videoPlayer, captionLetter: !!captionLetter, captionSentence: !!captionSentence, hintText: !!hintText });

    if (!captionSentence) {
        console.error('captionSentence element not found!');
        return;
    }

    if (!videoPlayer) {
        console.error('videoPlayer element not found!');
        return;
    }

    // hintText is optional
    if (!hintText) {
        console.warn('hintText element not found, hint will show in caption only');
    }

    // Set up the game
    setupKeyboardListeners();
    showHintText();
    console.log('Game initialized. Press any letter key!');
});