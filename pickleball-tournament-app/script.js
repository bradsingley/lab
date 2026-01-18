const STORAGE_KEY = "pickleball-tournament-state";

const defaultState = {
  tournament: {
    name: "",
    location: "",
    date: "",
    courts: 4,
    format: "round-robin",
    pointsToWin: 11,
    winByTwo: true,
    notes: "",
  },
  players: [],
  matches: [],
  lastUpdated: null,
};

let state = loadState();

const elements = {
  saveStatus: document.getElementById("save-status"),
  summaryPlayers: document.getElementById("summary-players"),
  summaryMatches: document.getElementById("summary-matches"),
  summaryScored: document.getElementById("summary-scored"),
  summaryRounds: document.getElementById("summary-rounds"),
  scheduleProgress: document.getElementById("schedule-progress"),
  scheduleSummary: document.getElementById("schedule-summary"),
  scheduleList: document.getElementById("schedule-list"),
  scheduleEmpty: document.getElementById("schedule-empty"),
  standingsTable: document.getElementById("standings-table"),
  standingsEmpty: document.getElementById("standings-empty"),
  playerForm: document.getElementById("player-form"),
  playerName: document.getElementById("player-name"),
  playerError: document.getElementById("player-error"),
  playerList: document.getElementById("player-list"),
  playerCount: document.getElementById("player-count"),
};

const standingsBody = elements.standingsTable.querySelector("tbody");

init();

function init() {
  bindTournamentFields();
  bindPlayerForm();
  bindActions();
  bindScheduleEvents();
  renderAll();
}

function bindTournamentFields() {
  document.querySelectorAll("[data-field]").forEach((field) => {
    field.addEventListener("input", handleTournamentField);
    field.addEventListener("change", handleTournamentField);
  });
}

function bindPlayerForm() {
  elements.playerForm.addEventListener("submit", (event) => {
    event.preventDefault();
    addPlayer(elements.playerName.value);
  });
}

function bindActions() {
  document.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", (event) => {
      const action = event.currentTarget.dataset.action;
      if (action === "generate") {
        generateSchedule();
      }
      if (action === "reset-all") {
        resetTournament();
      }
      if (action === "clear-scores") {
        clearScores();
      }
      if (action === "reset-schedule") {
        resetSchedule();
      }
      if (action === "shuffle") {
        shufflePlayers();
      }
      if (action === "clear-players") {
        clearPlayers();
      }
    });
  });

  elements.playerList.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-remove]");
    if (!button) {
      return;
    }
    const index = Number(button.dataset.remove);
    if (Number.isNaN(index)) {
      return;
    }
    if (!confirmRosterReset()) {
      return;
    }
    const hadSchedule = state.matches.length > 0;
    state.players.splice(index, 1);
    if (hadSchedule) {
      state.matches = [];
    }
    saveState();
    renderPlayers();
    renderSchedule();
    renderSummary();
    renderStandings();
  });
}

function bindScheduleEvents() {
  elements.scheduleList.addEventListener("input", (event) => {
    const input = event.target;
    if (!input.classList.contains("score-input")) {
      return;
    }
    const matchId = input.dataset.matchId;
    const side = input.dataset.side;
    updateMatchScore(matchId, side, input.value);
  });

  elements.scheduleList.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-match-clear]");
    if (!button) {
      return;
    }
    const matchId = button.dataset.matchClear;
    clearMatchScores(matchId);
  });
}

function handleTournamentField(event) {
  const field = event.target.dataset.field;
  if (!field) {
    return;
  }

  let value = event.target.value;
  if (event.target.type === "checkbox") {
    value = event.target.checked;
  }

  if (event.target.type === "number") {
    if (event.target.value === "") {
      value = "";
    } else {
      value = Number(value);
      if (Number.isNaN(value)) {
        value = "";
      }
    }
  }

  state.tournament[field] = value;
  saveState();
  updateScheduleSummary();
  renderSummary();
}

function renderAll() {
  renderTournamentFields();
  renderPlayers();
  renderSchedule();
  renderStandings();
  renderSummary();
  updateSaveStatus();
}

function renderTournamentFields() {
  document.querySelectorAll("[data-field]").forEach((field) => {
    const key = field.dataset.field;
    const value = state.tournament[key];
    if (field.type === "checkbox") {
      field.checked = Boolean(value);
      return;
    }
    if (value === null || value === undefined) {
      field.value = "";
      return;
    }
    field.value = value;
  });
}

function addPlayer(name) {
  const trimmed = name.trim();
  elements.playerError.textContent = "";
  if (!trimmed) {
    elements.playerError.textContent = "Enter a player name before adding.";
    return;
  }
  const normalized = normalizeName(trimmed);
  if (state.players.some((player) => normalizeName(player) === normalized)) {
    elements.playerError.textContent = "That player is already on the roster.";
    return;
  }
  if (!confirmRosterReset()) {
    return;
  }
  const hadSchedule = state.matches.length > 0;
  state.players.push(trimmed);
  if (hadSchedule) {
    state.matches = [];
  }
  elements.playerName.value = "";
  saveState();
  renderPlayers();
  renderSummary();
  updateScheduleSummary();
  renderSchedule();
  renderStandings();
}

function renderPlayers() {
  elements.playerList.innerHTML = "";
  if (!state.players.length) {
    const empty = document.createElement("li");
    empty.className = "empty-state";
    empty.textContent = "No players yet. Add at least two to build a schedule.";
    elements.playerList.appendChild(empty);
  } else {
    state.players.forEach((player, index) => {
      const item = document.createElement("li");
      item.className = "player-card";

      const meta = document.createElement("div");
      meta.className = "player-meta";

      const badge = document.createElement("span");
      badge.className = "player-index";
      badge.textContent = String(index + 1);

      const name = document.createElement("span");
      name.textContent = player;

      meta.append(badge, name);

      const removeButton = document.createElement("button");
      removeButton.type = "button";
      removeButton.className = "ghost button-small";
      removeButton.dataset.remove = String(index);
      removeButton.textContent = "Remove";

      item.append(meta, removeButton);
      elements.playerList.appendChild(item);
    });
  }

  elements.playerCount.textContent = `${state.players.length} players`;
}

function shufflePlayers() {
  if (state.players.length < 2) {
    return;
  }
  if (!confirmRosterReset()) {
    return;
  }
  const shuffled = [...state.players].sort(() => Math.random() - 0.5);
  state.players = shuffled;
  state.matches = [];
  saveState();
  renderPlayers();
  renderSchedule();
  updateScheduleSummary();
  renderStandings();
  renderSummary();
}

function clearPlayers() {
  if (!state.players.length) {
    return;
  }
  if (!window.confirm("Clear all players and matches?")) {
    return;
  }
  state.players = [];
  state.matches = [];
  saveState();
  renderPlayers();
  renderSchedule();
  renderStandings();
  renderSummary();
}

function confirmRosterReset() {
  if (!state.matches.length) {
    return true;
  }
  return window.confirm(
    "Updating the roster will clear the current schedule and scores. Continue?"
  );
}

function generateSchedule() {
  elements.playerError.textContent = "";
  if (state.players.length < 2) {
    elements.playerError.textContent =
      "Add at least two players to generate a schedule.";
    return;
  }
  if (state.matches.length) {
    const confirmReset = window.confirm(
      "Regenerate the schedule and clear existing scores?"
    );
    if (!confirmReset) {
      return;
    }
  }

  const rounds = buildRoundRobin(state.players);
  const courts = resolveNumber(state.tournament.courts, 4, 1, 16);
  const matches = [];

  rounds.forEach((pairs, roundIndex) => {
    pairs.forEach((pair, matchIndex) => {
      const court = courts ? (matchIndex % courts) + 1 : null;
      const slot = courts ? Math.floor(matchIndex / courts) + 1 : 1;
      matches.push({
        id: makeId(),
        round: roundIndex + 1,
        court,
        slot,
        playerA: pair[0],
        playerB: pair[1],
        scoreA: null,
        scoreB: null,
      });
    });
  });

  state.matches = matches;
  saveState();
  renderSchedule();
  renderStandings();
  renderSummary();
}

function resetSchedule() {
  if (!state.matches.length) {
    return;
  }
  if (!window.confirm("Remove the current schedule?")) {
    return;
  }
  state.matches = [];
  saveState();
  renderSchedule();
  renderStandings();
  renderSummary();
}

function resetTournament() {
  if (!window.confirm("Reset the tournament and clear all data?")) {
    return;
  }
  state = cloneDefaultState();
  saveState();
  renderAll();
}

function clearScores() {
  if (!state.matches.length) {
    return;
  }
  state.matches = state.matches.map((match) => ({
    ...match,
    scoreA: null,
    scoreB: null,
  }));
  saveState();
  renderSchedule();
  renderStandings();
  renderSummary();
}

function clearMatchScores(matchId) {
  const match = state.matches.find((item) => item.id === matchId);
  if (!match) {
    return;
  }
  match.scoreA = null;
  match.scoreB = null;
  saveState();
  updateMatchCard(matchId);
  renderStandings();
  renderSummary();
}

function updateMatchScore(matchId, side, value) {
  const match = state.matches.find((item) => item.id === matchId);
  if (!match) {
    return;
  }
  const score = parseScore(value);
  if (side === "A") {
    match.scoreA = score;
  }
  if (side === "B") {
    match.scoreB = score;
  }
  saveState();
  updateMatchCard(matchId);
  renderStandings();
  renderSummary();
}

function renderSchedule() {
  elements.scheduleList.innerHTML = "";
  const rounds = groupMatchesByRound(state.matches);
  if (!state.matches.length) {
    elements.scheduleEmpty.textContent = state.players.length
      ? "Generate the schedule to see matchups."
      : "Add players to generate your first round robin schedule.";
    elements.scheduleEmpty.style.display = "block";
  } else {
    elements.scheduleEmpty.style.display = "none";
    rounds.forEach((matches, round) => {
      const roundCard = document.createElement("div");
      roundCard.className = "round-card";

      const header = document.createElement("div");
      header.className = "round-header";

      const title = document.createElement("h3");
      title.textContent = `Round ${round}`;

      const subtitle = document.createElement("span");
      subtitle.className = "helper";
      subtitle.textContent = `${matches.length} matches`;

      header.append(title, subtitle);

      const grid = document.createElement("div");
      grid.className = "match-grid";

      matches.forEach((match) => {
        grid.appendChild(renderMatchCard(match));
      });

      roundCard.append(header, grid);
      elements.scheduleList.appendChild(roundCard);
    });
  }
  updateScheduleSummary();
  updateProgress();
}

function renderMatchCard(match) {
  const card = document.createElement("div");
  card.className = "match-card";
  card.dataset.matchId = match.id;

  const meta = document.createElement("div");
  meta.className = "match-meta";

  const metaLeft = document.createElement("span");
  metaLeft.textContent = buildMatchLabel(match);

  const status = document.createElement("span");
  status.className = "match-status";
  status.textContent = matchHasScores(match) ? "Scored" : "Awaiting scores";

  meta.append(metaLeft, status);

  const playerA = renderPlayerRow(match, "A");
  const playerB = renderPlayerRow(match, "B");

  const actions = document.createElement("div");
  actions.className = "match-actions";
  const clearButton = document.createElement("button");
  clearButton.type = "button";
  clearButton.className = "ghost button-small";
  clearButton.dataset.matchClear = match.id;
  clearButton.textContent = "Clear scores";
  actions.appendChild(clearButton);

  card.append(meta, playerA, playerB, actions);
  updateMatchCard(match.id, card, true);
  return card;
}

function renderPlayerRow(match, side) {
  const row = document.createElement("div");
  row.className = "player-row";
  row.dataset.side = side;

  const name = document.createElement("span");
  name.textContent = side === "A" ? match.playerA : match.playerB;

  const input = document.createElement("input");
  input.type = "number";
  input.min = "0";
  input.className = "score-input";
  input.dataset.matchId = match.id;
  input.dataset.side = side;
  input.value =
    side === "A"
      ? match.scoreA ?? ""
      : match.scoreB ?? "";

  row.append(name, input);
  return row;
}

function updateMatchCard(matchId, root = null, skipProgress = false) {
  const match = state.matches.find((item) => item.id === matchId);
  if (!match) {
    return;
  }
  const card =
    root || elements.scheduleList.querySelector(`[data-match-id="${matchId}"]`);
  if (!card) {
    return;
  }
  const winner = getWinner(match);
  card.querySelectorAll(".player-row").forEach((row) => {
    const side = row.dataset.side;
    row.classList.toggle("winner", side === winner);
  });
  const status = card.querySelector(".match-status");
  if (status) {
    status.textContent = matchHasScores(match) ? "Scored" : "Awaiting scores";
  }
  if (!skipProgress) {
    updateProgress();
  }
}

function renderStandings() {
  standingsBody.innerHTML = "";
  if (!state.players.length) {
    elements.standingsEmpty.textContent =
      "Add players to start tracking standings.";
    elements.standingsEmpty.style.display = "block";
    return;
  }

  const standings = computeStandings(state.players, state.matches);
  standings.forEach((row) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(row.name)}</td>
      <td>${row.matches}</td>
      <td>${row.wins}</td>
      <td>${row.losses}</td>
      <td>${row.ties}</td>
      <td>${row.pointsFor}</td>
      <td>${row.pointsAgainst}</td>
      <td>${row.pointDiff}</td>
      <td>${row.winPct}</td>
    `;
    standingsBody.appendChild(tr);
  });
  elements.standingsEmpty.style.display = "none";
}

function renderSummary() {
  const totalMatches = state.matches.length;
  const scoredMatches = state.matches.filter(matchHasScores).length;
  const rounds = new Set(state.matches.map((match) => match.round)).size;

  elements.summaryPlayers.textContent = String(state.players.length);
  elements.summaryMatches.textContent = String(totalMatches);
  elements.summaryScored.textContent = `${scoredMatches} scored`;
  elements.summaryRounds.textContent = String(rounds);
  elements.scheduleProgress.textContent = `${scoredMatches} of ${totalMatches}`;
}

function updateScheduleSummary() {
  const players = state.players.length;
  const totalMatches = state.matches.length;
  const rounds = new Set(state.matches.map((match) => match.round)).size;
  const courts = resolveNumber(state.tournament.courts, 4, 1, 16);
  const points = resolveNumber(state.tournament.pointsToWin, 11, 1, 99);
  const winByTwo = state.tournament.winByTwo ? ", win by 2" : "";

  if (!totalMatches) {
    elements.scheduleSummary.textContent =
      "Set players, then generate a round robin schedule to begin scoring.";
    return;
  }

  elements.scheduleSummary.textContent =
    `Round robin for ${players} players, ${rounds} rounds, ` +
    `${totalMatches} matches across ${courts} courts. ` +
    `Games to ${points} points${winByTwo}.`;
}

function updateSaveStatus() {
  if (!state.lastUpdated) {
    elements.saveStatus.textContent = "Changes are not saved yet.";
    return;
  }
  const timestamp = new Date(state.lastUpdated);
  if (Number.isNaN(timestamp.getTime())) {
    elements.saveStatus.textContent = "Changes are saved locally.";
    return;
  }
  const formatted = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(timestamp);
  elements.saveStatus.textContent = `Saved at ${formatted}.`;
}

function updateProgress() {
  const totalMatches = state.matches.length;
  const scoredMatches = state.matches.filter(matchHasScores).length;
  elements.scheduleProgress.textContent = `${scoredMatches} of ${totalMatches}`;
  elements.summaryMatches.textContent = String(totalMatches);
  elements.summaryScored.textContent = `${scoredMatches} scored`;
}

function computeStandings(players, matches) {
  const table = new Map();
  players.forEach((player) => {
    table.set(player, {
      name: player,
      matches: 0,
      wins: 0,
      losses: 0,
      ties: 0,
      pointsFor: 0,
      pointsAgainst: 0,
      pointDiff: 0,
      winPct: "0.000",
    });
  });

  matches.forEach((match) => {
    if (!matchHasScores(match)) {
      return;
    }
    const rowA = table.get(match.playerA);
    const rowB = table.get(match.playerB);
    if (!rowA || !rowB) {
      return;
    }
    rowA.matches += 1;
    rowB.matches += 1;
    rowA.pointsFor += match.scoreA;
    rowA.pointsAgainst += match.scoreB;
    rowB.pointsFor += match.scoreB;
    rowB.pointsAgainst += match.scoreA;

    if (match.scoreA === match.scoreB) {
      rowA.ties += 1;
      rowB.ties += 1;
    } else if (match.scoreA > match.scoreB) {
      rowA.wins += 1;
      rowB.losses += 1;
    } else {
      rowB.wins += 1;
      rowA.losses += 1;
    }
  });

  table.forEach((row) => {
    row.pointDiff = row.pointsFor - row.pointsAgainst;
    row.winPct =
      row.matches > 0 ? (row.wins / row.matches).toFixed(3) : "0.000";
  });

  return Array.from(table.values()).sort((a, b) => {
    if (b.wins !== a.wins) {
      return b.wins - a.wins;
    }
    if (b.pointDiff !== a.pointDiff) {
      return b.pointDiff - a.pointDiff;
    }
    if (b.pointsFor !== a.pointsFor) {
      return b.pointsFor - a.pointsFor;
    }
    return a.name.localeCompare(b.name);
  });
}

function buildRoundRobin(players) {
  const roster = [...players];
  if (roster.length < 2) {
    return [];
  }
  if (roster.length % 2 !== 0) {
    roster.push("BYE");
  }

  const rounds = roster.length - 1;
  const half = roster.length / 2;
  const schedule = [];
  let rotation = roster.slice();

  for (let round = 0; round < rounds; round += 1) {
    const pairs = [];
    for (let index = 0; index < half; index += 1) {
      const playerA = rotation[index];
      const playerB = rotation[rotation.length - 1 - index];
      if (playerA === "BYE" || playerB === "BYE") {
        continue;
      }
      if (round % 2 === 0) {
        pairs.push([playerA, playerB]);
      } else {
        pairs.push([playerB, playerA]);
      }
    }
    schedule.push(pairs);

    const fixed = rotation[0];
    const rest = rotation.slice(1);
    rest.unshift(rest.pop());
    rotation = [fixed, ...rest];
  }

  return schedule;
}

function groupMatchesByRound(matches) {
  const grouped = new Map();
  matches.forEach((match) => {
    if (!grouped.has(match.round)) {
      grouped.set(match.round, []);
    }
    grouped.get(match.round).push(match);
  });
  return grouped;
}

function buildMatchLabel(match) {
  const labels = [];
  if (match.court) {
    labels.push(`Court ${match.court}`);
  }
  if (match.slot && match.slot > 1) {
    labels.push(`Slot ${match.slot}`);
  }
  if (!labels.length) {
    labels.push("Open court");
  }
  return labels.join(" | ");
}

function matchHasScores(match) {
  return Number.isFinite(match.scoreA) && Number.isFinite(match.scoreB);
}

function getWinner(match) {
  if (!matchHasScores(match)) {
    return null;
  }
  if (match.scoreA === match.scoreB) {
    return null;
  }
  return match.scoreA > match.scoreB ? "A" : "B";
}

function parseScore(value) {
  if (value === "") {
    return null;
  }
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }
  return Math.floor(parsed);
}

function resolveNumber(value, fallback, min, max) {
  if (value === "" || value === null || value === undefined) {
    return fallback;
  }
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.min(Math.max(Math.round(parsed), min), max);
}

function normalizeName(value) {
  return value.trim().toLowerCase();
}

function makeId() {
  if (window.crypto && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `match-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function saveState() {
  state.lastUpdated = new Date().toISOString();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    elements.saveStatus.textContent =
      "Local storage is unavailable. Changes may not persist.";
    return;
  }
  updateSaveStatus();
}

function loadState() {
  const fallback = cloneDefaultState();
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return fallback;
    }
    const parsed = JSON.parse(stored);
    return {
      ...fallback,
      ...parsed,
      tournament: {
        ...fallback.tournament,
        ...(parsed.tournament || {}),
      },
      players: Array.isArray(parsed.players) ? parsed.players : [],
      matches: Array.isArray(parsed.matches) ? parsed.matches : [],
    };
  } catch (error) {
    return fallback;
  }
}

function cloneDefaultState() {
  return JSON.parse(JSON.stringify(defaultState));
}
