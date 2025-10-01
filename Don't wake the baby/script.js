class BabyGame {
    constructor() {
        this.audioContext = null;
        this.analyser = null;
        this.microphone = null;
        this.dataArray = null;
        this.animationFrame = null;
        
        this.gameState = 'sleeping'; // sleeping, warning, angry
        this.previousState = 'sleeping';
        this.stateTimer = null;
        this.stateStartTime = 0;
        this.currentVolume = 0;
        this.volumeThreshold = {
            warning: 25,   // 25% of volume meter
            danger: 40     // 40% of volume meter
        };
        
        this.elements = {
            babyImage: document.getElementById('baby-image'),
            gameText: document.getElementById('game-text'),
            volumeBar: document.getElementById('volume-bar'),
            startButton: document.getElementById('start-button'),
            errorMessage: document.getElementById('error-message'),
            lullabyAudio: document.getElementById('lullaby-audio'),
            screamAudio: document.getElementById('scream-audio'),
            shhAudio: document.getElementById('shh-audio')
        };
        
        this.images = {
            sleeping: 'images/closedeyes.jpg',
            warning: 'images/openeyes.jpg',
            angry: 'images/redeyes.jpg'
        };
        
        this.texts = {
            sleeping: "Don't wake the baby",
            warning: "Warning: Don't get any louder",
            angry: "WAAAHHHHH! YOU WOKE THE BABY!"
        };
        
        this.init();
    }
    
    init() {
        this.elements.startButton.addEventListener('click', () => this.startGame());
        this.preloadImages();
        this.initAudioElements();
    }
    
    initAudioElements() {
        // Set up audio elements
        this.elements.lullabyAudio.volume = 0.5;
        this.elements.screamAudio.volume = 0.7;
        this.elements.shhAudio.volume = 0.6;
        
        // Handle scream audio end event
        this.elements.screamAudio.addEventListener('ended', () => {
            this.playLullaby();
        });
        
        // Handle shh audio end event
        this.elements.shhAudio.addEventListener('ended', () => {
            this.playLullaby();
        });
    }
    
    playLullaby() {
        try {
            this.elements.screamAudio.pause();
            this.elements.screamAudio.currentTime = 0;
            this.elements.shhAudio.pause();
            this.elements.shhAudio.currentTime = 0;
            this.elements.lullabyAudio.volume = 0.5; // Restore full volume
            this.elements.lullabyAudio.play();
        } catch (error) {
            console.log('Could not play lullaby:', error);
        }
    }
    
    playShh() {
        try {
            // Lower lullaby volume but keep it playing
            this.elements.lullabyAudio.volume = 0.2;
            this.elements.screamAudio.pause();
            this.elements.screamAudio.currentTime = 0;
            this.elements.shhAudio.currentTime = 0;
            this.elements.shhAudio.play();
        } catch (error) {
            console.log('Could not play shh:', error);
        }
    }
    
    playScream() {
        try {
            // Lower lullaby volume but keep it playing
            this.elements.lullabyAudio.volume = 0.1;
            this.elements.shhAudio.pause();
            this.elements.shhAudio.currentTime = 0;
            this.elements.screamAudio.currentTime = 0;
            this.elements.screamAudio.play();
        } catch (error) {
            console.log('Could not play scream:', error);
        }
    }
    
    stopAllAudio() {
        this.elements.lullabyAudio.pause();
        this.elements.screamAudio.pause();
        this.elements.shhAudio.pause();
    }
    
    preloadImages() {
        // Preload all images for smooth transitions
        Object.values(this.images).forEach(src => {
            const img = new Image();
            img.src = src;
        });
    }
    
    addPageGlitchEffects() {
        const body = document.body;
        const gameContainer = document.querySelector('.game-container');
        
        // Add glitch classes
        body.classList.add('glitch-mode');
        gameContainer.classList.add('glitch-container');
        
        // Create random glitch intervals
        const glitchInterval = setInterval(() => {
            if (!body.classList.contains('glitch-mode')) {
                clearInterval(glitchInterval);
                return;
            }
            
            // Random glitch effects
            const effects = ['glitch-shift', 'glitch-distort'];
            const randomEffect = effects[Math.floor(Math.random() * effects.length)];
            
            body.classList.add(randomEffect);
            
            setTimeout(() => {
                body.classList.remove(randomEffect);
            }, 100 + Math.random() * 200);
            
        }, 300 + Math.random() * 500);
        
        // Store interval for cleanup
        this.glitchInterval = glitchInterval;
    }
    
    removePageGlitchEffects() {
        const body = document.body;
        const gameContainer = document.querySelector('.game-container');
        
        // Remove all glitch classes
        body.classList.remove('glitch-mode', 'glitch-flicker', 'glitch-shift', 'glitch-distort');
        gameContainer.classList.remove('glitch-container');
        
        // Clear interval
        if (this.glitchInterval) {
            clearInterval(this.glitchInterval);
            this.glitchInterval = null;
        }
    }
    
    async startGame() {
        try {
            this.elements.startButton.disabled = true;
            this.elements.startButton.textContent = 'Starting...';
            this.hideError();
            
            await this.initAudio();
            this.startVolumeDetection();
            
            // Start playing lullaby
            this.playLullaby();
            
            this.elements.startButton.style.display = 'none';
        } catch (error) {
            this.showError('Could not access microphone. Please allow microphone access and try again.');
            this.elements.startButton.disabled = false;
            this.elements.startButton.textContent = 'Start Game';
        }
    }
    
    async initAudio() {
        // Get user media (microphone access)
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Create audio context and analyser
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.analyser = this.audioContext.createAnalyser();
        this.microphone = this.audioContext.createMediaStreamSource(stream);
        
        // Configure analyser
        this.analyser.fftSize = 256;
        this.analyser.smoothingTimeConstant = 0.8;
        
        // Connect microphone to analyser
        this.microphone.connect(this.analyser);
        
        // Create data array for frequency data
        this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    }
    
    startVolumeDetection() {
        const detectVolume = () => {
            // Get frequency data
            this.analyser.getByteFrequencyData(this.dataArray);
            
            // Calculate average volume
            let sum = 0;
            for (let i = 0; i < this.dataArray.length; i++) {
                sum += this.dataArray[i];
            }
            const average = sum / this.dataArray.length;
            
            // Convert to percentage (0-100)
            const volumePercent = (average / 255) * 100;
            this.currentVolume = volumePercent;
            
            // Update volume meter
            this.updateVolumeMeter(volumePercent);
            
            // Update game state based on volume with timing logic
            this.updateGameStateWithTiming(volumePercent);
            
            // Continue animation loop
            this.animationFrame = requestAnimationFrame(detectVolume);
        };
        
        detectVolume();
    }
    
    updateVolumeMeter(volumePercent) {
        // Clamp volume to 0-100
        const clampedVolume = Math.max(0, Math.min(100, volumePercent));
        this.elements.volumeBar.style.width = `${clampedVolume}%`;
    }
    
    updateGameStateWithTiming(volumePercent) {
        const naturalState = this.determineGameState(volumePercent);
        const currentTime = Date.now();
        
        // If we're in a timed state, check if we can transition
        if (this.stateTimer) {
            const timeInState = currentTime - this.stateStartTime;
            
            // Check if we should upgrade to a higher alert state
            if (naturalState === 'angry' && this.gameState !== 'angry') {
                this.changeGameState('angry', currentTime);
            } else if (naturalState === 'warning' && this.gameState === 'sleeping') {
                this.changeGameState('warning', currentTime);
            }
            // Check if minimum time has passed and we can return to natural state
            else if (this.gameState === 'warning' && timeInState >= 2000 && naturalState === 'sleeping') {
                this.changeGameState('sleeping', currentTime);
            } else if (this.gameState === 'angry' && timeInState >= 2000 && (naturalState === 'sleeping' || naturalState === 'warning')) {
                this.changeGameState(naturalState, currentTime);
            }
        } else {
            // No timer active, change state normally
            if (naturalState !== this.gameState) {
                this.changeGameState(naturalState, currentTime);
            }
        }
    }
    
    changeGameState(newState, currentTime) {
        // Clear existing timer
        if (this.stateTimer) {
            clearTimeout(this.stateTimer);
            this.stateTimer = null;
        }
        
        this.previousState = this.gameState;
        this.gameState = newState;
        this.stateStartTime = currentTime;
        
        // Handle audio for state changes
        if (newState === 'angry' && this.previousState !== 'angry') {
            this.playScream();
        } else if (newState === 'warning' && this.previousState !== 'warning') {
            this.playShh();
        }
        
        this.updateUI();
        
        // Set timer for minimum state duration
        if (newState === 'warning') {
            this.stateTimer = setTimeout(() => {
                this.stateTimer = null;
                // Check if we should return to sleeping state
                if (this.determineGameState(this.currentVolume) === 'sleeping') {
                    this.changeGameState('sleeping', Date.now());
                }
            }, 2000);
        } else if (newState === 'angry') {
            this.stateTimer = setTimeout(() => {
                this.stateTimer = null;
                // Return to appropriate state based on current volume
                const naturalState = this.determineGameState(this.currentVolume);
                this.changeGameState(naturalState, Date.now());
            }, 2000);
        }
    }
    
    determineGameState(volumePercent) {
        if (volumePercent >= this.volumeThreshold.danger) {
            return 'angry';
        } else if (volumePercent >= this.volumeThreshold.warning) {
            return 'warning';
        } else {
            return 'sleeping';
        }
    }
    
    updateUI() {
        // Update image
        this.elements.babyImage.src = this.images[this.gameState];
        
        // Update text
        this.elements.gameText.textContent = this.texts[this.gameState];
        
        // Remove all state classes
        this.elements.babyImage.classList.remove('shake', 'large');
        this.elements.gameText.classList.remove('warning-text');
        
        // Remove glitch effects if not angry
        if (this.gameState !== 'angry') {
            this.removePageGlitchEffects();
        }
        
        // Apply state-specific styling
        switch (this.gameState) {
            case 'warning':
                this.elements.gameText.classList.add('warning-text');
                break;
                
            case 'angry':
                this.elements.babyImage.classList.add('shake', 'large');
                this.elements.gameText.classList.add('warning-text');
                // Add screen shake and glitch effects
                this.shakeScreen();
                this.addPageGlitchEffects();
                break;
        }
    }
    
    shakeScreen() {
        // Add a subtle screen shake when baby is angry
        document.body.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            document.body.style.animation = '';
        }, 500);
    }
    
    showError(message) {
        this.elements.errorMessage.textContent = message;
        this.elements.errorMessage.style.display = 'block';
    }
    
    hideError() {
        this.elements.errorMessage.style.display = 'none';
    }
    
    stopGame() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        
        if (this.stateTimer) {
            clearTimeout(this.stateTimer);
            this.stateTimer = null;
        }
        
        this.stopAllAudio();
        this.removePageGlitchEffects();
        
        if (this.audioContext) {
            this.audioContext.close();
        }
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new BabyGame();
});

// Handle page visibility changes (pause when tab is not visible)
document.addEventListener('visibilitychange', () => {
    if (document.hidden && window.babyGame) {
        // Could pause the game here if needed
    }
});