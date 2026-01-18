/**
 * Bracket Generation Module
 */

const Bracket = {
  /**
   * Create bracket for tournament
   */
  create(tournament, teams) {
    const format = tournament.format;
    
    switch (format) {
      case 'single':
        return this.createSingleElimination(tournament, teams);
      case 'double':
        return this.createDoubleElimination(tournament, teams);
      case 'roundrobin':
        return this.createRoundRobin(tournament, teams);
      case 'pools':
        return this.createPoolPlay(tournament, teams);
      default:
        return this.createSingleElimination(tournament, teams);
    }
  },

  /**
   * Create single elimination bracket
   */
  createSingleElimination(tournament, teams) {
    const teamCount = teams.length;
    const bracketSize = Utils.nextPowerOf2(teamCount);
    const byeCount = Utils.calculateByes(teamCount);
    const roundCount = Utils.calculateRounds(bracketSize);
    
    // Seed teams (assumes teams are already sorted by seed)
    const seededTeams = this.seedTeams(teams, bracketSize);
    
    // Create matches for each round
    const rounds = [];
    let matchId = 1;
    
    for (let round = 1; round <= roundCount; round++) {
      const matchesInRound = bracketSize / Math.pow(2, round);
      const roundMatches = [];
      
      for (let match = 0; match < matchesInRound; match++) {
        const matchData = {
          id: `${tournament.id}-R${round}-M${match + 1}`,
          matchId: matchId++,
          tournamentId: tournament.id,
          round: round,
          position: match + 1,
          team1: null,
          team2: null,
          scores: [],
          winner: null,
          loser: null,
          status: 'pending',
          nextMatchId: round < roundCount ? `${tournament.id}-R${round + 1}-M${Math.floor(match / 2) + 1}` : null,
          nextMatchPosition: match % 2 === 0 ? 'team1' : 'team2',
          scheduledTime: null,
          court: null
        };
        
        // First round: assign teams
        if (round === 1) {
          const team1Index = match * 2;
          const team2Index = match * 2 + 1;
          matchData.team1 = seededTeams[team1Index];
          matchData.team2 = seededTeams[team2Index];
          
          // Handle byes - if team2 is a bye, team1 automatically advances
          if (matchData.team2 && matchData.team2.isBye) {
            matchData.winner = matchData.team1;
            matchData.status = 'completed';
          } else if (matchData.team1 && matchData.team2) {
            matchData.status = 'scheduled';
          }
        }
        
        roundMatches.push(matchData);
      }
      
      rounds.push({
        roundNumber: round,
        name: this.getRoundName(round, roundCount),
        matches: roundMatches
      });
    }
    
    // Advance bye winners to next round
    this.advanceByeWinners(rounds);
    
    return {
      format: 'single',
      teamCount: teamCount,
      bracketSize: bracketSize,
      byeCount: byeCount,
      roundCount: roundCount,
      rounds: rounds,
      totalMatches: bracketSize - 1
    };
  },

  /**
   * Create double elimination bracket
   */
  createDoubleElimination(tournament, teams) {
    // Create winners bracket (same as single elim)
    const winnersBracket = this.createSingleElimination(
      { ...tournament, id: `${tournament.id}-W` },
      teams
    );
    
    // Create losers bracket structure
    const losersRoundCount = (winnersBracket.roundCount - 1) * 2;
    const losersBracket = {
      rounds: []
    };
    
    let matchId = 1;
    for (let round = 1; round <= losersRoundCount; round++) {
      // Calculate matches in this losers round
      const matchesInRound = Math.ceil(winnersBracket.bracketSize / Math.pow(2, Math.ceil(round / 2) + 1));
      const roundMatches = [];
      
      for (let match = 0; match < matchesInRound; match++) {
        roundMatches.push({
          id: `${tournament.id}-L${round}-M${match + 1}`,
          matchId: matchId++,
          tournamentId: tournament.id,
          round: round,
          position: match + 1,
          bracketType: 'losers',
          team1: null,
          team2: null,
          scores: [],
          winner: null,
          loser: null,
          status: 'pending',
          scheduledTime: null,
          court: null
        });
      }
      
      losersBracket.rounds.push({
        roundNumber: round,
        name: `Losers Round ${round}`,
        matches: roundMatches
      });
    }
    
    // Grand finals (winner of winners vs winner of losers)
    const grandFinals = {
      id: `${tournament.id}-GF`,
      tournamentId: tournament.id,
      round: 'GF',
      team1: null, // Winner of winners bracket
      team2: null, // Winner of losers bracket
      scores: [],
      winner: null,
      status: 'pending'
    };
    
    return {
      format: 'double',
      teamCount: teams.length,
      winnersBracket: winnersBracket,
      losersBracket: losersBracket,
      grandFinals: grandFinals,
      totalMatches: (winnersBracket.bracketSize - 1) + losersBracket.rounds.reduce((sum, r) => sum + r.matches.length, 0) + 1
    };
  },

  /**
   * Create round robin schedule
   */
  createRoundRobin(tournament, teams) {
    const teamCount = teams.length;
    // If odd number of teams, add a bye
    const adjustedTeams = teamCount % 2 === 0 ? teams : [...teams, { id: 'BYE', name: 'BYE', isBye: true }];
    const n = adjustedTeams.length;
    const rounds = [];
    let matchId = 1;
    
    // Create round robin using circle method
    for (let round = 0; round < n - 1; round++) {
      const roundMatches = [];
      
      for (let match = 0; match < n / 2; match++) {
        const home = match === 0 ? 0 : (n - 1 - ((round + match - 1) % (n - 1)));
        const away = (round + match) % (n - 1) + 1;
        
        const team1 = adjustedTeams[home];
        const team2 = adjustedTeams[away];
        
        // Skip bye matches
        if (team1.isBye || team2.isBye) continue;
        
        roundMatches.push({
          id: `${tournament.id}-RR${round + 1}-M${match + 1}`,
          matchId: matchId++,
          tournamentId: tournament.id,
          round: round + 1,
          position: match + 1,
          team1: team1,
          team2: team2,
          scores: [],
          winner: null,
          status: 'scheduled',
          scheduledTime: null,
          court: null
        });
      }
      
      if (roundMatches.length > 0) {
        rounds.push({
          roundNumber: round + 1,
          name: `Round ${round + 1}`,
          matches: roundMatches
        });
      }
    }
    
    // Calculate total matches: n * (n-1) / 2 for true team count
    const totalMatches = (teamCount * (teamCount - 1)) / 2;
    
    return {
      format: 'roundrobin',
      teamCount: teamCount,
      rounds: rounds,
      totalMatches: totalMatches,
      standings: teams.map(t => ({
        team: t,
        wins: 0,
        losses: 0,
        pointsFor: 0,
        pointsAgainst: 0,
        pointDifferential: 0
      }))
    };
  },

  /**
   * Create pool play + playoffs
   */
  createPoolPlay(tournament, teams) {
    // Divide teams into pools (2-4 pools based on team count)
    const poolCount = teams.length <= 8 ? 2 : teams.length <= 16 ? 4 : Math.min(8, Math.ceil(teams.length / 4));
    const pools = [];
    
    // Snake draft into pools for balanced seeding
    for (let i = 0; i < poolCount; i++) {
      pools.push({ name: String.fromCharCode(65 + i), teams: [], matches: [] });
    }
    
    teams.forEach((team, index) => {
      const poolIndex = index % 2 === 0 
        ? Math.floor(index / 2) % poolCount 
        : poolCount - 1 - (Math.floor(index / 2) % poolCount);
      pools[poolIndex].teams.push(team);
    });
    
    // Create round robin within each pool
    let matchId = 1;
    pools.forEach((pool, poolIndex) => {
      const poolRR = this.createRoundRobin(
        { ...tournament, id: `${tournament.id}-Pool${pool.name}` },
        pool.teams
      );
      pool.matches = poolRR.rounds.flatMap(r => r.matches);
      pool.standings = poolRR.standings;
    });
    
    // Create playoff bracket (top 2 from each pool advance)
    const playoffTeamCount = poolCount * 2;
    const playoffPlaceholders = Array(playoffTeamCount).fill(null).map((_, i) => ({
      id: `PLAYOFF-${i + 1}`,
      name: `${i % 2 === 0 ? '1st' : '2nd'} Pool ${String.fromCharCode(65 + Math.floor(i / 2))}`,
      isPlaceholder: true
    }));
    
    const playoffs = this.createSingleElimination(
      { ...tournament, id: `${tournament.id}-Playoffs` },
      playoffPlaceholders
    );
    
    return {
      format: 'pools',
      teamCount: teams.length,
      poolCount: poolCount,
      pools: pools,
      playoffs: playoffs,
      totalMatches: pools.reduce((sum, p) => sum + p.matches.length, 0) + playoffs.totalMatches
    };
  },

  /**
   * Seed teams according to bracket position
   * Standard seeding: 1v16, 8v9, 5v12, 4v13, etc.
   */
  seedTeams(teams, bracketSize) {
    const seeded = new Array(bracketSize).fill(null);
    const byeCount = bracketSize - teams.length;
    
    // Create standard seeding order
    const seedOrder = this.getSeedOrder(bracketSize);
    
    // Place teams according to seed order
    teams.forEach((team, index) => {
      const position = seedOrder[index];
      seeded[position] = { ...team, seed: index + 1 };
    });
    
    // Fill remaining spots with byes
    for (let i = teams.length; i < bracketSize; i++) {
      const position = seedOrder[i];
      seeded[position] = { id: `BYE-${i}`, name: 'BYE', seed: i + 1, isBye: true };
    }
    
    return seeded;
  },

  /**
   * Get standard seed order for bracket size
   */
  getSeedOrder(bracketSize) {
    if (bracketSize === 2) return [0, 1];
    
    const smaller = this.getSeedOrder(bracketSize / 2);
    const order = [];
    
    smaller.forEach(pos => {
      order.push(pos * 2);
      order.push(bracketSize - 1 - pos * 2);
    });
    
    return order;
  },

  /**
   * Advance bye winners to next round
   */
  advanceByeWinners(rounds) {
    if (rounds.length < 2) return;
    
    rounds[0].matches.forEach(match => {
      if (match.winner && match.status === 'completed') {
        // Find next match and assign winner
        const nextMatch = rounds[1].matches.find(m => m.id === match.nextMatchId);
        if (nextMatch) {
          if (match.nextMatchPosition === 'team1') {
            nextMatch.team1 = match.winner;
          } else {
            nextMatch.team2 = match.winner;
          }
          
          // Check if next match is ready to be scheduled
          if (nextMatch.team1 && nextMatch.team2) {
            nextMatch.status = 'scheduled';
          }
        }
      }
    });
  },

  /**
   * Get round name based on position
   */
  getRoundName(round, totalRounds) {
    const fromFinal = totalRounds - round;
    
    switch (fromFinal) {
      case 0: return 'Finals';
      case 1: return 'Semifinals';
      case 2: return 'Quarterfinals';
      case 3: return 'Round of 16';
      case 4: return 'Round of 32';
      default: return `Round ${round}`;
    }
  },

  /**
   * Record match result and advance winner
   */
  recordResult(bracket, matchId, scores) {
    // Find the match
    let match = null;
    let roundIndex = -1;
    
    for (let i = 0; i < bracket.rounds.length; i++) {
      const found = bracket.rounds[i].matches.find(m => m.id === matchId);
      if (found) {
        match = found;
        roundIndex = i;
        break;
      }
    }
    
    if (!match) return null;
    
    // Record scores
    match.scores = scores;
    
    // Determine winner
    const winner = Utils.getMatchWinner(scores);
    if (winner === 1) {
      match.winner = match.team1;
      match.loser = match.team2;
    } else if (winner === 2) {
      match.winner = match.team2;
      match.loser = match.team1;
    } else {
      return null; // Match not complete
    }
    
    match.status = 'completed';
    match.completedAt = new Date().toISOString();
    
    // Advance winner to next match
    if (match.nextMatchId && roundIndex < bracket.rounds.length - 1) {
      const nextMatch = bracket.rounds[roundIndex + 1].matches.find(m => m.id === match.nextMatchId);
      if (nextMatch) {
        if (match.nextMatchPosition === 'team1') {
          nextMatch.team1 = match.winner;
        } else {
          nextMatch.team2 = match.winner;
        }
        
        if (nextMatch.team1 && nextMatch.team2) {
          nextMatch.status = 'scheduled';
        }
      }
    }
    
    return bracket;
  },

  /**
   * Render bracket HTML
   */
  render(bracket) {
    if (!bracket || !bracket.rounds) {
      return '<p class="empty-state">No bracket data available</p>';
    }
    
    let html = '<div class="bracket">';
    
    bracket.rounds.forEach(round => {
      html += `
        <div class="bracket-round">
          <div class="round-header">${round.name}</div>
          ${round.matches.map(match => this.renderMatch(match)).join('')}
        </div>
      `;
    });
    
    html += '</div>';
    return html;
  },

  /**
   * Render single match in bracket
   */
  renderMatch(match) {
    const team1Name = match.team1 ? (match.team1.isBye ? 'BYE' : match.team1.name) : 'TBD';
    const team2Name = match.team2 ? (match.team2.isBye ? 'BYE' : match.team2.name) : 'TBD';
    const team1Seed = match.team1?.seed ? `<span class="team-seed">${match.team1.seed}</span>` : '';
    const team2Seed = match.team2?.seed ? `<span class="team-seed">${match.team2.seed}</span>` : '';
    
    const team1Score = match.scores.length > 0 ? match.scores.map(s => s.team1).join('-') : '';
    const team2Score = match.scores.length > 0 ? match.scores.map(s => s.team2).join('-') : '';
    
    const team1Class = match.winner === match.team1 ? 'winner' : (match.winner === match.team2 ? 'loser' : '');
    const team2Class = match.winner === match.team2 ? 'winner' : (match.winner === match.team1 ? 'loser' : '');
    
    return `
      <div class="bracket-match" data-match-id="${match.id}">
        <div class="bracket-team ${team1Class}">
          <span>${team1Seed}${team1Name}</span>
          <span class="team-score">${team1Score}</span>
        </div>
        <div class="bracket-team ${team2Class}">
          <span>${team2Seed}${team2Name}</span>
          <span class="team-score">${team2Score}</span>
        </div>
      </div>
    `;
  }
};
