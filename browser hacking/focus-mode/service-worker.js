// Focus Mode Extension - Service Worker
// Main background script for handling focus mode toggle

let focusState = {
  isActive: false,
  originalWindowId: null,
  focusWindowId: null,
  mutedTabIds: new Set(), // Track which tabs we muted (to restore later)
  discardedTabIds: new Set(), // Track which tabs we discarded
};

// chrome.runtime.onMessage API - Handle popup messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "toggle") {
    toggleFocusMode().then(() => {
      sendResponse({ success: true, isActive: focusState.isActive });
    });
    return true; // Keep message channel open for async response
  }

  if (request.action === "getState") {
    sendResponse({ isActive: focusState.isActive });
  }
});

async function toggleFocusMode() {
  if (focusState.isActive) {
    await exitFocusMode();
  } else {
    await enterFocusMode();
  }
}

async function enterFocusMode() {
  try {
    // chrome.tabs.query API - Get current active tab
    const [activeTab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (!activeTab) return;

    focusState.originalWindowId = activeTab.windowId;

    // chrome.windows.create API - Create new minimal window with just the active tab
    const focusWindow = await chrome.windows.create({
      tabId: activeTab.id, // Move existing tab to new window
      type: "normal",
      focused: true,
      state: "maximized",
    });

    focusState.focusWindowId = focusWindow.id;

    // chrome.tabs.query API - Get all remaining tabs in original window
    const remainingTabs = await chrome.tabs.query({
      windowId: focusState.originalWindowId,
    });

    // Process each remaining tab
    for (const tab of remainingTabs) {
      // chrome.tabs.update API - Mute tabs that aren't already muted
      if (!tab.mutedInfo?.muted) {
        await chrome.tabs.update(tab.id, { muted: true });
        focusState.mutedTabIds.add(tab.id);
      }

      // chrome.tabs.discard API - Discard inactive tabs to save memory
      if (!tab.active && !tab.discarded) {
        await chrome.tabs.discard(tab.id);
        focusState.discardedTabIds.add(tab.id);
      }
    }

    focusState.isActive = true;

    // chrome.action.setBadgeText API - Show visual indicator
    chrome.action.setBadgeText({ text: "F" });
    chrome.action.setBadgeBackgroundColor({ color: "#2196F3" });
  } catch (error) {
    console.error("Failed to enter focus mode:", error);
  }
}

async function exitFocusMode() {
  try {
    // chrome.tabs.query API - Get the focused tab
    const [focusTab] = await chrome.tabs.query({
      windowId: focusState.focusWindowId,
      active: true,
    });

    if (focusTab) {
      // chrome.tabs.move API - Move tab back to original window
      await chrome.tabs.move(focusTab.id, {
        windowId: focusState.originalWindowId,
        index: -1, // Append to end
      });

      // chrome.windows.update API - Focus the original window
      await chrome.windows.update(focusState.originalWindowId, {
        focused: true,
      });

      // chrome.tabs.update API - Make the returned tab active
      await chrome.tabs.update(focusTab.id, { active: true });
    }

    // chrome.windows.remove API - Close the focus window
    if (focusState.focusWindowId) {
      await chrome.windows.remove(focusState.focusWindowId);
    }

    // chrome.tabs.update API - Restore muted state for tabs we muted
    for (const tabId of focusState.mutedTabIds) {
      try {
        await chrome.tabs.update(tabId, { muted: false });
      } catch (error) {
        // Tab might have been closed, ignore error
      }
    }

    // Reset state
    focusState = {
      isActive: false,
      originalWindowId: null,
      focusWindowId: null,
      mutedTabIds: new Set(),
      discardedTabIds: new Set(),
    };

    // chrome.action.setBadgeText API - Clear badge
    chrome.action.setBadgeText({ text: "" });
  } catch (error) {
    console.error("Failed to exit focus mode:", error);
  }
}

// chrome.windows.onRemoved API - Handle manual focus window closure
chrome.windows.onRemoved.addListener((windowId) => {
  if (windowId === focusState.focusWindowId && focusState.isActive) {
    // User closed focus window manually, reset state
    focusState.isActive = false;
    focusState.focusWindowId = null;
    chrome.action.setBadgeText({ text: "" });
  }
});
