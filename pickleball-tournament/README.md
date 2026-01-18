# Pickleball Tournament Manager

A comprehensive web application for managing pickleball tournaments, including bracket generation, player registration, match scheduling, and score tracking.

## Features

### Tournament Management
- **Multiple Formats**: Single Elimination, Double Elimination, Round Robin, Pool Play + Playoffs
- **Event Types**: Singles, Doubles, Mixed Doubles
- **Skill Divisions**: Support for 2.5 through 5.0+ skill levels
- **Automatic Bracket Generation**: Smart seeding with proper bye placement

### Player Management
- Player registration with skill level tracking
- Performance statistics (wins, losses, win rate)
- Tournament history and medal tracking
- Dynamic rating calculations

### Scheduling
- Multi-court optimization
- Player rest time enforcement
- Time slot management
- Real-time schedule updates

### Live Scoring
- Game-by-game score entry
- Automatic winner advancement
- Win-by-2 validation
- Match completion tracking

## Getting Started

### Quick Start

1. Open `index.html` in your web browser
2. The app loads with sample data for demonstration
3. Create tournaments, add players, and manage matches

### Using a Local Server (Recommended)

```bash
# Install dependencies
npm install

# Start local server
npm start
```

Then open http://localhost:3000 in your browser.

### Running Tests

```bash
npm test
```

## Project Structure

```
pickleball-tournament/
├── index.html              # Main HTML file
├── styles.css              # All CSS styles
├── package.json            # Project configuration
├── README.md               # This file
│
├── js/                     # JavaScript modules
│   ├── app.js              # Main application controller
│   ├── utils.js            # Utility functions
│   ├── storage.js          # Local storage management
│   ├── players.js          # Player management
│   ├── tournament.js       # Tournament management
│   ├── bracket.js          # Bracket generation
│   └── schedule.js         # Match scheduling
│
├── tests/                  # Test files
│   └── run-tests.js        # Test suite
│
└── .claude/                # AI Agent configurations
    └── agents/
        ├── tournament-bracket-designer.md
        ├── ui-ux-developer.md
        ├── match-scheduler.md
        ├── stats-analytics.md
        └── testing-qa.md
```

## AI Agent Configurations

This project includes several specialized AI agents to help with development:

### Tournament Bracket Designer
Use for: Bracket generation, seeding algorithms, bye placement, tournament format logic

```
Use when: Creating or modifying bracket structures, implementing new tournament formats,
debugging advancement logic
```

### UI/UX Developer
Use for: Interface design, responsive layouts, accessibility improvements, visual polish

```
Use when: Building new views, improving mobile experience, adding animations,
fixing styling issues
```

### Match Scheduler
Use for: Court assignments, time slot optimization, rest time management, schedule conflicts

```
Use when: Generating schedules, handling delays, optimizing court usage,
managing player availability
```

### Stats & Analytics
Use for: Player statistics, standings calculations, rating systems, leaderboards

```
Use when: Implementing stats tracking, calculating tiebreakers, building reports,
adding rating adjustments
```

### Testing & QA
Use for: Writing tests, debugging issues, edge case handling, quality assurance

```
Use when: Adding test coverage, investigating bugs, validating functionality,
improving reliability
```

## Technical Details

### Data Storage
All data is stored in browser localStorage:
- `pickleball_tournaments` - Tournament configurations and brackets
- `pickleball_players` - Player profiles and statistics
- `pickleball_matches` - Match history
- `pickleball_settings` - App configuration

### Bracket Formats

#### Single Elimination
- Standard knockout format
- Automatic bye placement for non-power-of-2 team counts
- Standard seeding (1v16, 8v9, etc.)

#### Double Elimination
- Winners and losers brackets
- Grand finals with bracket reset option

#### Round Robin
- Everyone plays everyone
- Circle method for balanced scheduling
- Tiebreaker support (H2H, point differential)

#### Pool Play + Playoffs
- Snake draft pool seeding
- Pool round robin followed by playoff bracket
- Top 2 from each pool advance

### Score Validation
- Games to 11, win by 2
- Support for extended games (12-10, 15-13, etc.)
- Best of 3 matches

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Use the appropriate AI agent for guidance
4. Write tests for new functionality
5. Submit a pull request

## License

MIT License - See LICENSE file for details

## Pickleball Resources

- [USA Pickleball](https://usapickleball.org/)
- [DUPR Rating System](https://mydupr.com/)
- [Official Rules](https://usapickleball.org/rules/)
