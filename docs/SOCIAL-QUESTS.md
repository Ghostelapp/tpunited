# Social quests — verified community missions

## Included

- Discord membership and role verification using OAuth2 `identify guilds.members.read`. The player joins the server, completes screening, then authorizes a check. Successful checks approve the mission immediately without moderator review.
- Server-verified player level and claimed Getting Started tutorial reward. The mission board checks up to five eligible game-progress missions once when opened; remaining missions have a check button.
- Manual proof review for X, Telegram, content competitions and tasks without an implemented provider integration. Opening a link never grants points.
- Search, status filters, completed/pending totals, linked Discord name, actionable feedback, resubmission after rejection and responsive cards.
- Admin creation/editing of draft verification rules. Launched rules remain immutable. Existing campaigns retain manual verification; create a new campaign to use an automatic rule.
- Community points remain campaign-specific. Season awards use the existing season rules and daily cap. No new token distribution or payment automation.

## Discord activation

1. Create an application in the Discord Developer Portal: https://discord.com/developers/applications
2. Register these exact OAuth2 redirect URLs:
   - `https://tpunited.xyz/api/social/discord/callback`
   - `https://game.tpunited.xyz/api/social/discord/callback`
3. Store the application ID and secret in the existing Cloudflare Worker. Run each command separately and paste the value into Wrangler's prompt, never into source control or chat:

```sh
npx wrangler secret put DISCORD_CLIENT_ID --name trash-panda-united
npx wrangler secret put DISCORD_CLIENT_SECRET --name trash-panda-united
```

4. In Admin → Social & airdrops, select Discord membership or Discord role. Enter the numeric server ID and, for a role quest, the numeric role ID (Discord Developer Mode → Copy ID). Set the task URL to the server invite, reward and time window. Save draft and launch.
5. Test with one real player: join server, complete screening, connect and verify. Repeat verification to confirm points stay unchanged. Try a player without the required role.

No bot installation is required for this OAuth member-read flow. The UI shows unavailable verification until both credentials exist. The code has been tested with mocked Discord responses; live OAuth requires the application configuration above.

## Safety and behavior

- One-time, ten-minute OAuth state bound to the current wallet session, user, campaign and origin. A cancelled/expired/replayed callback cannot grant points.
- Discord identities are unique across players. Reconnecting with a different Discord identity is rejected; identity recovery requires an operator review. No user-facing unlink that enables farming.
- Access tokens are used only inside the callback and are not saved or returned to the browser. Membership is checked at claim time, not continuously after award.
- Provider timeouts, rate limits, missing membership and pending screening never count as success. At most twelve quest actions per user per minute.
- Submission approval and capped season award share one database batch; unique submission/event keys prevent duplicate rewards. An audit entry records automatic approval.
- Tutorial and level requirements may be satisfied by progress earned before the campaign opens.

## Deployment

Run separately; stop on an error. Migration **0016_social_verification.sql is required before deploying this version**.

```sh
git pull --ff-only origin main
npm run social:test
npm run build
node scripts/prepare-cloudflare-testnet.mjs
npx wrangler d1 migrations apply DB --remote --config dist/server/wrangler.production.json
npx wrangler deploy --config dist/server/wrangler.production.json
```

## Validation

Ten tests exercise real route/service SQL against SQLite, with stubbed wallet identity and Discord transport: atomic rewards, season cap, rule validation, manual bypass rejection, membership screening, roles, identity uniqueness, outages, OAuth session binding, replay, expiry, tutorial claims and rate limiting. These do not replace a real wallet/OAuth end-to-end test.

Reference: https://docs.discord.com/developers/topics/oauth2 and https://docs.discord.com/developers/resources/user#get-current-user-guild-member

The actual mission component was checked in a browser fixture at 1440px and 390px: one automatic progress check, manual proof submission, completed filtering, and no horizontal overflow. Header, wallet session and network responses were mocked. Strict backend type checking passed with an authentication declaration stub; TSX syntax checks passed. A full production build and live Discord OAuth verification must be run from the complete deployment checkout.
