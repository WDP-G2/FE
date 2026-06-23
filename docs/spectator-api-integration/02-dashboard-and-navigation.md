# Spectator Dashboard And Navigation

## Goal

Create a dedicated spectator portal while preserving existing `/dashboard` links as compatibility redirects.

## Navigation

- Use a spectator layout with links to dashboard, tournaments, betting, bets, wallet, and notifications.
- Disabled quick links from BE (`Predictions`, `Shop`, `Inventory`) render as disabled actions.
- Header should show current user name/email and unread notification count when loaded.

## Dashboard Data Mapping

- Wallet cards use `wallet.availableBalance`, `wallet.holdBalance`, and `wallet.totalBalance`.
- Summary cards use `businessSummary.openTournamentCount`, `openBetMarketCount`, `totalBetStake`, `totalBetPayout`.
- Upcoming list maps `upcoming` items with `type`, `title`, `status`, `at`.
- Recent transactions and notifications use dashboard-provided lists for a compact preview.

## States

- Loading: skeleton/spinner.
- Empty: show useful empty messages for upcoming markets, transactions, and notifications.
- Error: show retry button and backend error message where possible.

## Acceptance

- `/dashboard` redirects a spectator to `/spectator/dashboard`.
- `/dashboard/wallet` redirects a spectator to `/spectator/wallet`.
- Dashboard never shows mock values after API load.
