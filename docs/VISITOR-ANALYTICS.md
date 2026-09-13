# Visitor analytics

The admin console has a **Visitor analytics** tab. It provides 1/7/30/90-day presets, custom UTC dates, a daily chart with a numeric fallback, page views, unique browser IDs, tab sessions, signed-in visitors, visitors reaching `/game`, active viewing time, single-page session percentage, and activity in the last 60 seconds. Reports refresh every 30 seconds while visible.

Top-20 breakdowns cover public page categories, hostnames, referring hostnames, UTM sources/mediums/campaigns, country, device, browser and OS. The latest 100 page visits show the account username when authenticated, or a shortened anonymous identifier. CSV exports include summary, daily data, breakdowns and latest visits; cells escape spreadsheet formula prefixes.

## Collection and interpretation

- The root layout installs a small route-aware client tracker. Collection starts only after **Allow analytics**. **Privacy** reopens the choice; declining removes browser/session IDs and stops future collection. Previously stored records expire through retention. The `/privacy` page explains the feature.
- Do Not Track / Global Privacy Control, recognised bot user agents, administrator accounts, and `/admin` or `/api` paths are excluded. Metrics cover consenting visitors, not all network requests. Blocking extensions and failed requests also reduce coverage. This is not an identity lookup for anonymous people.
- A random localStorage UUID represents one browser on one origin. Landing/game subdomains and devices are counted separately. A sessionStorage UUID groups one tab's visits; the next route visit after 30 minutes without an event starts a new session. Clearing storage resets identity. Session counts and the single-page percentage describe only the selected report window.
- React pathname changes create page-view IDs. Query-only navigation is not another view. A signed-in/out identity change starts another view. Only public route categories are stored; numeric parcels become `/parcel/:id`, unknown paths become `/other`. URL parameters and fragments are stripped. UTM labels are the explicit exception, restricted and length-limited. Campaign values are from the current page URL, not a cross-page attribution model.
- Heartbeats run at 15-second intervals only on visible pages used within the last minute. They update an existing view, never create one. Active seconds are cumulative and server-capped by elapsed time, so retries do not double-count. Very short visits and the final interval before navigation may be undercounted. The online metric means a recorded signal in the last 60 seconds, independent of the selected historical date range. Reaching `/game` is a page metric, not verified gameplay or conversion.
- Country uses trusted Cloudflare `request.cf.country`, never a request-body location. Local development returns `Unknown`. Country may reflect a proxy/VPN. Device/browser/OS are coarse user-agent classifications. No raw IP, full UA, wallet address, full referrer or arbitrary URL query is stored in visit records.
- The public collector validates strict payloads (4 KB), origin, consent, UUIDs, page categories, and limits bursts to 360 events/minute per network-address hash (per visitor in local development). Abuse hashes rotate daily and expire after a minute. Counts are approximate; determined clients can submit fabricated events, so these statistics must not allocate airdrops or financial rewards.
- Report access uses the existing session-based `adminIdentity`, including ADMIN/SUPER_ADMIN. All responses use `Cache-Control: no-store`. Account identity comes from the session, never a submitted user ID.

## Storage and deployment

Migration `drizzle/0018_rare_angel.sql` adds `analytics_views` and `analytics_limits`, with time, visitor and session indexes. Retention removes visits older than 90 days during collection (bounded batches) and report reads. Expired abuse limits are removed during collection. With no traffic or report reads, cleanup resumes on the next request; there is no scheduled cleanup worker.

Deploy from the latest branch/main containing these files:

```sh
npm ci
npm run analytics:test
npm run typecheck
npm run build
node scripts/prepare-cloudflare-testnet.mjs
npx wrangler d1 migrations apply DB --remote --config wrangler.realtime.json
npx wrangler deploy --config dist/server/wrangler.production.json
```

Use the existing Cloudflare account credentials and DB binding. Apply migration before the frontend deploy. No new external analytics service or secret is needed. This change does not require redeploying the realtime worker. Records start after migration/deployment and visitor consent; historical traffic is not backfilled.

## Verification

`npm run analytics:test` exercises the real route handlers against SQLite with all project migrations: consent/origin/size/identity validation, path and referrer redaction, trusted country metadata, bot/privacy/admin exclusions, page-view retry deduplication, heartbeat ownership and elapsed-time bounds, administrator authorization, real session usernames, distinct counts, date validation, retention and burst limits. Build/typecheck verify frontend integration. A browser visual/interaction test has not been performed in this environment.
