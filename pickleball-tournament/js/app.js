/**
 * Main Application Controller
 */

const App = {
  currentView: 'dashboard',
  currentTournament: null,
  currentMatch: null,

  /**
   * Initialize the application
   */
  init() {
    this.bindEvents();
    this.loadSampleData();
    this.updateDashboard();
    this.showView('dashboard');
  },

  /**
   * Bind all event listeners
   */
  bindEvents() {
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const view = e.target.dataset.view;
        this.showView(view);
      });
    });

    // New Tournament Button
    document.getElementById('new-tournament-btn')?.addEventListener('click', () => {
      this.openModal('tournament-modal');
    });

    // Add Player Button
    document.getElementById('add-player-btn')?.addEventListener('click', () => {
      this.openModal('player-modal');
    });

    // Save Tournament
    document.getElementById('save-tournament')?.addEventListener('click', () => {
      this.saveTournament();
    });

    // Save Player
    document.getElementById('save-player')?.addEventListener('click', () => {
      this.savePlayer();
    });

    // Save Score
    document.getElementById('save-score')?.addEventListener('click', () => {
      this.saveScore();
    });

    // Modal close buttons
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal');
        if (modal) this.closeModal(modal.id);
      });
    });

    // Close modals on backdrop click
    document.querySelectorAll('.modal').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.closeModal(modal.id);
      });
    });

    // Search and filters
    document.getElementById('tournament-search')?.addEventListener('input', 
      Utils.debounce(() => this.filterTournaments(), 300)
    );
    document.getElementById('tournament-status-filter')?.addEventListener('change', 
      () => this.filterTournaments()
    );
    document.getElementById('tournament-format-filter')?.addEventListener('change', 
      () => this.filterTournaments()
    );
    document.getElementById('player-search')?.addEventListener('input', 
      Utils.debounce(() => this.filterPlayers(), 300)
    );
    document.getElementById('player-skill-filter')?.addEventListener('change', 
      () => this.filterPlayers()
    );

    // Schedule date navigation
    document.getElementById('prev-day')?.addEventListener('click', () => this.changeScheduleDate(-1));
    document.getElementById('next-day')?.addEventListener('click', () => this.changeScheduleDate(1));

    // Delegate events for dynamic content
    document.addEventListener('click', (e) => {
      // View bracket button
      if (e.target.classList.contains('view-bracket-btn')) {
        const tournamentId = e.target.dataset.tournamentId;
        this.showBracket(tournamentId);
      }

      // Manage tournament button
      if (e.target.classList.contains('manage-btn')) {
        const tournamentId = e.target.dataset.tournamentId;
        this.manageTournament(tournamentId);
      }

      // Bracket match click (for scoring)
      if (e.target.closest('.bracket-match')) {
        const matchEl = e.target.closest('.bracket-match');
        const matchId = matchEl.dataset.matchId;
        this.openScoreModal(matchId);
      }
    });
  },

  /**
   * Show a view
   */
  showView(viewName) {
    // Update nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === viewName);
    });

    // Show/hide views
    document.querySelectorAll('.view').forEach(view => {
      view.classList.toggle('active', view.id === `${viewName}-view`);
    });

    this.currentView = viewName;

    // Load view data
    switch (viewName) {
      case 'dashboard':
        this.updateDashboard();
        break;
      case 'tournaments':
        this.loadTournaments();
        break;
      case 'players':
        this.loadPlayers();
        break;
      case 'schedule':
        this.loadSchedule();
        break;
    }
  },

  /**
   * Update dashboard stats and lists
   */
  updateDashboard() {
    const tournaments = Tournament.getAll();
    const players = Players.getAll();
    
    // Update stats
    const activeTournaments = tournaments.filter(t => Tournament.getStatus(t) === 'active');
    document.getElementById('active-tournaments').textContent = activeTournaments.length;
    document.getElementById('total-players').textContent = players.length;
    
    // Calculate matches today
    let matchesToday = 0;
    let courtsActive = 0;
    
    activeTournaments.forEach(t => {
      if (t.schedule) {
        t.schedule.courts.forEach(court => {
          if (court.matches.length > 0) {
            courtsActive++;
            matchesToday += court.matches.filter(m => m.status === 'scheduled').length;
          }
        });
      }
    });
    
    document.getElementById('matches-today').textContent = matchesToday;
    document.getElementById('courts-active').textContent = courtsActive;

    // Update upcoming matches
    const upcomingContainer = document.getElementById('upcoming-matches');
    if (activeTournaments.length > 0 && activeTournaments[0].schedule) {
      upcomingContainer.innerHTML = Schedule.renderCompact(activeTournaments[0].schedule);
    } else {
      upcomingContainer.innerHTML = '<p class="empty-state">No upcoming matches</p>';
    }

    // Update recent results
    const resultsContainer = document.getElementById('recent-results');
    const completedMatches = this.getRecentCompletedMatches(tournaments);
    if (completedMatches.length > 0) {
      resultsContainer.innerHTML = completedMatches.map(match => `
        <div class="match-item">
          <div class="match-info">
            <div class="match-teams">${match.winner?.name || 'TBD'} def. ${match.loser?.name || 'TBD'}</div>
            <div class="match-tournament">${match.roundName || 'Match'}</div>
          </div>
          <div class="match-score">${match.scores.map(s => `${s.team1}-${s.team2}`).join(', ')}</div>
        </div>
      `).join('');
    } else {
      resultsContainer.innerHTML = '<p class="empty-state">No recent results</p>';
    }
  },

  /**
   * Get recent completed matches across all tournaments
   */
  getRecentCompletedMatches(tournaments) {
    const matches = [];
    
    tournaments.forEach(t => {
      if (t.bracket?.rounds) {
        t.bracket.rounds.forEach(round => {
          round.matches.forEach(match => {
            if (match.status === 'completed' && match.scores?.length > 0) {
              matches.push({ ...match, roundName: round.name, tournamentName: t.name });
            }
          });
        });
      }
    });
    
    // Sort by completion time (most recent first) and take top 5
    return matches
      .sort((a, b) => new Date(b.completedAt || 0) - new Date(a.completedAt || 0))
      .slice(0, 5);
  },

  /**
   * Load tournaments list
   */
  loadTournaments() {
    const tournaments = Tournament.getAll();
    const container = document.getElementById('tournaments-list');
    container.innerHTML = Tournament.renderList(tournaments);
  },

  /**
   * Filter tournaments based on search and filters
   */
  filterTournaments() {
    const search = document.getElementById('tournament-search')?.value || '';
    const status = document.getElementById('tournament-status-filter')?.value || '';
    const format = document.getElementById('tournament-format-filter')?.value || '';
    
    const filtered = Tournament.filter({ search, status, format });
    const container = document.getElementById('tournaments-list');
    container.innerHTML = Tournament.renderList(filtered);
  },

  /**
   * Load players list
   */
  loadPlayers() {
    const players = Players.getAll();
    const container = document.getElementById('players-list');
    container.innerHTML = Players.renderList(players);
  },

  /**
   * Filter players based on search and filters
   */
  filterPlayers() {
    const search = document.getElementById('player-search')?.value || '';
    const skill = document.getElementById('player-skill-filter')?.value || '';
    
    let players = Players.getAll();
    
    if (search) {
      players = Players.search(search);
    }
    
    if (skill) {
      players = players.filter(p => p.skillLevel === skill);
    }
    
    const container = document.getElementById('players-list');
    container.innerHTML = Players.renderList(players);
  },

  /**
   * Load schedule view
   */
  loadSchedule() {
    const tournaments = Tournament.filter({ status: 'active' });
    const container = document.getElementById('schedule-grid');
    
    if (tournaments.length === 0) {
      container.innerHTML = '<p class="empty-state">No active tournaments with schedules.</p>';
      return;
    }
    
    // Show schedule for first active tournament
    const tournament = tournaments[0];
    if (tournament.schedule) {
      container.innerHTML = Schedule.render(tournament.schedule);
    } else {
      // Generate schedule if needed
      const schedule = Schedule.generate(tournament);
      if (schedule) {
        Tournament.update(tournament.id, { schedule });
        container.innerHTML = Schedule.render(schedule);
      } else {
        container.innerHTML = '<p class="empty-state">No matches to schedule.</p>';
      }
    }
  },

  /**
   * Open a modal
   */
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  },

  /**
   * Close a modal
   */
  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  },

  /**
   * Save new tournament
   */
  saveTournament() {
    const form = document.getElementById('tournament-form');
    const data = {
      name: document.getElementById('tournament-name').value,
      startDate: document.getElementById('tournament-date').value,
      endDate: document.getElementById('tournament-end-date').value,
      format: document.getElementById('tournament-format').value,
      type: document.getElementById('tournament-type').value,
      skillLevel: document.getElementById('tournament-skill').value,
      courts: document.getElementById('tournament-courts').value,
      location: document.getElementById('tournament-location').value,
      description: document.getElementById('tournament-description').value
    };
    
    // Validate required fields
    if (!data.name || !data.startDate || !data.format || !data.type) {
      Utils.showToast('Please fill in all required fields', 'error');
      return;
    }
    
    const tournament = Tournament.create(data);
    Utils.showToast('Tournament created successfully!', 'success');
    
    // Reset form and close modal
    form.reset();
    this.closeModal('tournament-modal');
    
    // Refresh tournaments list
    if (this.currentView === 'tournaments') {
      this.loadTournaments();
    }
    
    this.updateDashboard();
  },

  /**
   * Save new player
   */
  savePlayer() {
    const form = document.getElementById('player-form');
    const formatCheckboxes = document.querySelectorAll('input[name="player-formats"]:checked');
    
    const data = {
      firstName: document.getElementById('player-first-name').value,
      lastName: document.getElementById('player-last-name').value,
      email: document.getElementById('player-email').value,
      phone: document.getElementById('player-phone').value,
      skillLevel: document.getElementById('player-skill').value,
      formats: Array.from(formatCheckboxes).map(cb => cb.value)
    };
    
    // Validate required fields
    if (!data.firstName || !data.lastName || !data.email) {
      Utils.showToast('Please fill in all required fields', 'error');
      return;
    }
    
    const player = Players.create(data);
    Utils.showToast('Player added successfully!', 'success');
    
    // Reset form and close modal
    form.reset();
    this.closeModal('player-modal');
    
    // Refresh players list
    if (this.currentView === 'players') {
      this.loadPlayers();
    }
    
    this.updateDashboard();
  },

  /**
   * Show bracket for tournament
   */
  showBracket(tournamentId) {
    const tournament = Tournament.getById(tournamentId);
    if (!tournament) return;
    
    this.currentTournament = tournament;
    
    // Generate bracket if not exists
    if (!tournament.bracket && tournament.teams.length >= 2) {
      Tournament.generateBracket(tournamentId);
    }
    
    const title = document.getElementById('bracket-modal-title');
    const container = document.getElementById('bracket-container');
    
    title.textContent = `${tournament.name} - Bracket`;
    
    if (tournament.bracket) {
      container.innerHTML = Bracket.render(tournament.bracket);
    } else if (tournament.teams.length < 2) {
      container.innerHTML = '<p class="empty-state">Need at least 2 teams to generate bracket. Add teams first.</p>';
    } else {
      container.innerHTML = '<p class="empty-state">No bracket available</p>';
    }
    
    this.openModal('bracket-modal');
  },

  /**
   * Manage tournament (placeholder for full management UI)
   */
  manageTournament(tournamentId) {
    const tournament = Tournament.getById(tournamentId);
    if (!tournament) return;
    
    // For now, show bracket. In a full app, this would open a management panel
    this.showBracket(tournamentId);
  },

  /**
   * Open score entry modal
   */
  openScoreModal(matchId) {
    if (!this.currentTournament?.bracket) return;
    
    // Find the match
    let match = null;
    for (const round of this.currentTournament.bracket.rounds) {
      match = round.matches.find(m => m.id === matchId);
      if (match) break;
    }
    
    if (!match || !match.team1 || !match.team2 || match.team1.isBye || match.team2.isBye) {
      return;
    }
    
    if (match.status === 'completed') {
      Utils.showToast('This match is already completed', 'info');
      return;
    }
    
    this.currentMatch = match;
    
    document.getElementById('score-team1').textContent = match.team1.name;
    document.getElementById('score-team2').textContent = match.team2.name;
    
    // Clear previous scores
    ['g1-t1', 'g1-t2', 'g2-t1', 'g2-t2', 'g3-t1', 'g3-t2'].forEach(id => {
      document.getElementById(id).value = '';
    });
    
    this.openModal('score-modal');
  },

  /**
   * Save match score
   */
  saveScore() {
    if (!this.currentTournament || !this.currentMatch) return;
    
    const scores = [];
    
    // Game 1
    const g1t1 = parseInt(document.getElementById('g1-t1').value);
    const g1t2 = parseInt(document.getElementById('g1-t2').value);
    if (!isNaN(g1t1) && !isNaN(g1t2)) {
      scores.push({ team1: g1t1, team2: g1t2 });
    }
    
    // Game 2
    const g2t1 = parseInt(document.getElementById('g2-t1').value);
    const g2t2 = parseInt(document.getElementById('g2-t2').value);
    if (!isNaN(g2t1) && !isNaN(g2t2)) {
      scores.push({ team1: g2t1, team2: g2t2 });
    }
    
    // Game 3 (if needed)
    const g3t1 = parseInt(document.getElementById('g3-t1').value);
    const g3t2 = parseInt(document.getElementById('g3-t2').value);
    if (!isNaN(g3t1) && !isNaN(g3t2)) {
      scores.push({ team1: g3t1, team2: g3t2 });
    }
    
    if (scores.length < 2) {
      Utils.showToast('Please enter at least 2 game scores', 'error');
      return;
    }
    
    // Validate scores
    for (const game of scores) {
      if (!Utils.isValidGameScore(game.team1, game.team2)) {
        Utils.showToast('Invalid game score. Games must be won by 2, reaching at least 11 points.', 'error');
        return;
      }
    }
    
    // Check for match winner
    const winner = Utils.getMatchWinner(scores);
    if (!winner) {
      Utils.showToast('Match not complete. Winner must win 2 games.', 'error');
      return;
    }
    
    // Record result
    Tournament.recordMatchResult(this.currentTournament.id, this.currentMatch.id, scores);
    Utils.showToast('Score saved!', 'success');
    
    // Refresh bracket
    this.currentTournament = Tournament.getById(this.currentTournament.id);
    document.getElementById('bracket-container').innerHTML = Bracket.render(this.currentTournament.bracket);
    
    this.closeModal('score-modal');
    this.currentMatch = null;
  },

  /**
   * Change schedule date
   */
  changeScheduleDate(direction) {
    // For now, just show current. Would need date state tracking for full implementation
    Utils.showToast(`Schedule view for ${direction > 0 ? 'next' : 'previous'} day`, 'info');
  },

  /**
   * Load sample data for demo
   */
  loadSampleData() {
    // Check if we already have data
    const tournaments = Tournament.getAll();
    const players = Players.getAll();
    
    if (tournaments.length > 0 || players.length > 0) return;
    
    // Add sample players
    const samplePlayers = [
      { firstName: 'Ben', lastName: 'Johns', email: 'ben@example.com', skillLevel: '5.0' },
      { firstName: 'Anna', lastName: 'Leigh', email: 'anna@example.com', skillLevel: '5.0' },
      { firstName: 'Tyson', lastName: 'McGuffin', email: 'tyson@example.com', skillLevel: '5.0' },
      { firstName: 'Catherine', lastName: 'Parenteau', email: 'catherine@example.com', skillLevel: '5.0' },
      { firstName: 'Zane', lastName: 'Navratil', email: 'zane@example.com', skillLevel: '4.5' },
      { firstName: 'Jessie', lastName: 'Irvine', email: 'jessie@example.com', skillLevel: '4.5' },
      { firstName: 'JW', lastName: 'Johnson', email: 'jw@example.com', skillLevel: '5.0' },
      { firstName: 'Lea', lastName: 'Jansen', email: 'lea@example.com', skillLevel: '4.5' }
    ];
    
    samplePlayers.forEach(p => Players.create(p));
    
    // Add sample tournament
    const tournament = Tournament.create({
      name: 'Winter Classic 2025',
      startDate: '2025-01-20',
      endDate: '2025-01-22',
      format: 'single',
      type: 'doubles',
      skillLevel: '4.5+',
      courts: 4,
      location: 'City Sports Complex',
      description: 'Annual winter pickleball championship'
    });
    
    // Add teams to tournament
    const teams = [
      { name: 'Johns/McGuffin', seed: 1 },
      { name: 'Navratil/Johnson', seed: 2 },
      { name: 'Waters/Parenteau', seed: 3 },
      { name: 'Irvine/Jansen', seed: 4 },
      { name: 'Smith/Brown', seed: 5 },
      { name: 'Wilson/Davis', seed: 6 },
      { name: 'Miller/Garcia', seed: 7 },
      { name: 'Anderson/Taylor', seed: 8 }
    ];
    
    teams.forEach(team => Tournament.addTeam(tournament.id, team));
    
    // Generate bracket
    Tournament.generateBracket(tournament.id);
  }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
