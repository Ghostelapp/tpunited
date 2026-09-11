# tpunited.xyz and game.tpunited.xyz

One existing Cloudflare Worker and the same DB/R2 bindings serve both hostnames.

| URL | Result |
| --- | --- |
| https://tpunited.xyz/ | Landing |
| https://game.tpunited.xyz/ | Game (internal rewrite to /game) |
| https://tpunited.xyz/game?parcel=15 | Redirect to game hostname, preserving query |
| /home on either production hostname | Landing on https://tpunited.xyz/ |

Other game-host routes, including API and account registration, remain on that host. Requests to API endpoints are same-origin, so no wildcard CORS is needed. Local/preview hosts retain their existing routes and /home returns to their own landing.

## Deployment

The domain must be an active zone in the same Cloudflare account as the existing Worker. If it is not, add tpunited.xyz to Cloudflare and set the registrar nameservers to the exact pair shown by Cloudflare. Preserve existing mail/DNS records. No nameservers or DNS records were changed by the coding agent.

Run each command separately from the project:

```powershell
git pull --ff-only origin main
npm.cmd run build
node scripts/prepare-cloudflare-testnet.mjs
npx.cmd wrangler deploy --config dist/server/wrangler.production.json
```

The preparation script declares two Custom Domains with custom_domain:true, plus AUTH_ORIGINS and AUTH_COOKIE_DOMAIN. Wrangler attaches the hostnames on deployment. Cloudflare provisions DNS and certificates. If an existing hostname record conflicts, inspect it before changing it; do not delete unrelated records. The preparation script retains the existing testnet DB and bucket. No migration is added.

## Authentication

On the two HTTPS production origins only, session cookies use __Secure-tpu_session with Domain=tpunited.xyz, Secure, HttpOnly, SameSite=Lax and Path=/. Challenge cookies remain host-only __Host cookies and SIWE verification stays bound to its originating hostname. POST Origin checks remain strict. AUTH_ORIGINS takes precedence over legacy AUTH_ORIGIN. Shared sessions authenticate against the same database; logout revokes the shared session server-side. Existing host-only sessions may require signing in again after this change. The old workers.dev origin is not in the production sign-in allowlist.

Only trusted applications should use sibling subdomains because domain cookies are sent to sibling hosts. Browser wallet connection permissions/storage are origin-specific: a transaction on the game origin may still ask to connect the wallet, even when the account session is already authenticated.

## Verification

27 local auth/domain tests passed, including signed session across origins, logout revocation, host-bound nonce, unauthorized origins, query preservation and unchanged local routing. TypeScript and production build pass. DNS activation, certificates and browser wallet flow require checking after the user deploys to their Cloudflare account.

Reference: https://developers.cloudflare.com/workers/configuration/routing/custom-domains/
