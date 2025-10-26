// ==UserScript==
// @name         Bing Upsell Banner
// @version      1.0
// @description  Shows a banner on Google search suggesting Bing as an alternative
// @match        https://www.google.com/search*
// @match        https://google.com/search*
// @grant        none
// ==/UserScript==

/*
 * The ".user.js" extension tells Tampermonkey that this is a userscript.
 * This script shows a banner at the top of Google search pages promoting Bing.
 */

(function () {
  "use strict";

  // Check if banner already exists to avoid duplicates
  if (document.getElementById("bing-upsell-banner")) {
    return;
  }

  // Create the banner element
  function createBanner() {
    const banner = document.createElement("div");
    banner.id = "bing-upsell-banner";

    // Create the main container
    const container = document.createElement("div");
    container.style.cssText = `
      background: white;
      color: #5f6368;
      padding: 16px 20px;
      text-align: left;
      font-family: 'Google Sans', 'Segoe UI', Roboto, Arial, sans-serif;
      font-size: 14px;
      box-shadow: 0 2px 16px rgba(0,0,0,0.1);
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 10000;
      border-radius: 8px;
      border: 1px solid #dadce0;
      max-width: 400px;
      width: auto;
      display: flex;
      align-items: center;
      gap: 12px;
    `;

    // Create the text content
    const textContent = document.createElement("div");
    textContent.style.cssText = `
      flex: 1;
      line-height: 1.4;
    `;

    // Create the main text
    const mainText = document.createElement("div");
    mainText.style.cssText = `
      font-weight: 500;
      color: #3c4043;
      margin-bottom: 2px;
    `;
    mainText.textContent = "Try searching on Bing instead?";

    // Create the description text
    const descText = document.createElement("div");
    descText.style.cssText = `
      font-size: 13px;
      color: #5f6368;
    `;
    descText.textContent = "Get better results with Copilot";

    // Create the button container
    const buttonContainer = document.createElement("div");
    buttonContainer.style.cssText = `
      display: flex;
      gap: 8px;
      align-items: center;
      flex-shrink: 0;
    `;

    // Create the Bing link
    const bingLink = document.createElement("a");
    bingLink.href = `https://www.bing.com/search?q=${encodeURIComponent(
      getSearchQuery()
    )}`;
    bingLink.textContent = "Try Bing";
    bingLink.style.cssText = `
      background: #1a73e8;
      color: white;
      padding: 6px 16px;
      text-decoration: none;
      border-radius: 4px;
      font-size: 13px;
      font-weight: 500;
      transition: background 0.2s ease;
    `;
    bingLink.onmouseover = function () {
      this.style.background = "#1557b0";
    };
    bingLink.onmouseout = function () {
      this.style.background = "#1a73e8";
    };

    // Create the close button
    const closeButton = document.createElement("button");
    closeButton.innerHTML = "✕";
    closeButton.style.cssText = `
      background: none;
      border: none;
      color: #5f6368;
      padding: 4px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 14px;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s ease;
    `;
    closeButton.onmouseover = function () {
      this.style.background = "#f1f3f4";
    };
    closeButton.onmouseout = function () {
      this.style.background = "none";
    };
    closeButton.onclick = function () {
      banner.remove();
    };

    // Assemble the banner
    textContent.appendChild(mainText);
    textContent.appendChild(descText);
    buttonContainer.appendChild(bingLink);
    buttonContainer.appendChild(closeButton);

    container.appendChild(textContent);
    container.appendChild(buttonContainer);
    banner.appendChild(container);

    return banner;
  }

  // Extract the search query from the URL
  function getSearchQuery() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("q") || "";
  }

  // Insert banner at the top of the page
  function insertBanner() {
    const banner = createBanner();

    // Since it's position: fixed, just append to body
    document.body.appendChild(banner);
  }

  // Initialize the script
  function init() {
    // Only show banner on search results pages (not homepage)
    if (getSearchQuery()) {
      insertBanner();
      console.log("Bing upsell banner loaded on Google search page");
    }
  }

  // Wait for page to be ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // Handle navigation within Google (like clicking on different result pages)
  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      // Remove existing banner
      const existingBanner = document.getElementById("bing-upsell-banner");
      if (existingBanner) {
        existingBanner.remove();
      }
      // Add new banner if on search results
      setTimeout(init, 500); // Small delay to let page update
    }
  }).observe(document, { subtree: true, childList: true });
})();

/*
 * HOW TO TEST THIS USERSCRIPT:
 *
 * 1. Install Tampermonkey extension in your browser
 *
 * 2. Copy this script content and add it to Tampermonkey
 *
 * 3. Go to Google and search for anything:
 *    - https://www.google.com/search?q=test
 *    - https://www.google.com/search?q=javascript
 *
 * 4. You should see a blue banner at the top suggesting Bing
 *
 * 5. Click "Try Bing Instead" to go to Bing with the same search query
 *
 * 6. Click the "✕" button to dismiss the banner
 *
 * FEATURES:
 * - Only appears on Google search results pages (not the homepage)
 * - Transfers your search query to Bing automatically
 * - Professional Microsoft-style blue gradient design
 * - Dismissible with close button
 * - Handles navigation within Google search results
 * - Responsive hover effects
 */
