# Shared parcel visits — migration 0014

## Added
- Up to 30 other active visitors are rendered on the parcel canvas using existing character artwork, names and interpolated position snapshots.
- Presence refreshes every two seconds while the page is visible. Players expire from snapshots after ten seconds without an update. Network failures clear remote avatars and show a connection status.
- Each parcel has a separate chat. Reading and posting require a recent presence heartbeat and current access. Messages use registered names, a 400-character limit and a three-second per-account posting limit. The last 50 messages are displayed and storage is bounded to 200 per parcel.
- Invitations, private/public access and account bans are checked server-side on requests. Removed guests are filtered from new snapshots. Ownership-version changes isolate old chat and presence records.
- Chat focus pauses local movement. Building permissions remain in the existing owner-checked APIs.

## Boundaries
Presence is social and cosmetic: coordinates are finite and parcel-bounded, but collision and motion inside parcels remain client-side. Presence does not award resources or prove task completion. This is polling, not a shared authoritative combat server. One active parcel per account is supported; multiple tabs can replace each other's presence. No physical-device, browser multi-session or load testing was performed.

## Validation
TypeScript and production build pass. Eleven SQLite API tests pass across shared visits and existing Homestead behavior: invitation/revocation, bans, isolation, transfer-version reset, expired presence, spam/input limits, owner-only upgrades and balance consistency.

## External Cloudflare deployment
This update requires additive migration `0014_loud_jack_murdock.sql`. Back up the production D1 database before applying migrations. Domain binding still requires the active Cloudflare zone configured in the earlier update.

Run each command separately; stop on any failure:

```powershell
git pull --ff-only origin main
npm.cmd run build
node scripts/prepare-cloudflare-testnet.mjs
npx.cmd wrangler d1 migrations apply DB --remote --config dist/server/wrangler.production.json
npx.cmd wrangler deploy --config dist/server/wrangler.production.json
```

Verify with two separate accounts/browser profiles: owner opens their parcel, invites the guest, both enter and exchange messages. Revoke the invitation and verify the guest loses access on the next poll. Building controls remain owner-only. No migration, contract transaction or external deployment was run by the coding agent.
