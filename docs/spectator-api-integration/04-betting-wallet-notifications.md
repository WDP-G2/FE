# Spectator Betting, Wallet, Notifications

## Betting

- `/spectator/betting` lists `GET /users/me/bettable-races`.
- Each open market displays tournament, race, min/max stake, note, and options.
- Placing a bet sends `POST /races/{raceId}/bets` with `participantId` and `stakeAmount`.
- After success, refresh bet history and wallet cache.

## Bet History

- `/spectator/bets` loads `GET /users/me/bets`.
- Show status, stake, potential payout, settled amounts, horse, race, placed date.
- Detail uses `GET /bets/{id}` if a detail view is later added.

## Wallet

- `/spectator/wallet` reuses `WalletPanel walletMode="user"`.
- Transaction filters should include bet stake, bet payout, refunds, deposits, withdrawals.

## Notifications

- `/spectator/notifications` loads notifications with `GET /notifications`.
- Tabs: all and unread.
- Actions: mark one read, mark all read.
- Header unread badge uses `GET /notifications/unread-count`.

## Acceptance

- Closed or unavailable markets are not presented as placeable.
- Insufficient balance or backend validation errors surface as toast/error text.
- Marking notifications read updates both list state and unread count.
