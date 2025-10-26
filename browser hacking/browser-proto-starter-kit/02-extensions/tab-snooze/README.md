# Tab Snooze Extension

A Chrome/Edge Manifest V3 extension that lets you snooze tabs and reopen them later automatically.

## HOW TO TEST:

1. `edge://extensions` → Developer mode → Load unpacked → select this folder
2. Pin the icon → right-click any page → Snooze tab
3. Wait or click "Wake Now" in popup to reopen the tab

## Features

🕒 **Snooze Options:**

- Today 6 PM
- Tomorrow 9 AM
- Next Week

📱 **Smart Interface:**

- Right-click context menu for snoozing
- Badge count shows number of snoozed tabs
- Popup lists all snoozed tabs with wake times
- "Wake Now" button for immediate reopening

⚡ **Automatic Wake-up:**

- Uses `chrome.alarms` API for reliable scheduling
- Reopens tabs in new window/tab automatically
- Persists across browser restarts

## Files

- **`manifest.json`** → MV3 configuration with required permissions
- **`service-worker.js`** → Handles alarms, storage, context menus, and tab reopening
- **`popup.html`** → Shows snoozed tabs list with wake times
- **`popup.js`** → Popup interaction logic and wake-now functionality

## Chrome APIs Used

- `chrome.contextMenus` → Right-click "Snooze tab" options
- `chrome.storage.local` → Persist snoozed tab data
- `chrome.alarms` → Schedule automatic tab reopening
- `chrome.tabs` → Close/create tabs
- `chrome.action` → Badge count display

## Privacy

- No external network requests
- All data stored locally in browser
- No tracking or analytics
