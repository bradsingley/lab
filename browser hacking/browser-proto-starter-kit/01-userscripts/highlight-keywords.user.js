// ==UserScript==
// @name         Keyword Highlighter - AI & Browser
// @version      1.0
// @description  Automatically highlights "AI" and "browser" keywords on any webpage with toggle functionality
// @match        *://*/*
// @grant        none
// ==/UserScript==

/*
 * The ".user.js" extension tells Tampermonkey that this is a userscript.
 * Tampermonkey automatically detects and offers to install files with this extension.
 */

(function () {
  "use strict";

  // Configuration
  const KEYWORDS = ["AI", "browser"];
  const HIGHLIGHT_CLASS = "keyword-highlight-extension";
  let highlightsEnabled = true;

  // CSS styles for highlighting
  const highlightCSS = `
        .${HIGHLIGHT_CLASS} {
            background-color: #ffff00 !important;
            color: #000000 !important;
            font-weight: bold !important;
            padding: 1px 2px !important;
            border-radius: 2px !important;
        }
        
        .${HIGHLIGHT_CLASS}-disabled {
            background-color: transparent !important;
            color: inherit !important;
            font-weight: inherit !important;
            padding: 0 !important;
            border-radius: 0 !important;
        }
    `;

  // Add CSS to the page
  function addStyles() {
    if (!document.getElementById("keyword-highlighter-styles")) {
      const style = document.createElement("style");
      style.id = "keyword-highlighter-styles";
      style.textContent = highlightCSS;
      document.head.appendChild(style);
    }
  }

  // Create regex pattern for keywords (case-insensitive, whole words only)
  function createKeywordRegex() {
    const pattern = KEYWORDS.map((keyword) => `\\b${keyword}\\b`).join("|");
    return new RegExp(`(${pattern})`, "gi");
  }

  // Highlight keywords in text nodes
  function highlightKeywords(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent;
      const regex = createKeywordRegex();

      if (regex.test(text)) {
        const highlightedHTML = text.replace(
          regex,
          `<span class="${HIGHLIGHT_CLASS}">$1</span>`
        );
        const wrapper = document.createElement("div");
        wrapper.innerHTML = highlightedHTML;

        // Replace the text node with highlighted content
        const fragment = document.createDocumentFragment();
        while (wrapper.firstChild) {
          fragment.appendChild(wrapper.firstChild);
        }
        node.parentNode.replaceChild(fragment, node);
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      // Skip script, style, and already highlighted elements
      if (
        !["SCRIPT", "STYLE", "NOSCRIPT"].includes(node.tagName) &&
        !node.classList.contains(HIGHLIGHT_CLASS)
      ) {
        // Process child nodes (create a copy to avoid live NodeList issues)
        const children = Array.from(node.childNodes);
        children.forEach((child) => highlightKeywords(child));
      }
    }
  }

  // Toggle highlights on/off
  function toggleHighlights() {
    highlightsEnabled = !highlightsEnabled;
    const highlights = document.querySelectorAll(`.${HIGHLIGHT_CLASS}`);

    highlights.forEach((highlight) => {
      if (highlightsEnabled) {
        highlight.classList.remove(`${HIGHLIGHT_CLASS}-disabled`);
      } else {
        highlight.classList.add(`${HIGHLIGHT_CLASS}-disabled`);
      }
    });

    // Show status message
    showStatusMessage(
      `Highlights ${highlightsEnabled ? "enabled" : "disabled"}`
    );
  }

  // Show temporary status message
  function showStatusMessage(message) {
    // Remove existing message if present
    const existing = document.getElementById("highlight-status-message");
    if (existing) {
      existing.remove();
    }

    const statusDiv = document.createElement("div");
    statusDiv.id = "highlight-status-message";
    statusDiv.textContent = message;
    statusDiv.style.cssText = `
            position: fixed !important;
            top: 20px !important;
            right: 20px !important;
            background: #333 !important;
            color: white !important;
            padding: 10px 15px !important;
            border-radius: 5px !important;
            z-index: 10000 !important;
            font-family: Arial, sans-serif !important;
            font-size: 14px !important;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3) !important;
        `;

    document.body.appendChild(statusDiv);

    // Remove after 2 seconds
    setTimeout(() => {
      if (statusDiv.parentNode) {
        statusDiv.remove();
      }
    }, 2000);
  }

  // Initialize the script
  function init() {
    addStyles();

    // Highlight keywords in the current page
    highlightKeywords(document.body);

    // Set up keyboard shortcut (Alt+H)
    document.addEventListener("keydown", function (event) {
      if (event.altKey && (event.key === "h" || event.key === "H")) {
        event.preventDefault();
        toggleHighlights();
      }
    });

    // Watch for dynamically added content
    const observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        mutation.addedNodes.forEach(function (node) {
          if (
            node.nodeType === Node.ELEMENT_NODE ||
            node.nodeType === Node.TEXT_NODE
          ) {
            highlightKeywords(node);
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    console.log(
      "Keyword Highlighter loaded! Press Alt+H to toggle highlights."
    );
  }

  // Wait for page to be ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

/*
 * HOW TO TEST THIS USERSCRIPT:
 *
 * 1. Install Tampermonkey extension in your browser:
 *    - Chrome: https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo
 *    - Firefox: https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/
 *
 * 2. Copy this entire file content
 *
 * 3. Open Tampermonkey dashboard (click the extension icon → Dashboard)
 *
 * 4. Click "Create a new script" or the "+" tab
 *
 * 5. Replace the default content with this script and save (Ctrl+S)
 *
 * 6. Visit any webpage that contains the words "AI" or "browser"
 *
 * 7. The keywords should be automatically highlighted in yellow
 *
 * 8. Press Alt+H to toggle the highlights on and off
 *
 * 9. Test sites to try:
 *    - https://en.wikipedia.org/wiki/Artificial_intelligence
 *    - https://www.mozilla.org/en-US/firefox/browsers/
 *    - Any tech news site or documentation
 *
 * TROUBLESHOOTING:
 * - If highlights don't appear, check the browser console (F12) for errors
 * - Make sure Tampermonkey is enabled and the script is active
 * - The script runs on all websites due to the match pattern
 * - Keywords are case-insensitive and match whole words only
 */
