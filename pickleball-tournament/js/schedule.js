/**
 * Match Scheduling Module
 */

const Schedule = {
  /**
   * Generate schedule for tournament bracket
   */
  generate(tournament) {
    if (!tournament.bracket) return null;
    
    const config = {
      courts: tournament.courts,
      matchDuration: tournament.settings?.matchDuration || 45,
      warmupTime: tournament.settings?.warmupTime || 5,
      startTime: '08:00',
      endTime: '20:00',
      minRestMinutes: 30
    };
    
    const schedule = {
      tournamentId: tournament.id,
      generatedAt: new Date().toISOString(),
      courts: [],
      assignments: []
    };
    
    // Initialize courts
    for (let i = 1; i <= config.courts; i++) {
      schedule.courts.push({
        id: `C${i}`,
        name: `Court ${i}`,
        matches: []
      });
    }
    
    // Get all matches that need scheduling
    const matches = this.getSchedulableMatches(tournament.bracket);
    
    // Assign matches to courts and times
    this.assignMatches(schedule, matches, config, tournament.startDate);
    
    return schedule;
  },

  /**
   * Get all matches that can be scheduled (have both teams)
   */
  getSchedulableMatches(bracket) {
    if (!bracket || !bracket.rounds) return [];
    
    const matches = [];
    
    bracket.rounds.forEach(round => {
      round.matches.forEach(match => {
        if (match.team1 && match.team2 && !match.team1.isBye && !match.team2.isBye) {
          if (match.status !== 'completed') {
            matches.push({
              ...match,
              roundName: round.name,
              priority: round.roundNumber
            });
          }
        }
      });
    });
    
    // Sort by round (earlier rounds first)
    return matches.sort((a, b) => a.priority - b.priority);
  },

  /**
   * Assign matches to courts and times
   */
  assignMatches(schedule, matches, config, startDate) {
    const slotDuration = config.matchDuration + config.warmupTime;
    let currentTime = this.parseTime(config.startTime);
    const endTime = this.parseTime(config.endTime);
    
    // Track when each player is next available
    const playerAvailability = {};
    
    matches.forEach((match, index) => {
      // Find best court and time for this match
      const assignment = this.findBestSlot(
        schedule,
        match,
        currentTime,
        endTime,
        slotDuration,
        config.minRestMinutes,
        playerAvailability,
        startDate
      );
      
      if (assignment) {
        const court = schedule.courts.find(c => c.id === assignment.courtId);
        court.matches.push({
          matchId: match.id,
          scheduledTime: assignment.time,
          estimatedEnd: this.addMinutes(assignment.time, slotDuration),
          team1: match.team1,
          team2: match.team2,
          roundName: match.roundName,
          status: 'scheduled'
        });
        
        schedule.assignments.push({
          matchId: match.id,
          courtId: assignment.courtId,
          scheduledTime: assignment.time
        });
        
        // Update player availability
        const endTime = this.addMinutes(assignment.time, slotDuration);
        this.updatePlayerAvailability(playerAvailability, match, endTime, config.minRestMinutes);
      }
    });
    
    // Sort matches on each court by time
    schedule.courts.forEach(court => {
      court.matches.sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
    });
  },

  /**
   * Find best available slot for a match
   */
  findBestSlot(schedule, match, startTime, endTime, duration, restTime, availability, startDate) {
    // Get player IDs for rest time checking
    const playerIds = this.getPlayerIds(match);
    
    // Find earliest time when all players are available
    let earliestTime = startTime;
    playerIds.forEach(playerId => {
      if (availability[playerId]) {
        const availableAt = availability[playerId];
        if (availableAt > earliestTime) {
          earliestTime = availableAt;
        }
      }
    });
    
    // Round up to next 5-minute slot
    earliestTime = this.roundToSlot(earliestTime);
    
    // Find court with earliest available slot
    let bestAssignment = null;
    
    schedule.courts.forEach(court => {
      const courtEndTime = this.getCourtEndTime(court);
      let slotTime = courtEndTime > earliestTime ? courtEndTime : earliestTime;
      slotTime = this.roundToSlot(slotTime);
      
      if (!bestAssignment || slotTime < bestAssignment.time) {
        bestAssignment = {
          courtId: court.id,
          time: slotTime
        };
      }
    });
    
    return bestAssignment;
  },

  /**
   * Get player IDs from match
   */
  getPlayerIds(match) {
    const ids = [];
    
    if (match.team1?.players) {
      ids.push(...match.team1.players.map(p => p.id));
    } else if (match.team1?.id) {
      ids.push(match.team1.id);
    }
    
    if (match.team2?.players) {
      ids.push(...match.team2.players.map(p => p.id));
    } else if (match.team2?.id) {
      ids.push(match.team2.id);
    }
    
    return ids;
  },

  /**
   * Update player availability after match
   */
  updatePlayerAvailability(availability, match, endTime, restMinutes) {
    const playerIds = this.getPlayerIds(match);
    const availableAt = this.addMinutes(endTime, restMinutes);
    
    playerIds.forEach(id => {
      availability[id] = availableAt;
    });
  },

  /**
   * Get when a court's last match ends
   */
  getCourtEndTime(court) {
    if (court.matches.length === 0) return '08:00';
    
    const lastMatch = court.matches[court.matches.length - 1];
    return lastMatch.estimatedEnd || this.addMinutes(lastMatch.scheduledTime, 50);
  },

  /**
   * Parse time string to comparable format
   */
  parseTime(timeStr) {
    return timeStr;
  },

  /**
   * Add minutes to time string
   */
  addMinutes(timeStr, minutes) {
    const [hours, mins] = timeStr.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60);
    const newMins = totalMinutes % 60;
    return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}`;
  },

  /**
   * Round time to next 5-minute slot
   */
  roundToSlot(timeStr) {
    const [hours, mins] = timeStr.split(':').map(Number);
    const roundedMins = Math.ceil(mins / 5) * 5;
    const newHours = hours + Math.floor(roundedMins / 60);
    const newMins = roundedMins % 60;
    return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}`;
  },

  /**
   * Format time for display
   */
  formatTime(timeStr) {
    const [hours, mins] = timeStr.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${String(mins).padStart(2, '0')} ${period}`;
  },

  /**
   * Get matches for a specific date
   */
  getMatchesForDate(schedule, date) {
    if (!schedule) return [];
    
    const allMatches = [];
    schedule.courts.forEach(court => {
      court.matches.forEach(match => {
        allMatches.push({
          ...match,
          courtName: court.name,
          courtId: court.id
        });
      });
    });
    
    return allMatches.sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
  },

  /**
   * Reschedule match
   */
  reschedule(schedule, matchId, newCourtId, newTime) {
    // Remove from current court
    schedule.courts.forEach(court => {
      court.matches = court.matches.filter(m => m.matchId !== matchId);
    });
    
    // Update assignment
    const assignment = schedule.assignments.find(a => a.matchId === matchId);
    if (assignment) {
      assignment.courtId = newCourtId;
      assignment.scheduledTime = newTime;
    }
    
    // Add to new court (need to get match data from tournament)
    // This would need the match data to be passed or retrieved
    
    return schedule;
  },

  /**
   * Render schedule for display
   */
  render(schedule, tournaments) {
    if (!schedule || !schedule.courts) {
      return '<p class="empty-state">No schedule generated yet.</p>';
    }
    
    let html = '';
    
    schedule.courts.forEach(court => {
      html += `
        <div class="court-schedule">
          <div class="court-header">${court.name}</div>
          <div class="court-matches">
            ${court.matches.length === 0 
              ? '<p class="empty-state">No matches scheduled</p>'
              : court.matches.map(match => this.renderMatch(match)).join('')
            }
          </div>
        </div>
      `;
    });
    
    return html;
  },

  /**
   * Render single scheduled match
   */
  renderMatch(match) {
    const team1Name = match.team1?.name || 'TBD';
    const team2Name = match.team2?.name || 'TBD';
    
    return `
      <div class="scheduled-match" data-match-id="${match.matchId}">
        <div class="match-time">${this.formatTime(match.scheduledTime)}</div>
        <div class="match-details">
          <div class="match-teams">${team1Name} vs ${team2Name}</div>
          <div class="match-round">${match.roundName}</div>
        </div>
      </div>
    `;
  },

  /**
   * Render compact schedule view
   */
  renderCompact(schedule) {
    if (!schedule) return '';
    
    const allMatches = [];
    schedule.courts.forEach(court => {
      court.matches.forEach(match => {
        allMatches.push({ ...match, courtName: court.name });
      });
    });
    
    allMatches.sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
    
    return allMatches.slice(0, 5).map(match => `
      <div class="match-item">
        <div class="match-court">${match.courtName}</div>
        <div class="match-info">
          <div class="match-teams">${match.team1?.name || 'TBD'} vs ${match.team2?.name || 'TBD'}</div>
          <div class="match-tournament">${match.roundName}</div>
        </div>
        <div class="match-status">${this.formatTime(match.scheduledTime)}</div>
      </div>
    `).join('');
  }
};
