/*
 * Tab Snooze Popup Script
 *
 * This script handles:
 * - Loading and displaying snoozed tabs from storage
 * - Formatting wake times in a user-friendly way
 * - Handling "Wake Now" button clicks
 * - Refreshing the list when tabs are woken up
 */

document.addEventListener("DOMContentLoaded", () => {
  const loadingDiv = document.getElementById("loading");
  const emptyStateDiv = document.getElementById("empty-state");
  const tabsList = document.getElementById("tabs-list");
  const refreshBtn = document.getElementById("refresh-btn");

  // Load snoozed tabs when popup opens
  loadSnoozedTabs();

  // Handle refresh button click
  refreshBtn.addEventListener("click", loadSnoozedTabs);

  // Load and display snoozed tabs
  async function loadSnoozedTabs() {
    try {
      loadingDiv.style.display = "block";
      emptyStateDiv.style.display = "none";
      tabsList.innerHTML = "";
      refreshBtn.style.display = "none";

      // Get snoozed tabs from service worker
      const response = await chrome.runtime.sendMessage({
        action: "getSnoozedTabs",
      });
      const snoozedTabs = response || {};

      loadingDiv.style.display = "none";

      // Check if we have any snoozed tabs
      const tabIds = Object.keys(snoozedTabs);

      if (tabIds.length === 0) {
        emptyStateDiv.style.display = "block";
        return;
      }

      // Display each snoozed tab
      tabIds.forEach((tabId) => {
        const tab = snoozedTabs[tabId];
        const tabElement = createTabElement(tab);
        tabsList.appendChild(tabElement);
      });

      refreshBtn.style.display = "block";
    } catch (error) {
      console.error("Failed to load snoozed tabs:", error);
      loadingDiv.innerHTML = "Error loading tabs";
    }
  }

  // Create HTML element for a snoozed tab
  function createTabElement(tab) {
    const tabDiv = document.createElement("div");
    tabDiv.className = "tab-item";

    // Format the wake time
    const wakeTimeStr = formatWakeTime(tab.wakeTime);
    const timeUntilWake = getTimeUntilWake(tab.wakeTime);

    tabDiv.innerHTML = `
      <div class="tab-title">${escapeHtml(tab.title)}</div>
      <div class="tab-url">${escapeHtml(tab.url)}</div>
      <div class="tab-meta">
        <div class="wake-time">
          ${wakeTimeStr}
          <br>
          <span style="color: #5f6368; font-weight: normal;">${timeUntilWake}</span>
        </div>
        <button class="wake-btn" data-tab-id="${tab.id}">
          Wake Now
        </button>
      </div>
    `;

    // Add click handler for wake button
    const wakeBtn = tabDiv.querySelector(".wake-btn");
    wakeBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      await wakeTabNow(tab.id, wakeBtn);
    });

    return tabDiv;
  }

  // Wake up a tab immediately
  async function wakeTabNow(tabId, buttonElement) {
    try {
      buttonElement.disabled = true;
      buttonElement.textContent = "Waking...";

      // Send wake request to service worker
      await chrome.runtime.sendMessage({
        action: "wakeTab",
        tabId: tabId,
      });

      // Refresh the list after a short delay
      setTimeout(() => {
        loadSnoozedTabs();
      }, 500);
    } catch (error) {
      console.error("Failed to wake tab:", error);
      buttonElement.disabled = false;
      buttonElement.textContent = "Error";
    }
  }

  // Format wake time for display
  function formatWakeTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const wakeDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );

    const timeStr = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    if (wakeDate.getTime() === today.getTime()) {
      return `Today at ${timeStr}`;
    } else if (wakeDate.getTime() === tomorrow.getTime()) {
      return `Tomorrow at ${timeStr}`;
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }
  }

  // Get human-readable time until wake
  function getTimeUntilWake(timestamp) {
    const now = Date.now();
    const timeUntil = timestamp - now;

    if (timeUntil <= 0) {
      return "Ready to wake!";
    }

    const minutes = Math.floor(timeUntil / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `in ${days} day${days === 1 ? "" : "s"}`;
    } else if (hours > 0) {
      return `in ${hours} hour${hours === 1 ? "" : "s"}`;
    } else if (minutes > 0) {
      return `in ${minutes} minute${minutes === 1 ? "" : "s"}`;
    } else {
      return "in less than a minute";
    }
  }

  // Escape HTML to prevent XSS
  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
});
