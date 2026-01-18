/**
 * Tournament Management Module
 */

const Tournament = {
  /**
   * Create a new tournament
   */
  create(data) {
    const tournament = {
      id: Utils.generateId('T'),
      name: data.name,
      startDate: data.startDate,
      endDate: data.endDate || data.startDate,
      format: data.format,
      type: data.type,
      skillLevel: data.skillLevel || 'open',
      courts: parseInt(data.courts) || 4,
      location: data.location || '',
      description: data.description || '',
      status: 'upcoming',
      createdAt: new Date().toISOString(),
      teams: [],
      bracket: null,
      schedule: null,
      settings: {
        gameFormat: 'best3', // best of 3
        pointsToWin: 11,
        winBy: 2,
        warmupTime: 5,
        matchDuration: 45
      }
    };
    
    Storage.saveTournament(tournament);
    return tournament;
  },

  /**
   * Get all tournaments
   */
  getAll() {
    return Storage.getTournaments();
  },

  /**
   * Get tournament by ID
   */
  getById(id) {
    return Storage.getTournament(id);
  },

  /**
   * Update tournament
   */
  update(id, data) {
    const tournament = this.getById(id);
    if (!tournament) return null;
    
    const updated = { ...tournament, ...data, updatedAt: new Date().toISOString() };
    Storage.saveTournament(updated);
    return updated;
  },

  /**
   * Delete tournament
   */
  delete(id) {
    return Storage.deleteTournament(id);
  },

  /**
   * Add team to tournament
   */
  addTeam(tournamentId, team) {
    const tournament = this.getById(tournamentId);
    if (!tournament) return null;
    
    const newTeam = {
      id: Utils.generateId('TM'),
      name: team.name,
      players: team.players || [],
      seed: team.seed || tournament.teams.length + 1,
      registeredAt: new Date().toISOString()
    };
    
    tournament.teams.push(newTeam);
    this.update(tournamentId, { teams: tournament.teams });
    return newTeam;
  },

  /**
   * Remove team from tournament
   */
  removeTeam(tournamentId, teamId) {
    const tournament = this.getById(tournamentId);
    if (!tournament) return false;
    
    tournament.teams = tournament.teams.filter(t => t.id !== teamId);
    // Reseed remaining teams
    tournament.teams.forEach((team, index) => {
      team.seed = index + 1;
    });
    
    this.update(tournamentId, { teams: tournament.teams });
    return true;
  },

  /**
   * Generate bracket for tournament
   */
  generateBracket(tournamentId) {
    const tournament = this.getById(tournamentId);
    if (!tournament || tournament.teams.length < 2) return null;
    
    // Sort teams by seed
    const sortedTeams = [...tournament.teams].sort((a, b) => a.seed - b.seed);
    
    // Create bracket
    const bracket = Bracket.create(tournament, sortedTeams);
    
    this.update(tournamentId, { bracket: bracket, status: 'active' });
    return bracket;
  },

  /**
   * Get tournament status
   */
  getStatus(tournament) {
    const now = new Date();
    const startDate = new Date(tournament.startDate);
    const endDate = new Date(tournament.endDate);
    
    if (tournament.status === 'completed') return 'completed';
    if (now < startDate) return 'upcoming';
    if (now >= startDate && now <= endDate) return 'active';
    if (now > endDate) return 'completed';
    
    return tournament.status;
  },

  /**
   * Get format display name
   */
  getFormatName(format) {
    const formats = {
      single: 'Single Elimination',
      double: 'Double Elimination',
      roundrobin: 'Round Robin',
      pools: 'Pool Play + Playoffs'
    };
    return formats[format] || format;
  },

  /**
   * Get type display name
   */
  getTypeName(type) {
    const types = {
      singles: 'Singles',
      doubles: 'Doubles',
      mixed: 'Mixed Doubles'
    };
    return types[type] || type;
  },

  /**
   * Filter tournaments
   */
  filter(filters = {}) {
    let tournaments = this.getAll();
    
    if (filters.status) {
      tournaments = tournaments.filter(t => this.getStatus(t) === filters.status);
    }
    
    if (filters.format) {
      tournaments = tournaments.filter(t => t.format === filters.format);
    }
    
    if (filters.search) {
      const search = filters.search.toLowerCase();
      tournaments = tournaments.filter(t => 
        t.name.toLowerCase().includes(search) ||
        t.location.toLowerCase().includes(search)
      );
    }
    
    return tournaments;
  },

  /**
   * Record match result
   */
  recordMatchResult(tournamentId, matchId, scores) {
    const tournament = this.getById(tournamentId);
    if (!tournament || !tournament.bracket) return null;
    
    const updatedBracket = Bracket.recordResult(tournament.bracket, matchId, scores);
    if (updatedBracket) {
      this.update(tournamentId, { bracket: updatedBracket });
      return updatedBracket;
    }
    return null;
  },

  /**
   * Check if tournament is complete
   */
  isComplete(tournament) {
    if (!tournament.bracket || !tournament.bracket.rounds) return false;
    
    const finalRound = tournament.bracket.rounds[tournament.bracket.rounds.length - 1];
    const finalMatch = finalRound.matches[0];
    
    return finalMatch && finalMatch.status === 'completed';
  },

  /**
   * Get tournament champion
   */
  getChampion(tournament) {
    if (!this.isComplete(tournament)) return null;
    
    const finalRound = tournament.bracket.rounds[tournament.bracket.rounds.length - 1];
    const finalMatch = finalRound.matches[0];
    
    return finalMatch.winner;
  },

  /**
   * Render tournament card HTML
   */
  renderCard(tournament) {
    const status = this.getStatus(tournament);
    const statusClass = `badge-${status}`;
    const statusText = status.charAt(0).toUpperCase() + status.slice(1);
    
    return `
      <div class="tournament-card" data-tournament-id="${tournament.id}">
        <div class="tournament-card-header">
          <h3>${tournament.name}</h3>
          <div class="tournament-meta">
            <span>${Utils.formatDate(tournament.startDate)}</span>
            ${tournament.location ? `<span>• ${tournament.location}</span>` : ''}
          </div>
        </div>
        <div class="tournament-card-body">
          <div class="tournament-info">
            <div class="tournament-info-row">
              <span class="tournament-info-label">Format</span>
              <span>${this.getFormatName(tournament.format)}</span>
            </div>
            <div class="tournament-info-row">
              <span class="tournament-info-label">Type</span>
              <span>${this.getTypeName(tournament.type)}</span>
            </div>
            <div class="tournament-info-row">
              <span class="tournament-info-label">Teams</span>
              <span>${tournament.teams.length}</span>
            </div>
            <div class="tournament-info-row">
              <span class="tournament-info-label">Courts</span>
              <span>${tournament.courts}</span>
            </div>
          </div>
          <div class="tournament-card-actions">
            <span class="badge ${statusClass}">${statusText}</span>
            <button class="btn btn-sm btn-ghost view-bracket-btn" data-tournament-id="${tournament.id}">View Bracket</button>
            <button class="btn btn-sm btn-primary manage-btn" data-tournament-id="${tournament.id}">Manage</button>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Render tournaments list
   */
  renderList(tournaments) {
    if (!tournaments || tournaments.length === 0) {
      return '<p class="empty-state">No tournaments yet. Create your first tournament!</p>';
    }
    
    return tournaments.map(t => this.renderCard(t)).join('');
  }
};
