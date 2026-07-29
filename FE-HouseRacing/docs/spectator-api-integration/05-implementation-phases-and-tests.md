# Spectator Implementation Phases And Tests

## Phases

1. Add docs in `docs/spectator-api-integration`.
2. Add endpoint constants and spectator/betting/notification services.
3. Add spectator layout and guarded routes.
4. Implement dashboard, tournament list/detail, leaderboard/results.
5. Implement betting, bet history, wallet route, notification center.
6. Replace spectator-facing home page hard-code with API-backed data.

## Automated Checks

- `npm run lint`
- `npm run build`

## Manual Checks

- Login as `SPECTATOR` and confirm redirect to `/spectator/dashboard`.
- Dashboard loads real API data and handles empty lists.
- Tournament list/detail/races/leaderboard render from backend.
- Betting list loads, place bet validates min/max stake, success refreshes wallet/bets.
- Wallet deposit/withdrawal/transactions still work.
- Notifications unread count, mark read, and mark all read work.
- Non-spectator users cannot access `/spectator/*`.

## Known Backend Gaps

- Prediction, shop, and inventory APIs are not present in the current backend surface. FE must render these as unavailable until BE exposes real APIs.
