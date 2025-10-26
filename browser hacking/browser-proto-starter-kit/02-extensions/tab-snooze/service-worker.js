/*
 * Tab Snooze Extension - Service Worker
 *
 * This file handles:
 * - Creating context menu items for snoozing tabs
 * - Storing snoozed tab data with chrome.storage
 * - Setting up chrome.alarms to reopen tabs later
 * - Updating the badge count to show snoozed tabs
 * - Listening for alarm triggers to wake up tabs
 */

// Storage key for snoozed tabs
const STORAGE_KEY = "snoozedTabs";

// Initialize extension when it starts
chrome.runtime.onInstalled.addListener(() => {
  // Create context menu items for snoozing tabs
  chrome.contextMenus.create({
    id: "snooze-15-seconds",
    title: "Snooze tab → 15 seconds (test)",
    contexts: ["page"],
  });

  chrome.contextMenus.create({
    id: "snooze-today-6pm",
    title: "Snooze tab → Today 6 PM",
    contexts: ["page"],
  });

  chrome.contextMenus.create({
    id: "snooze-tomorrow-9am",
    title: "Snooze tab → Tomorrow 9 AM",
    contexts: ["page"],
  });

  chrome.contextMenus.create({
    id: "snooze-next-week",
    title: "Snooze tab → Next Week",
    contexts: ["page"],
  });

  // Update badge count on startup
  updateBadgeCount();
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId.startsWith("snooze-")) {
    await snoozeTab(tab, info.menuItemId);
  }
});

// Handle messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getSnoozedTabs") {
    getSnoozedTabs().then(sendResponse);
    return true; // Keep message channel open for async response
  }

  if (request.action === "wakeTab") {
    wakeTab(request.tabId).then(() => {
      sendResponse({ success: true });
    });
    return true;
  }
});

// Handle alarm triggers (when it's time to wake up a tab)
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name.startsWith("snooze-")) {
    const tabId = alarm.name.replace("snooze-", "");
    await wakeTab(tabId);
  }
});

// Main function to snooze a tab
async function snoozeTab(tab, snoozeType) {
  try {
    // Calculate wake time based on snooze type
    const wakeTime = calculateWakeTime(snoozeType);

    // Generate unique ID for this snoozed tab
    const tabId = Date.now().toString();

    // Create snoozed tab object
    const snoozedTab = {
      id: tabId,
      url: tab.url,
      title: tab.title,
      snoozeTime: Date.now(),
      wakeTime: wakeTime,
      alarmName: `snooze-${tabId}`,
    };

    // Store the snoozed tab
    const existingTabs = await getSnoozedTabs();
    existingTabs[tabId] = snoozedTab;
    await chrome.storage.local.set({ [STORAGE_KEY]: existingTabs });

    // Set up alarm to wake the tab
    chrome.alarms.create(`snooze-${tabId}`, {
      when: wakeTime,
    });

    // Close the current tab
    await chrome.tabs.remove(tab.id);

    // Update badge count
    await updateBadgeCount();

    console.log(`Tab snoozed: ${tab.title} until ${new Date(wakeTime)}`);
  } catch (error) {
    console.error("Failed to snooze tab:", error);
  }
}

// Calculate when to wake up the tab based on snooze option
function calculateWakeTime(snoozeType) {
  const now = new Date();

  switch (snoozeType) {
    case "snooze-15-seconds":
      // 15 seconds from now (for testing)
      return now.getTime() + 15 * 1000;

    case "snooze-today-6pm":
      const today6pm = new Date(now);
      today6pm.setHours(18, 0, 0, 0); // 6:00 PM today
      // If it's already past 6 PM, schedule for tomorrow 6 PM
      if (today6pm <= now) {
        today6pm.setDate(today6pm.getDate() + 1);
      }
      return today6pm.getTime();

    case "snooze-tomorrow-9am":
      const tomorrow9am = new Date(now);
      tomorrow9am.setDate(tomorrow9am.getDate() + 1);
      tomorrow9am.setHours(9, 0, 0, 0); // 9:00 AM tomorrow
      return tomorrow9am.getTime();

    case "snooze-next-week":
      const nextWeek = new Date(now);
      nextWeek.setDate(nextWeek.getDate() + 7);
      nextWeek.setHours(9, 0, 0, 0); // 9:00 AM next week
      return nextWeek.getTime();

    default:
      // Default to 1 hour from now
      return now.getTime() + 60 * 60 * 1000;
  }
}

// Get all snoozed tabs from storage
async function getSnoozedTabs() {
  const result = await chrome.storage.local.get([STORAGE_KEY]);
  return result[STORAGE_KEY] || {};
}

// Wake up a snoozed tab (reopen it)
async function wakeTab(tabId) {
  try {
    const snoozedTabs = await getSnoozedTabs();
    const snoozedTab = snoozedTabs[tabId];

    if (!snoozedTab) {
      console.warn(`No snoozed tab found with ID: ${tabId}`);
      return;
    }

    // Create new tab with the snoozed URL
    await chrome.tabs.create({
      url: snoozedTab.url,
      active: true,
    });

    // Remove from storage
    delete snoozedTabs[tabId];
    await chrome.storage.local.set({ [STORAGE_KEY]: snoozedTabs });

    // Clear the alarm
    await chrome.alarms.clear(snoozedTab.alarmName);

    // Update badge count
    await updateBadgeCount();

    console.log(`Tab woken up: ${snoozedTab.title}`);
  } catch (error) {
    console.error("Failed to wake tab:", error);
  }
}

// Update the badge count to show number of snoozed tabs
async function updateBadgeCount() {
  try {
    const snoozedTabs = await getSnoozedTabs();
    const count = Object.keys(snoozedTabs).length;

    if (count > 0) {
      await chrome.action.setBadgeText({ text: count.toString() });
      await chrome.action.setBadgeBackgroundColor({ color: "#4285f4" });
    } else {
      await chrome.action.setBadgeText({ text: "" });
    }
  } catch (error) {
    console.error("Failed to update badge count:", error);
  }
}
