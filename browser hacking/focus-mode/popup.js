// Focus Mode Popup Script

document.addEventListener("DOMContentLoaded", () => {
  const statusDiv = document.getElementById("status");
  const toggleBtn = document.getElementById("toggleBtn");

  // Update UI on popup open
  updateUI();

  // Handle toggle button click
  toggleBtn.addEventListener("click", async () => {
    toggleBtn.disabled = true;
    toggleBtn.textContent = "Processing...";

    try {
      // chrome.runtime.sendMessage API - Send message to service worker
      const response = await chrome.runtime.sendMessage({ action: "toggle" });
      updateUI();
    } catch (error) {
      console.error("Toggle failed:", error);
      updateUI();
    }
  });

  async function updateUI() {
    try {
      // chrome.runtime.sendMessage API - Get current state from service worker
      const response = await chrome.runtime.sendMessage({ action: "getState" });
      const isActive = response?.isActive || false;

      if (isActive) {
        statusDiv.textContent = "Focus mode active";
        statusDiv.className = "status active";
        toggleBtn.textContent = "Exit Focus Mode";
        toggleBtn.className = "exit-btn";
      } else {
        statusDiv.textContent = "Focus mode inactive";
        statusDiv.className = "status inactive";
        toggleBtn.textContent = "Enter Focus Mode";
        toggleBtn.className = "enter-btn";
      }

      toggleBtn.disabled = false;
    } catch (error) {
      console.error("Failed to get state:", error);
      statusDiv.textContent = "Error connecting";
      toggleBtn.disabled = true;
    }
  }
});
