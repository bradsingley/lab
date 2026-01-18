# Pickleball Tournament App Specs

## Goals

- Make it easy to set up a pickleball tournament in minutes.
- Generate a round robin schedule from a player roster.
- Track scores and show standings in real time.

## MVP user stories

- As an organizer, I can add and remove players to build a roster.
- As an organizer, I can generate a round robin schedule across courts.
- As a scorer, I can enter match scores and see standings update.
- As a coordinator, I can reset or clear scores without losing players.

## Data model

Tournament
- name
- location
- date
- courts
- format, round-robin only
- pointsToWin
- winByTwo
- notes

Player
- name

Match
- id
- round
- court
- slot
- playerA
- playerB
- scoreA
- scoreB

## Scheduling notes

- Uses the circle method to generate round robin rounds.
- Adds a BYE if the roster is odd, skipping BYE matches.
- Court and slot labels are assigned by index and court count.

## Future ideas

- Export schedule to CSV or print format.
- Add single elimination or pool play formats.
- Support doubles teams and player pairings.
