# Real-time multiplayer

Trash Town and its ordinary building interiors now use an authenticated WebSocket connection. One Cloudflare Durable Object coordinates the town, with a target tick interval of 100 ms and a limit of 30 connected accounts. All outdoor players see the same monsters, health, attacks, deaths and respawns. The Toxic Sewers remain the existing private solo instance. Parcel visits retain their existing presence polling and access controls.

## Gameplay

- Clients predict their own movement and reconcile against acknowledged server inputs. Other players' movement is interpolated and their walking, attack animation, title and HP are rendered.
- The server accepts bounded input frames and named actions, never player coordinates, damage, rewards, identity or inventory supplied by the client.
- Each town monster advances once per tick and targets the nearest eligible outdoor player. Adding players does not increase monster speed. Enemy attacks continue while players stand still or open menus.
- Players can damage the same enemy. The finishing blow receives the existing kill, quest credit and loot roll; rewards are not copied to every observer. There are no parties, shared contribution rewards or PvP in this change.
- Town chat posts retain the existing authenticated HTTP endpoint, persistence and three-second limit. Successful posts notify the world, which broadcasts the saved messages immediately. The initial history still loads over HTTP.
- A disconnected client stops predicting movement and reconnects with backoff. It discards unacknowledged inputs instead of replaying uncertain purchases, heals or claims. The next snapshot restores committed progress.
- Connecting the same account in another tab replaces the older socket. Session expiry, logout and bans are checked on every tick. A heartbeat removes abandoned sockets after 45 seconds.

## Authority and persistence

`packages/realtime/worker.ts` runs in the separate `trash-panda-realtime` Worker. Its public workers.dev and preview URLs are disabled. The application forwards `/api/game/socket` through the `REALTIME` service binding while preserving the original URL and cookies. Both Workers validate the session; a browser-supplied identity header grants nothing. The frontend route explicitly preserves the WebSocket when cloning the upstream response for framework header processing.

The Durable Object serializes simulation and connection operations. D1 remains the source of truth for player progression. Every tick reloads participating players, applies shared combat and commits the world, player states, economy records and season awards in one D1 batch. CHECK guards validate every expected player/world revision and session before any writes. A conflict with an HTTP purchase or homestead update rolls back the entire tick; the next tick reads the new state. No snapshot or input acknowledgement is sent before the commit succeeds.

The `realtime_world` row stores the common enemy state. Reconnecting or restarting the Worker cannot restore enemies from a player's old personal save. Empty worlds have no active simulation timer. Ordinary game mutations through the old `/api/game` POST path return 426 when the `REALTIME` binding exists, preventing a second combat authority.

NFT ownership is revalidated asynchronously with a maximum five-second cache. Saved NFT stats are never trusted. Unverified bonuses are disabled, and an NFT equip action waits for ownership verification. RPC timeouts cannot block the world tick. No new blockchain transaction, token or contract deployment is introduced.

## Local development

Node 22.13+ is required. Install dependencies and migrate the local database:

```sh
npm ci
npm run realtime:migrate:local
```

In the first terminal:

```sh
npm run realtime:dev
```

In the second terminal:

```sh
npm run dev
```

The local helper generates a configuration using the same placeholder D1 ID, persistence directory and service registry as the application. Do not run the production realtime configuration as the local companion: its production D1 ID would select a different local database. Wallet login is still required; there is no development identity bypass.

## Deploy to the existing Cloudflare account

These commands are for the account already hosting `trash-panda-united`, `trash-panda-testnet` and `tpu`. Run from the reviewed branch, stop if any command fails, and keep both Workers on the same D1 database. This implementation has not been deployed to the live account by the coding session.

```sh
npm ci
npm run typecheck
npm run game:test
npm run auth:test
npm run realtime:test
npm run build
npm run realtime:build
npm run realtime:integration:app
node scripts/prepare-cloudflare-testnet.mjs
npx wrangler d1 migrations apply DB --remote --config wrangler.realtime.json
npx wrangler deploy --config wrangler.realtime.json
npx wrangler deploy --config dist/server/wrangler.production.json
```

Migration `0017_realtime_world.sql` must be applied before starting the new server. Deploy the realtime Worker before the frontend containing its service binding. The new Worker uses Base Sepolia and the same production cookie-domain settings. If NFT collection configuration relies on `NFT_CONTRACT` or a private `BASE_RPC_URL` rather than the database collection setting/default public RPC, configure the corresponding environment settings on the realtime Worker as well. Do not commit private RPC credentials.

After deployment, connect two different registered wallets, enter town, check mutual movement and attack the same enemy. Confirm one reward, chat delivery, reconnect, logout, room transitions, crafting, NFT equipment and a solo dungeon. This local validation does not replace a live two-device check.

The 30-account ceiling is a safety limit, not a production load-test result. Tick frequency depends on database latency. The current persistence design reads and writes active player state every tick; measure D1 latency and usage before raising the limit or expanding to multiple zones. The Worker is active while sockets are connected, as described in [Cloudflare's WebSocket lifecycle documentation](https://developers.cloudflare.com/durable-objects/examples/websocket-server/).

## Validation recorded for this change

- 9 multiplayer engine/client tests: common kills, rewards, respawn, nearest target, simulation speed with 30 players, movement budget, scene validation, cooldowns, malformed inputs and reconnect without replay.
- Integration test uses real local workerd WebSockets, Durable Objects and D1. It runs both directly against the realtime Worker and through the built application with its service binding. It checks two accounts, shared enemy HP, one kill reward, duplicate sequence, concurrent D1 update preservation, live chat, session revocation, reconnect and malformed input rejection.
- 66 existing gameplay tests and 35 authentication/admin/wallet tests pass. TypeScript and the full frontend build pass; the realtime Worker bundles successfully.
- Six older tests in `scripts/homestead.test.mjs`, `scripts/leaderboard.test.mjs` and `scripts/nft-chat.test.mjs` fail identically on the untouched base commit `5fc536c`. These include a stale campaign fixture with 13 values for 17 columns and an old HP expectation. This change does not claim those suites pass.
- A rendered two-browser gameplay check was not completed: Chromium was unavailable and its download timed out. Network integration above uses actual WebSockets rather than browser mocks.
