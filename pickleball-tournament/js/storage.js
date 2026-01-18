/**
 * Local Storage Manager for Pickleball Tournament App
 */

const Storage = {
  KEYS: {
    TOURNAMENTS: 'pickleball_tournaments',
    PLAYERS: 'pickleball_players',
    MATCHES: 'pickleball_matches',
    SETTINGS: 'pickleball_settings'
  },

  /**
   * Initialize storage with default data if empty
   */
  init() {
    if (!this.get(this.KEYS.TOURNAMENTS)) {
      this.set(this.KEYS.TOURNAMENTS, []);
    }
    if (!this.get(this.KEYS.PLAYERS)) {
      this.set(this.KEYS.PLAYERS, []);
    }
    if (!this.get(this.KEYS.MATCHES)) {
      this.set(this.KEYS.MATCHES, []);
    }
    if (!this.get(this.KEYS.SETTINGS)) {
      this.set(this.KEYS.SETTINGS, {
        defaultCourts: 4,
        matchDuration: 45,
        restTime: 30
      });
    }
  },

  /**
   * Get data from storage
   */
  get(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Storage get error:', e);
      return null;
    }
  },

  /**
   * Set data in storage
   */
  set(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Storage set error:', e);
      return false;
    }
  },

  /**
   * Remove data from storage
   */
  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.error('Storage remove error:', e);
      return false;
    }
  },

  /**
   * Clear all app data
   */
  clearAll() {
    Object.values(this.KEYS).forEach(key => this.remove(key));
  },

  // Tournament methods
  getTournaments() {
    return this.get(this.KEYS.TOURNAMENTS) || [];
  },

  saveTournaments(tournaments) {
    return this.set(this.KEYS.TOURNAMENTS, tournaments);
  },

  getTournament(id) {
    const tournaments = this.getTournaments();
    return tournaments.find(t => t.id === id);
  },

  saveTournament(tournament) {
    const tournaments = this.getTournaments();
    const index = tournaments.findIndex(t => t.id === tournament.id);
    
    if (index >= 0) {
      tournaments[index] = tournament;
    } else {
      tournaments.push(tournament);
    }
    
    return this.saveTournaments(tournaments);
  },

  deleteTournament(id) {
    const tournaments = this.getTournaments();
    const filtered = tournaments.filter(t => t.id !== id);
    return this.saveTournaments(filtered);
  },

  // Player methods
  getPlayers() {
    return this.get(this.KEYS.PLAYERS) || [];
  },

  savePlayers(players) {
    return this.set(this.KEYS.PLAYERS, players);
  },

  getPlayer(id) {
    const players = this.getPlayers();
    return players.find(p => p.id === id);
  },

  savePlayer(player) {
    const players = this.getPlayers();
    const index = players.findIndex(p => p.id === player.id);
    
    if (index >= 0) {
      players[index] = player;
    } else {
      players.push(player);
    }
    
    return this.savePlayers(players);
  },

  deletePlayer(id) {
    const players = this.getPlayers();
    const filtered = players.filter(p => p.id !== id);
    return this.savePlayers(filtered);
  },

  // Match methods
  getMatches() {
    return this.get(this.KEYS.MATCHES) || [];
  },

  saveMatches(matches) {
    return this.set(this.KEYS.MATCHES, matches);
  },

  getMatchesByTournament(tournamentId) {
    const matches = this.getMatches();
    return matches.filter(m => m.tournamentId === tournamentId);
  },

  saveMatch(match) {
    const matches = this.getMatches();
    const index = matches.findIndex(m => m.id === match.id);
    
    if (index >= 0) {
      matches[index] = match;
    } else {
      matches.push(match);
    }
    
    return this.saveMatches(matches);
  },

  // Settings methods
  getSettings() {
    return this.get(this.KEYS.SETTINGS) || {};
  },

  saveSettings(settings) {
    return this.set(this.KEYS.SETTINGS, settings);
  }
};

// Initialize storage on load
Storage.init();
