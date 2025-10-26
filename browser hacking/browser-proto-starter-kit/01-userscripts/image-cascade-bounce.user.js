// ==UserScript==
// @name         Image cascade bounce
// @version      1.0
// @description  Makes images cascade and bounce like the retro solitaire win screen when hovered
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  // Get all images on the page
  const images = document.querySelectorAll("img");

  images.forEach((img) => {
    // Skip if image is too small
    if (img.width < 50 || img.height < 50) return;

    // Add black outline to all images
    img.style.outline = "1px solid black";

    img.addEventListener("mouseenter", (e) => {
      cascadeImage(img);
    });
  });

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
