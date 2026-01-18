# Pickleball Tournament Manager

## Project Overview

This is a web-based pickleball tournament management application built with vanilla HTML, CSS, and JavaScript. It provides comprehensive tournament management including bracket generation, player registration, match scheduling, and live scoring.

## Key Features

- **Tournament Formats**: Single Elimination, Double Elimination, Round Robin, Pool Play
- **Event Types**: Singles, Doubles, Mixed Doubles
- **Skill Divisions**: 2.5 through 5.0+ levels
- **Multi-court Scheduling**: Automatic court assignment and time optimization
- **Live Scoring**: Real-time score entry with validation

## Architecture

### Frontend (Vanilla JS)
- `index.html` - Single page application
- `styles.css` - All styling using CSS custom properties
- `js/` - Modular JavaScript files

### Data Storage
- Uses browser localStorage
- No backend required for basic functionality

### Key Modules
- `app.js` - Main application controller and event handling
- `bracket.js` - Bracket generation algorithms
- `tournament.js` - Tournament CRUD operations
- `schedule.js` - Match scheduling logic
- `players.js` - Player management
- `storage.js` - localStorage wrapper

## Development Workflow

### Running Locally
```bash
npm install
npm start  # Opens http://localhost:3000
```

### Running Tests
```bash
npm test
```

### Adding New Features
1. Identify which module the feature belongs to
2. Use the appropriate AI agent for guidance
3. Write tests in `tests/run-tests.js`
4. Update this documentation if needed

## Available AI Agents

Use these agents via the @ mention in Cursor:

| Agent | Use For |
|-------|---------|
| `tournament-bracket-designer` | Bracket logic, seeding, tournament formats |
| `ui-ux-developer` | Interface, styling, responsive design |
| `match-scheduler` | Scheduling, court optimization, conflicts |
| `stats-analytics` | Statistics, ratings, standings |
| `testing-qa` | Tests, debugging, edge cases |

## Code Conventions

- Use ES6+ JavaScript features
- Follow existing naming patterns
- Add JSDoc comments for functions
- Keep modules focused and single-purpose
- Use CSS custom properties for theming

## Pickleball Rules Reference

- Games to 11, win by 2
- Best of 3 games per match
- Switch sides at 6 points
- DUPR rating scale: 2.0 to 6.0+

## Common Tasks

### Add a new tournament format
1. Add format option to `tournament.js` create function
2. Implement bracket logic in `bracket.js`
3. Update UI in `index.html` and form handlers in `app.js`

### Add player statistics
1. Define stat structure in `players.js`
2. Update stat calculation in appropriate module
3. Add display in player card rendering

### Modify scheduling algorithm
1. Update `schedule.js` assignment logic
2. Consider rest time and court constraints
3. Test with various tournament sizes
