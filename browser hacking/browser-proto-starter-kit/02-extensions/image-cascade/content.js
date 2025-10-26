(function () {
  "use strict";

  let isEnabled = true;

  // Check if extension is enabled
  chrome.storage.sync.get(['enabled'], function(result) {
    isEnabled = result.enabled !== false; // Default to true
    if (isEnabled) {
      initializeExtension();
    }
  });

  // Listen for changes to enabled state
  chrome.storage.onChanged.addListener(function(changes, namespace) {
    if (changes.enabled) {
      isEnabled = changes.enabled.newValue;
      if (isEnabled) {
        initializeExtension();
      } else {
        disableExtension();
      }
    }
  });

  function initializeExtension() {
    // Get all images on the page
    const images = document.querySelectorAll("img");

    images.forEach((img) => {
      // Skip if image is too small
      if (img.width < 50 || img.height < 50) return;

      // Add black outline to all images
      img.style.outline = "1px solid black";

      // Remove existing listener if any
      img.removeEventListener("mouseenter", img._cascadeHandler);
      
      // Create and store handler
      img._cascadeHandler = (e) => {
        if (isEnabled) {
          cascadeImage(img);
        }
      };

      img.addEventListener("mouseenter", img._cascadeHandler);
    });
  }

  function disableExtension() {
    const images = document.querySelectorAll("img");
    images.forEach((img) => {
      img.style.outline = "";
      if (img._cascadeHandler) {
        img.removeEventListener("mouseenter", img._cascadeHandler);
      }
    });
  }

  function cascadeImage(img) {
    // Get the image's starting position
    const rect = img.getBoundingClientRect();
    let x = rect.left;
    let y = rect.top;

    // Random horizontal velocity
    let vx = (Math.random() - 0.5) * 10;
    // Initial upward velocity (negative for upward motion)
    let vy = -8 - Math.random() * 4;

    // Gravity and bounce dampening
    const gravity = 0.5;
    const bounce = 0.7;
    const friction = 0.98;

    let lastTrailTime = Date.now();
    const trailInterval = 30; // Create trail copy every 30ms

    function animate() {
      // Apply gravity
      vy += gravity;

      // Update position
      x += vx;
      y += vy;

      // Bounce off bottom
      if (y + img.height >= window.innerHeight) {
        y = window.innerHeight - img.height;
        vy = -vy * bounce;
        vx *= friction;
      }

      // Bounce off sides
      if (x <= 0 || x + img.width >= window.innerWidth) {
        x = x <= 0 ? 0 : window.innerWidth - img.width;
        vx = -vx * bounce;
      }

      // Create trail copies at intervals
      const now = Date.now();
      if (now - lastTrailTime >= trailInterval) {
        createTrailCopy(img, x, y);
        lastTrailTime = now;
      }

      // Continue animation if still moving significantly
      if (Math.abs(vy) > 0.5 || Math.abs(vx) > 0.5) {
        requestAnimationFrame(animate);
      }
    }

    animate();
  }

  function createTrailCopy(img, x, y) {
    // Clone the image and fix it in position
    const clone = img.cloneNode(true);
    clone.style.position = "fixed";
    clone.style.left = x + "px";
    clone.style.top = y + "px";
    clone.style.zIndex = "999999";
    clone.style.pointerEvents = "none";
    clone.style.opacity = "0.8";
    clone.style.outline = "1px solid black";

    document.body.appendChild(clone);

    // Optionally fade out and remove after some time
    setTimeout(() => {
      clone.style.transition = "opacity 1s";
      clone.style.opacity = "0";
      setTimeout(() => clone.remove(), 1000);
    }, 3000);
  }
})();
