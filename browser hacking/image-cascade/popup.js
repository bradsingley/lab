const toggleSwitch = document.getElementById('toggleSwitch');
const status = document.getElementById('status');

// Load the current state
chrome.storage.sync.get(['enabled'], function(result) {
  const isEnabled = result.enabled !== false; // Default to true
  toggleSwitch.checked = isEnabled;
  updateStatus(isEnabled);
});

// Handle toggle changes
toggleSwitch.addEventListener('change', function() {
  const isEnabled = toggleSwitch.checked;
  chrome.storage.sync.set({ enabled: isEnabled }, function() {
    updateStatus(isEnabled);
  });
});

function updateStatus(isEnabled) {
  status.textContent = isEnabled ? 'Effect is active' : 'Effect is disabled';
  status.style.color = isEnabled ? '#2196F3' : '#999';
}
