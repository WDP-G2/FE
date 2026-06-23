# Spectator API Contracts

## Dashboard

- `GET /spectator/dashboard`
- Response: `DashboardResponse`
- FE maps `role`, `account`, `wallet`, `businessSummary`, `upcoming`, `quickLinks`, `featureFlags`, `recentTransactions`, `recentNotifications`.

Expected `businessSummary` keys currently returned by BE:

- `openTournamentCount`
- `openBetMarketCount`
- `betsByStatus`
- `totalBetStake`
- `totalBetPayout`
- `predictionEnabled`
- `marketplaceEnabled`

## Tournaments And Races

- `GET /tournaments`
- `GET /tournaments/{id}`
- `GET /tournaments/{id}/races`
- `GET /tournaments/{id}/leaderboard`
- `GET /races/{id}/results`

Reuse `tournamentService.mapTournament` for public tournament data. Race result and leaderboard responses should be displayed as returned, with defensive empty states.

## Betting

- `GET /races/{raceId}/bet-market`
- `GET /users/me/bettable-races`
- `POST /races/{raceId}/bets`
- `GET /users/me/bets`
- `GET /bets/{id}`

Place bet payload:

```json
{
  "participantId": 1,
  "stakeAmount": 100000
}
```

Validate `stakeAmount` client-side against `minStake` and `maxStake` when present, then rely on BE for final validation.

## Wallet

- `GET /wallets/me`
- `GET /wallets/me/transactions`
- `POST /wallets/me/deposit-orders`
- `GET /wallets/me/deposit-orders`
- `GET /wallets/me/deposit-orders/{id}`
- `POST /wallets/me/withdrawals`
- `GET /wallets/me/withdrawals`

Use existing `walletService` and `WalletPanel`.

## Notifications

- `GET /notifications?status=&page=&size=`
- `GET /notifications/unread-count`
- `PUT /notifications/{id}/read`
- `PUT /notifications/read-all`

Spring page responses must be normalized from `content` into a list and keep pagination metadata.

## Role Application And KYC

Existing FE service remains the source for:

- `POST /role-applications/spectator`
- `POST /role-applications/kyc/ocr`
- `POST /role-applications/kyc/{verificationId}/face-match`
- `GET /role-applications/me`
