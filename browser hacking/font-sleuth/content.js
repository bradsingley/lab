(function () {
  "use strict";

  let tooltip = null;
  let currentElement = null;
  let isEnabled = true;

  // Check if extension is enabled
  function checkEnabled() {
    chrome.storage.sync.get(['fontSleuthEnabled'], function(result) {
      isEnabled = result.fontSleuthEnabled !== false; // Default to true
    });
  }

  // Listen for storage changes
  chrome.storage.onChanged.addListener(function(changes, namespace) {
    if (changes.fontSleuthEnabled) {
      isEnabled = changes.fontSleuthEnabled.newValue;
      if (!isEnabled) {
        hideTooltip();
      }
    }
  });

  // Create tooltip element
  function createTooltip() {
    tooltip = document.createElement("div");
    tooltip.className = "font-sleuth-tooltip";
    document.body.appendChild(tooltip);
  }

  // Get font information from element
  function getFontInfo(element) {
    const computed = window.getComputedStyle(element);
    const fontFamily = computed.fontFamily;
    const fontSize = computed.fontSize;
    const fontWeight = computed.fontWeight;
    const fontStyle = computed.fontStyle;
    
    // Parse font family (remove quotes and get first font)
    let primaryFont = fontFamily.split(',')[0].trim().replace(/['"]/g, '');
    
    return {
      family: primaryFont,
      size: fontSize,
      weight: fontWeight,
      style: fontStyle
    };
  }

  // Show tooltip
  function showTooltip(element, x, y) {
    if (!tooltip) createTooltip();
    
    const fontInfo = getFontInfo(element);
    
    // Build tooltip content
    let content = `<strong>${fontInfo.family}</strong>`;
    content += `<br>${fontInfo.size}`;
    
    if (fontInfo.weight !== '400' && fontInfo.weight !== 'normal') {
      content += ` · ${fontInfo.weight}`;
    }
    
    if (fontInfo.style !== 'normal') {
      content += ` · ${fontInfo.style}`;
    }
    
    tooltip.innerHTML = content;
    tooltip.style.display = "block";
    
    // Position tooltip above cursor (using viewport coordinates for fixed positioning)
    const tooltipRect = tooltip.getBoundingClientRect();
    let left = x - tooltipRect.width / 2;
    let top = y - tooltipRect.height - 10;
    
    // Keep tooltip on screen
    if (left < 5) left = 5;
    if (left + tooltipRect.width > window.innerWidth - 5) {
      left = window.innerWidth - tooltipRect.width - 5;
    }
    if (top < 5) {
      top = y + 20; // Show below cursor if not enough space above
    }
    
    tooltip.style.left = left + "px";
    tooltip.style.top = top + "px";
    
    // Trigger animation
    setTimeout(() => {
      if (tooltip) {
        tooltip.classList.add('show');
      }
    }, 10);
  }

  // Hide tooltip
  function hideTooltip() {
    if (tooltip) {
      tooltip.classList.remove('show');
      setTimeout(() => {
        if (tooltip) {
          tooltip.style.display = "none";
        }
      }, 200);
    }
  }

  // Handle mouse move
  function handleMouseMove(e) {
    // Check if extension is enabled
    if (!isEnabled) {
      hideTooltip();
      return;
    }

    const element = e.target;
    
    // Only show for text elements
    if (element && element.textContent && element.textContent.trim().length > 0) {
      // Use clientX/Y for viewport coordinates (works with fixed positioning)
      const x = e.clientX;
      const y = e.clientY;
      
      if (element !== currentElement) {
        currentElement = element;
        showTooltip(element, x, y);
      } else {
        // Update position
        if (tooltip && tooltip.classList.contains('show')) {
          const tooltipRect = tooltip.getBoundingClientRect();
          let left = x - tooltipRect.width / 2;
          let top = y - tooltipRect.height - 10;
          
          if (left < 5) left = 5;
          if (left + tooltipRect.width > window.innerWidth - 5) {
            left = window.innerWidth - tooltipRect.width - 5;
          }
          if (top < 5) {
            top = y + 20;
          }
          
          tooltip.style.left = left + "px";
          tooltip.style.top = top + "px";
        }
      }
    } else {
      hideTooltip();
      currentElement = null;
    }
  }

  // Initialize
  checkEnabled();
  createTooltip();
  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mouseleave", hideTooltip);
})();
