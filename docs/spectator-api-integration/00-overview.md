# Spectator API Integration Overview

## Goal

Replace hard-coded spectator-facing data with backend APIs and add a dedicated `SPECTATOR` portal without changing `OWNER`, `JOCKEY`, `REFEREE`, or `ADMIN` flows.

## Scope

- Implement `/spectator/*` routes guarded by `RoleProtectedRoute allowedRoles={['SPECTATOR']}`.
- Keep legacy `/dashboard` and `/dashboard/wallet` paths as redirects for existing links.
- Use only backend APIs that already exist.
- Show `Predictions`, `Shop`, and `Inventory` as disabled/coming soon when backend quick links or feature flags mark them unavailable.

## Route Map

- `/spectator/dashboard`: dashboard summary, wallet snapshot, upcoming bet markets, recent activity.
- `/spectator/tournaments`: public tournament list.
- `/spectator/tournaments/:id`: public tournament detail, races, results, leaderboard, open bet market entry points.
- `/spectator/betting`: open bet markets and place bet workflow.
- `/spectator/bets`: current spectator bet history.
- `/spectator/wallet`: wallet, deposit, withdrawal, transaction history.
- `/spectator/notifications`: notification center.

## Hard-Code To Remove Or Isolate

- `DashboardPage.jsx` placeholder greeting.
- Spectator-facing mock tournament cards in `HomePage.jsx`.
- Spectator-facing ranking/statistic mock values in `HomePage.jsx`.
- Any spectator notification UI backed only by local arrays.

## Acceptance

- A logged-in `SPECTATOR` can use all `/spectator/*` routes with real API data.
- A non-spectator receives `/unauthorized`.
- Empty API responses render empty states, not mock fallback data.
