# Panda Legacy, combat and healing

## Install on Linux

Run each command separately from the project directory. Stop if a command fails.

```sh
git pull --ff-only origin main
npm run game:test
npm run build
node scripts/prepare-cloudflare-testnet.mjs
npx wrangler d1 migrations apply DB --remote --config dist/server/wrangler.production.json
npx wrangler deploy --config dist/server/wrangler.production.json
```

Apply migration `0015_panda_legacy.sql` before deploying the Worker. It adds a small table of distinct, access-verified visitor/owner pairs. No contract deployment or blockchain transaction is needed. Existing inventories, kill totals and currencies are preserved.

## Controls and behavior

- P or the Legacy toolbar icon: 14 achievements in six categories, progress, UTC unlock date, badges, claimable titles and small one-time Scrap rewards. Pin at most three goals. Click a claimed title to wear or hide it.
- Space / attack button: directional attack. Mouse aims independently of movement while over the canvas. With touch controls or no mouse aim, movement sets the facing direction.
- Rusty Fang/default/NFT weapon: blade, 112 range, 130 ms windup, 480 ms cooldown.
- Scrap Hammer: 135 range, wide arc, 400 ms windup, 950 ms cooldown, up to eight targets.
- Neon Blaster: 340 range, narrow aim, 160 ms windup, 700 ms cooldown, 12 energy per shot. Energy regenerates at 8/second of active simulation.
- Shift / dodge button: 30 stamina, 900 ms cooldown, approximately 110 distance with swept collision, first 180 ms protected. Stamina regenerates at 18/second of active simulation. Dodging interrupts a medkit and a pending weapon strike.
- Rat: telegraphed charge; slime: toxic splash at the marked position; bug: heavy close attack. Warnings lock the target before impact. Boss retains its warning ring.
- B / Stash: bandage heals 30 HP over six seconds, damage interrupts. Craft with Wrench for 8 Scrap. No item is consumed at full health.
- Q: medkit heals up to 50 HP after 1.5 seconds. Attack, dodge, damage or a scene change interrupts without consuming the medkit. Completed medkits have a six-second cooldown. Bandages occupy the same healing cooldown for their six seconds plus six seconds afterward.
- Clinic: full heal for 15 Scrap. Safe-zone rest: 2 HP/second after ten seconds without combat; no offline catch-up.

## Progress and reward rules

Lifetime kill totals carry over. Historical species, discovery and recipes cannot be reconstructed from old saves; those counters start with this update. Mastery achievements require a newly created sewer run with recorded damage/death history. Leaving and returning does not erase that history. Module achievements credit the player's successful upgrades, not simply owning a transferred parcel.

Social achievements require access approved by the server and count different registered owners/visitors. Self-visits and repeated visits do not count. Social achievements do not grant Scrap. Legacy points never enter the season leaderboard and are not an airdrop allocation.

Reward claims use the existing optimistic player revision and guarded economy transaction. A retry or stale concurrent request cannot claim twice. Titles and badges are in-game cosmetics, not NFTs. Placeable achievement decorations are not included in this release.

## Validation

`npm run game:test`: 58 tests covering existing gameplay plus windups, aiming, weapon types, stamina, collision, enemy warnings, healing, persistent achievements, stale reward writes and distinct social evidence. Strict TypeScript checks cover the pure game core and the Legacy panel; changed server/client files are syntax-compiled. Browser visual verification was blocked by a Chromium download timeout. A full application build and live Cloudflare gameplay test still need to run in the complete deployment checkout.
