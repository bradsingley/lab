/**
 * Test Suite for Pickleball Tournament App
 */

// Simple test runner
class TestRunner {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
    this.errors = [];
  }

  describe(name, fn) {
    console.log(`\n📦 ${name}`);
    fn();
  }

  test(name, fn) {
    try {
      fn();
      console.log(`  ✅ ${name}`);
      this.passed++;
    } catch (error) {
      console.log(`  ❌ ${name}`);
      console.log(`     Error: ${error.message}`);
      this.failed++;
      this.errors.push({ name, error: error.message });
    }
  }

  assertEqual(actual, expected, message = '') {
    if (actual !== expected) {
      throw new Error(`${message} Expected ${expected}, got ${actual}`);
    }
  }

  assertDeepEqual(actual, expected, message = '') {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(`${message} Objects not equal`);
    }
  }

  assertTrue(value, message = '') {
    if (!value) {
      throw new Error(`${message || 'Expected true, got false'}`);
    }
  }

  assertFalse(value, message = '') {
    if (value) {
      throw new Error(`${message || 'Expected false, got true'}`);
    }
  }

  summary() {
    console.log('\n' + '═'.repeat(50));
    console.log(`📊 Results: ${this.passed} passed, ${this.failed} failed`);
    console.log('═'.repeat(50));
    
    if (this.errors.length > 0) {
      console.log('\n❌ Failed Tests:');
      this.errors.forEach(({ name, error }) => {
        console.log(`   - ${name}: ${error}`);
      });
    }
    
    return this.failed === 0;
  }
}

// Test utilities
const Utils = {
  nextPowerOf2(n) {
    let power = 1;
    while (power < n) power *= 2;
    return power;
  },

  calculateByes(teamCount) {
    return this.nextPowerOf2(teamCount) - teamCount;
  },

  calculateRounds(teamCount) {
    return Math.ceil(Math.log2(teamCount));
  },

  isValidGameScore(score1, score2, winningScore = 11) {
    const maxScore = Math.max(score1, score2);
    const minScore = Math.min(score1, score2);
    if (maxScore - minScore < 2) return false;
    if (maxScore < winningScore) return false;
    if (maxScore > winningScore && maxScore - minScore !== 2) return false;
    return true;
  },

  getMatchWinner(scores) {
    let team1Games = 0;
    let team2Games = 0;
    for (const game of scores) {
      if (game.team1 > game.team2) team1Games++;
      else if (game.team2 > game.team1) team2Games++;
    }
    if (team1Games >= 2) return 1;
    if (team2Games >= 2) return 2;
    return null;
  }
};

// Run tests
const runner = new TestRunner();

runner.describe('Bracket Math Utilities', () => {
  runner.test('nextPowerOf2 - 5 teams returns 8', () => {
    runner.assertEqual(Utils.nextPowerOf2(5), 8);
  });

  runner.test('nextPowerOf2 - 8 teams returns 8', () => {
    runner.assertEqual(Utils.nextPowerOf2(8), 8);
  });

  runner.test('nextPowerOf2 - 12 teams returns 16', () => {
    runner.assertEqual(Utils.nextPowerOf2(12), 16);
  });

  runner.test('calculateByes - 8 teams needs 0 byes', () => {
    runner.assertEqual(Utils.calculateByes(8), 0);
  });

  runner.test('calculateByes - 6 teams needs 2 byes', () => {
    runner.assertEqual(Utils.calculateByes(6), 2);
  });

  runner.test('calculateByes - 12 teams needs 4 byes', () => {
    runner.assertEqual(Utils.calculateByes(12), 4);
  });

  runner.test('calculateRounds - 8 teams has 3 rounds', () => {
    runner.assertEqual(Utils.calculateRounds(8), 3);
  });

  runner.test('calculateRounds - 16 teams has 4 rounds', () => {
    runner.assertEqual(Utils.calculateRounds(16), 4);
  });
});

runner.describe('Game Score Validation', () => {
  runner.test('11-5 is valid', () => {
    runner.assertTrue(Utils.isValidGameScore(11, 5));
  });

  runner.test('11-9 is valid', () => {
    runner.assertTrue(Utils.isValidGameScore(11, 9));
  });

  runner.test('11-10 is invalid (not win by 2)', () => {
    runner.assertFalse(Utils.isValidGameScore(11, 10));
  });

  runner.test('10-5 is invalid (winner below 11)', () => {
    runner.assertFalse(Utils.isValidGameScore(10, 5));
  });

  runner.test('12-10 is valid (overtime)', () => {
    runner.assertTrue(Utils.isValidGameScore(12, 10));
  });

  runner.test('15-13 is valid (extended overtime)', () => {
    runner.assertTrue(Utils.isValidGameScore(15, 13));
  });

  runner.test('13-10 is invalid (more than 2 point gap in overtime)', () => {
    runner.assertFalse(Utils.isValidGameScore(13, 10));
  });
});

runner.describe('Match Winner Determination', () => {
  runner.test('2-0 games returns winner 1', () => {
    const scores = [
      { team1: 11, team2: 5 },
      { team1: 11, team2: 8 }
    ];
    runner.assertEqual(Utils.getMatchWinner(scores), 1);
  });

  runner.test('0-2 games returns winner 2', () => {
    const scores = [
      { team1: 5, team2: 11 },
      { team1: 8, team2: 11 }
    ];
    runner.assertEqual(Utils.getMatchWinner(scores), 2);
  });

  runner.test('2-1 games returns winner 1', () => {
    const scores = [
      { team1: 11, team2: 5 },
      { team1: 5, team2: 11 },
      { team1: 11, team2: 9 }
    ];
    runner.assertEqual(Utils.getMatchWinner(scores), 1);
  });

  runner.test('1-1 games returns null (incomplete)', () => {
    const scores = [
      { team1: 11, team2: 5 },
      { team1: 5, team2: 11 }
    ];
    runner.assertEqual(Utils.getMatchWinner(scores), null);
  });

  runner.test('1-0 games returns null (incomplete)', () => {
    const scores = [
      { team1: 11, team2: 5 }
    ];
    runner.assertEqual(Utils.getMatchWinner(scores), null);
  });
});

runner.describe('Bracket Structure', () => {
  runner.test('8-team single elim has 7 matches', () => {
    const teamCount = 8;
    const totalMatches = teamCount - 1;
    runner.assertEqual(totalMatches, 7);
  });

  runner.test('16-team single elim has 15 matches', () => {
    const teamCount = 16;
    const totalMatches = teamCount - 1;
    runner.assertEqual(totalMatches, 15);
  });

  runner.test('Round robin with 4 teams has 6 matches', () => {
    const n = 4;
    const matches = (n * (n - 1)) / 2;
    runner.assertEqual(matches, 6);
  });

  runner.test('Round robin with 6 teams has 15 matches', () => {
    const n = 6;
    const matches = (n * (n - 1)) / 2;
    runner.assertEqual(matches, 15);
  });
});

runner.describe('Seeding', () => {
  runner.test('Standard 8-seed bracket has 1 vs 8 in first match', () => {
    // In standard seeding, position 0 is seed 1, position 7 is seed 8
    // They should meet in the finals if both win all matches
    const getSeedOrder = (size) => {
      if (size === 2) return [0, 1];
      const smaller = getSeedOrder(size / 2);
      const order = [];
      smaller.forEach(pos => {
        order.push(pos * 2);
        order.push(size - 1 - pos * 2);
      });
      return order;
    };
    
    const order = getSeedOrder(8);
    // Seed 1 should be at position 0
    runner.assertEqual(order[0], 0);
    // Seed 8 should be across from seed 1 in finals path
    runner.assertEqual(order[1], 7);
  });
});

runner.describe('Schedule Time Calculations', () => {
  runner.test('Adding 45 minutes to 08:00 gives 08:45', () => {
    const addMinutes = (timeStr, minutes) => {
      const [hours, mins] = timeStr.split(':').map(Number);
      const totalMinutes = hours * 60 + mins + minutes;
      const newHours = Math.floor(totalMinutes / 60);
      const newMins = totalMinutes % 60;
      return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}`;
    };
    
    runner.assertEqual(addMinutes('08:00', 45), '08:45');
  });

  runner.test('Adding 90 minutes to 11:30 gives 13:00', () => {
    const addMinutes = (timeStr, minutes) => {
      const [hours, mins] = timeStr.split(':').map(Number);
      const totalMinutes = hours * 60 + mins + minutes;
      const newHours = Math.floor(totalMinutes / 60);
      const newMins = totalMinutes % 60;
      return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}`;
    };
    
    runner.assertEqual(addMinutes('11:30', 90), '13:00');
  });
});

runner.describe('Standings Tiebreakers', () => {
  runner.test('Point differential calculation', () => {
    const team = { pointsFor: 150, pointsAgainst: 120 };
    const diff = team.pointsFor - team.pointsAgainst;
    runner.assertEqual(diff, 30);
  });

  runner.test('Win percentage calculation', () => {
    const wins = 7;
    const losses = 3;
    const winPct = Math.round((wins / (wins + losses)) * 100);
    runner.assertEqual(winPct, 70);
  });
});

// Summary
const success = runner.summary();
process.exit(success ? 0 : 1);
