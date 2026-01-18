/**
 * Utility functions for the Pickleball Tournament App
 */

const Utils = {
  /**
   * Generate a unique ID
   */
  generateId(prefix = '') {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return prefix ? `${prefix}-${timestamp}-${random}` : `${timestamp}-${random}`;
  },

  /**
   * Format date for display
   */
  formatDate(dateString, options = {}) {
    const date = new Date(dateString);
    const defaultOptions = {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      ...options
    };
    return date.toLocaleDateString('en-US', defaultOptions);
  },

  /**
   * Format time for display
   */
  formatTime(date) {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  },

  /**
   * Calculate next power of 2
   */
  nextPowerOf2(n) {
    let power = 1;
    while (power < n) {
      power *= 2;
    }
    return power;
  },

  /**
   * Calculate number of byes needed
   */
  calculateByes(teamCount) {
    const nextPower = this.nextPowerOf2(teamCount);
    return nextPower - teamCount;
  },

  /**
   * Calculate number of rounds for single elimination
   */
  calculateRounds(teamCount) {
    return Math.ceil(Math.log2(teamCount));
  },

  /**
   * Get initials from name
   */
  getInitials(name) {
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  },

  /**
   * Debounce function calls
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  /**
   * Deep clone an object
   */
  deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  },

  /**
   * Shuffle array (Fisher-Yates)
   */
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  },

  /**
   * Validate pickleball game score
   */
  isValidGameScore(score1, score2, winningScore = 11) {
    const maxScore = Math.max(score1, score2);
    const minScore = Math.min(score1, score2);
    
    // Must win by 2
    if (maxScore - minScore < 2) return false;
    
    // Winner must have at least winning score
    if (maxScore < winningScore) return false;
    
    // If over winning score, must be exactly 2 ahead
    if (maxScore > winningScore && maxScore - minScore !== 2) return false;
    
    return true;
  },

  /**
   * Get match winner from scores
   */
  getMatchWinner(scores) {
    let team1Games = 0;
    let team2Games = 0;
    
    for (const game of scores) {
      if (game.team1 > game.team2) {
        team1Games++;
      } else if (game.team2 > game.team1) {
        team2Games++;
      }
    }
    
    // Best of 3 - first to 2 games
    if (team1Games >= 2) return 1;
    if (team2Games >= 2) return 2;
    return null; // Match not complete
  },

  /**
   * Calculate point differential
   */
  calculatePointDifferential(scores) {
    let team1Total = 0;
    let team2Total = 0;
    
    for (const game of scores) {
      team1Total += game.team1;
      team2Total += game.team2;
    }
    
    return team1Total - team2Total;
  },

  /**
   * Show notification toast
   */
  showToast(message, type = 'info') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 12px 24px;
      background: ${type === 'error' ? '#EF4444' : type === 'success' ? '#22C55E' : '#3B82F6'};
      color: white;
      border-radius: 8px;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 9999;
      animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    // Remove after 3 seconds
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
};

// Add CSS animation for toast
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(style);
