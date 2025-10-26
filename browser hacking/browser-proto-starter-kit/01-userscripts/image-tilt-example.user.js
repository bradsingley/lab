// ==UserScript==
// @name         Image strobe flash
// @version      1.0
// @description  Starter example: makes images strobe flash between regular and inverted colors
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function () {
  "use strict";
  const css = document.createElement("style");
  css.textContent = `
    img {
      animation: strobeFlash 0.5s infinite alternate;
    }
    
    @keyframes strobeFlash {
      0% {
        filter: invert(0);
      }
      100% {
        filter: invert(1);
      }
    }
  `;
  document.head.appendChild(css);
})();
