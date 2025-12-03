document.addEventListener('DOMContentLoaded', function() {
  const toggle = document.getElementById('enableToggle');
  const status = document.getElementById('status');
  
  // Load current state
  chrome.storage.sync.get(['fontSleuthEnabled'], function(result) {
    const isEnabled = result.fontSleuthEnabled !== false; // Default to true
    toggle.checked = isEnabled;
    updateStatus(isEnabled);
  });
  
  // Handle toggle change
  toggle.addEventListener('change', function() {
    const isEnabled = toggle.checked;
    
    chrome.storage.sync.set({
      fontSleuthEnabled: isEnabled
    }, function() {
      updateStatus(isEnabled);
    });
  });
  
  function updateStatus(isEnabled) {
    if (isEnabled) {
      status.textContent = 'Extension is active';
      status.className = 'status enabled';
    } else {
      status.textContent = 'Extension is disabled';
      status.className = 'status disabled';
    }
  }
});