// Popup script for Brickout extension

const toggleButton = document.getElementById('toggleGame');
const status = document.getElementById('status');
const targetTextRadio = document.getElementById('targetText');
const targetImagesRadio = document.getElementById('targetImages');

let isActive = false;

// Load saved settings
chrome.storage.sync.get(['targetMode'], (result) => {
  const mode = result.targetMode || 'text';
  if (mode === 'images') {
    targetImagesRadio.checked = true;
  } else {
    targetTextRadio.checked = true;
  }
});

// Save settings when changed
targetTextRadio.addEventListener('change', () => {
  if (targetTextRadio.checked) {
    chrome.storage.sync.set({ targetMode: 'text' });
  }
});

targetImagesRadio.addEventListener('change', () => {
  if (targetImagesRadio.checked) {
    chrome.storage.sync.set({ targetMode: 'images' });
  }
});

toggleButton.addEventListener('click', async () => {
  console.log('Button clicked!');
  
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  console.log('Tab:', tab);
  
  const mode = targetTextRadio.checked ? 'text' : 'images';
  console.log('Mode:', mode);
  
  status.textContent = 'Starting...';
  status.style.background = 'rgba(255,255,255,0.3)';
  
  try {
    // Check if already active and just toggle off
    if (isActive) {
      const toggleResults = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: toggleGame,
        args: [mode]
      });
      
      if (toggleResults && toggleResults[0]) {
        isActive = toggleResults[0].result.active;
        updateUI();
      }
      return;
    }
    
    // Inject CSS first
    try {
      await chrome.scripting.insertCSS({
        target: { tabId: tab.id },
        files: ['content.css']
      });
    } catch (e) {
      // Already injected, ignore
    }
    
    // Inject the game script
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    });
    
    // Wait a bit for script to load
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Toggle the game on
    const toggleResults = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: toggleGame,
      args: [mode]
    });
    
    console.log('Toggle results:', toggleResults);
    
    if (toggleResults && toggleResults[0]) {
      const result = toggleResults[0].result;
      console.log('Result:', result);
      
      if (result && result.active !== undefined) {
        isActive = result.active;
        updateUI();
        
        // Close popup after starting game
        if (isActive) {
          setTimeout(() => window.close(), 100);
        }
      } else {
        status.textContent = 'Error: Invalid response from game';
        status.style.background = 'rgba(255,0,0,0.3)';
      }
    } else {
      status.textContent = 'Error: No response from page';
      status.style.background = 'rgba(255,0,0,0.3)';
    }
    
  } catch (error) {
    console.error('Error:', error);
    status.textContent = `Error: ${error.message}`;
    status.style.background = 'rgba(255,0,0,0.3)';
  }
});

// Function that runs in the page context
function toggleGame(targetMode) {
  // This runs in the page context
  if (typeof window.brickoutToggle === 'function') {
    return window.brickoutToggle(targetMode);
  }
  return { active: false, error: 'Game not initialized' };
}

function updateUI() {
  const mode = targetTextRadio.checked ? 'text' : 'images';
  
  if (isActive) {
    toggleButton.textContent = 'Stop Game';
    toggleButton.style.background = '#ff6b6b';
    toggleButton.style.color = 'white';
    status.textContent = `✓ Targeting ${mode}`;
    status.style.background = 'rgba(76,175,80,0.3)';
  } else {
    toggleButton.textContent = 'Start Game';
    toggleButton.style.background = 'white';
    toggleButton.style.color = '#667eea';
    status.textContent = 'Game Inactive';
    status.style.background = 'rgba(255,255,255,0.2)';
  }
}

// Initialize UI
updateUI();
