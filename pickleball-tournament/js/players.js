/**
 * Player Management Module
 */

const Players = {
  /**
   * Create a new player
   */
  create(data) {
    const player = {
      id: Utils.generateId('P'),
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone || '',
      skillLevel: data.skillLevel || '3.5',
      formats: data.formats || ['doubles', 'mixed'],
      createdAt: new Date().toISOString(),
      stats: {
        matchesPlayed: 0,
        matchesWon: 0,
        gamesPlayed: 0,
        gamesWon: 0,
        pointsFor: 0,
        pointsAgainst: 0,
        tournaments: 0,
        medals: { gold: 0, silver: 0, bronze: 0 }
      },
      rating: parseFloat(data.skillLevel) || 3.5,
      ratingHistory: []
    };
    
    Storage.savePlayer(player);
    return player;
  },

  /**
   * Get all players
   */
  getAll() {
    return Storage.getPlayers();
  },

  /**
   * Get player by ID
   */
  getById(id) {
    return Storage.getPlayer(id);
  },

  /**
   * Update player
   */
  update(id, data) {
    const player = this.getById(id);
    if (!player) return null;
    
    const updated = { ...player, ...data, updatedAt: new Date().toISOString() };
    Storage.savePlayer(updated);
    return updated;
  },

  /**
   * Delete player
   */
  delete(id) {
    return Storage.deletePlayer(id);
  },

  /**
   * Search players
   */
  search(query) {
    const players = this.getAll();
    const lowerQuery = query.toLowerCase();
    
    return players.filter(p => 
      p.firstName.toLowerCase().includes(lowerQuery) ||
      p.lastName.toLowerCase().includes(lowerQuery) ||
      p.email.toLowerCase().includes(lowerQuery)
    );
  },

  /**
   * Filter players by skill level
   */
  filterBySkill(skillLevel) {
    const players = this.getAll();
    if (!skillLevel) return players;
    return players.filter(p => p.skillLevel === skillLevel);
  },

  /**
   * Get player's full name
   */
  getFullName(player) {
    return `${player.firstName} ${player.lastName}`;
  },

  /**
   * Get player's win rate
   */
  getWinRate(player) {
    if (player.stats.matchesPlayed === 0) return 0;
    return Math.round((player.stats.matchesWon / player.stats.matchesPlayed) * 100);
  },

  /**
   * Update player stats after a match
   */
  updateStats(playerId, matchResult) {
    const player = this.getById(playerId);
    if (!player) return null;
    
    player.stats.matchesPlayed++;
    player.stats.gamesPlayed += matchResult.gamesPlayed;
    player.stats.pointsFor += matchResult.pointsFor;
    player.stats.pointsAgainst += matchResult.pointsAgainst;
    
    if (matchResult.won) {
      player.stats.matchesWon++;
      player.stats.gamesWon += matchResult.gamesWon;
    }
    
    Storage.savePlayer(player);
    return player;
  },

  /**
   * Update player rating
   */
  updateRating(playerId, newRating, matchInfo) {
    const player = this.getById(playerId);
    if (!player) return null;
    
    player.ratingHistory.push({
      date: new Date().toISOString(),
      previousRating: player.rating,
      newRating: newRating,
      change: newRating - player.rating,
      matchInfo: matchInfo
    });
    
    player.rating = Math.round(newRating * 100) / 100;
    Storage.savePlayer(player);
    return player;
  },

  /**
   * Add tournament result (medal)
   */
  addTournamentResult(playerId, result) {
    const player = this.getById(playerId);
    if (!player) return null;
    
    player.stats.tournaments++;
    
    if (result.finish === 1) {
      player.stats.medals.gold++;
    } else if (result.finish === 2) {
      player.stats.medals.silver++;
    } else if (result.finish === 3) {
      player.stats.medals.bronze++;
    }
    
    Storage.savePlayer(player);
    return player;
  },

  /**
   * Render player card HTML
   */
  renderCard(player) {
    const initials = Utils.getInitials(this.getFullName(player));
    const winRate = this.getWinRate(player);
    
    return `
      <div class="player-card" data-player-id="${player.id}">
        <div class="player-header">
          <div class="player-avatar">${initials}</div>
          <div>
            <div class="player-name">${this.getFullName(player)}</div>
            <div class="player-email">${player.email}</div>
          </div>
        </div>
        <div class="player-stats">
          <div class="player-stat">
            <span class="player-stat-value">${player.skillLevel}</span>
            <span class="player-stat-label">Skill</span>
          </div>
          <div class="player-stat">
            <span class="player-stat-value">${player.stats.matchesWon}-${player.stats.matchesPlayed - player.stats.matchesWon}</span>
            <span class="player-stat-label">W-L</span>
          </div>
          <div class="player-stat">
            <span class="player-stat-value">${winRate}%</span>
            <span class="player-stat-label">Win Rate</span>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Render players list
   */
  renderList(players) {
    if (!players || players.length === 0) {
      return '<p class="empty-state">No players registered yet.</p>';
    }
    
    return players.map(p => this.renderCard(p)).join('');
  }
};
