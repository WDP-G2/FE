# Spectator Tournaments, Races, Results, Leaderboard

## Goal

Let spectators browse tournaments and race details using public backend APIs.

## Screens

- Tournament list: cards with name, status, dates, location, race count, registration count, prize pool, banner.
- Tournament detail: existing public detail content plus spectator actions.
- Race sections: schedule, participants when included by backend, public results, and bet market entry.
- Leaderboard: use `/tournaments/{id}/leaderboard`; show empty state when no confirmed result exists.

## API Usage

- List: `tournamentService.getPublicTournaments()`.
- Detail: `tournamentService.getPublicTournament(id)`.
- Races: `spectatorService.getTournamentRaces(id)`.
- Results: `spectatorService.getRaceResults(raceId)`.
- Leaderboard: `spectatorService.getTournamentLeaderboard(id)`.

## Home Page Cleanup

Replace spectator-facing hard-coded upcoming tournaments with the public tournament API. If the API is empty or errors, show an empty/error state instead of mock tournament cards.

## Acceptance

- Tournament cards link to `/spectator/tournaments/:id`.
- Detail page loads even when races, results, or leaderboard are empty.
- No owner/jockey/admin-only action appears in spectator pages.
