# Performance changes and deployment limits

## Implemented

- Normal game simulation packets are batched every 400 ms (up to 2.5/second rather than 8.33). User actions bypass this waiting period; the scheduler checks every 80 ms. Local movement prediction remains immediate. The server still validates movement time, collisions, combat, NFT ownership and rewards.
- Network failures use capped exponential backoff and a 10-second timeout. Retry packets retain their UUID. Conflicting state reloads the authoritative snapshot instead of retrying forever.
- Presence uses a dedicated authenticated endpoint, returning only names, positions and rooms. It does not hydrate NFTs or transmit inventories. Refresh is every 6 seconds; buildings are refreshed every fifth presence request. Hidden tabs do not poll presence or chat.
- Indoor idle characters use an 8-second heartbeat. Outdoor simulation remains at 400 ms; changing it to multi-second saves without a separate authoritative simulation would change combat behavior.
- Presence has an indexed timestamp query. Existing chat, wallet, NFT holder and leaderboard indexes were retained.
- World rendering skips offscreen buildings/decor before allocating their draw callbacks. Static terrain was already cached and remains cached. Hidden pages skip drawing. Only the currently visited interior is created and retained, instead of constructing all interiors on startup.
- Graphics settings: AUTO, PERFORMANCE (1x canvas), HIGH QUALITY (up to 2x), persisted as a device preference. Auto uses 1x on touch devices and up to 1.5x on other devices.
- Atlas/city lossless WebP totals 23,912,060 bytes versus 34,694,418 PNG bytes (31.1% reduction). Pixel equivalence was checked, including transparent RGB pixels. Original PNGs remain for compatibility; runtime atlas references use WebP.
- Equipment SVGs embed only their visible crop instead of repeating a whole atlas. Paths, framing and NFT-compatible self-contained SVG format remain unchanged. Original crop pixels were compared byte-for-byte.
- Idle chat polling backs off from 3 to 9 seconds, avoids concurrent requests and pauses when the page is hidden. This remains polling, not WebSocket delivery.

## Verified

`npm run typecheck`

`npm run game:test`

`node --test scripts/performance.test.mjs scripts/nft-chat.test.mjs`

Checks cover movement at the new cadence, idempotent retries, presence privacy/authentication, the presence query plan, NFT ownership and revocation, loot accounting, combat, quests and collisions. Local tests are not a measurement of production capacity or phone FPS.

## Load testing

Use an isolated staging deployment with its own database and dedicated test accounts. Log in normally to create one different session per account. Do not use real player accounts. Store the session cookies locally in an ignored `sessions.json` file: `[{"cookie":"__Host-tpu_session=..."}]`. Never share or commit cookies.

Run from the repository root, starting with 25 accounts:

```sh
node scripts/load-game.mjs --origin http://127.0.0.1:5173 --sessions sessions.json --players 25 --seconds 60
```

For a separately provisioned staging server, use its HTTPS origin and add `--allow-remote`. Repeat with 50, 100 and 200 distinct accounts, stopping when errors or unacceptable latency occur. The script reports request count, status codes and p50/p95/p99 HTTP latency. It runs normal idle simulation and presence traffic; it does not represent all combat, NFT RPC, chat or account flows. Measure those separately before claiming a supported concurrent-player count. Monitor actual D1 and Worker usage alongside the result.

## Remaining architecture work

The current Sites manifest provisions D1/R2, not a Durable Object namespace. No persistent in-memory game state, pretend WebSocket transport or external service dependency has been substituted. A full Durable Objects/WebSocket authoritative simulation requires a supported deployment binding, session revocation handling, durable checkpoints, recovery, replay protection and load tests. That migration is not active in this release. D1 continues to persist validated game packets.

Live NFT ownership validation remains fail-closed; it is not weakened with stale client-side ownership caching. RPC latency can therefore still affect equipped NFT actions.

A staging environment with independent authenticated accounts and production-equivalent Cloudflare resources is required to measure 25/50/100/200 real concurrent clients. No production load test or numeric capacity claim has been made.
