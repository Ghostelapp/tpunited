# Gameplay usability and balance update

- Melee automatically assists toward the nearest reachable enemy in weapon range. Blasters assist within a forward 120-degree cone. The server still checks range, windup and line of sight, and follows the selected target through the windup only while it remains reachable.
- Equipment drop chance: slime 12%, rat 16%, bug 22%. Ten percent of successful ordinary drops are rare; the rest are common. Garbage King guarantees an epic. Rolls use server-side cryptographic randomness instead of a predictable timestamp. Existing items are preserved.
- Each level adds 10 maximum HP, 2 stamina capacity, 2 energy capacity and 2 base damage. Every five levels above level 1 adds one armor. Level-up restores only newly gained HP capacity. Medkits restore 50% maximum HP; bandages restore 30% over six seconds. The clinic heals to the new maximum.
- Stash, crafting, shop, quest and daily reward actions retain their open window. Results appear inside the window. Healing continues when the stash is open. Homestead actions already retained their window; selecting a decoration for placement intentionally returns to the map.
- Town collision bounds now sit inside the rendered perimeter fence, including dodge. Old saves outside the fence are clamped inside on load/advance.
- Windows are narrower, have smaller content and scroll within the screen height. HUD layout recalculates on viewport and element resizing, clamps saved positions, and tries to avoid overlaps and the avatar's center area. Compact layouts also apply to parcel HUDs. On exceptionally crowded screens the packing algorithm minimizes overlap; players can still move HUDs manually.

## Deploy on Linux

Run each command separately and stop on error:

```sh
git pull --ff-only origin main
npm run game:test
npm run build
node scripts/prepare-cloudflare-testnet.mjs
npx wrangler deploy --config dist/server/wrangler.production.json
```

No new database migration or contract deployment is introduced by this update. The prior Panda Legacy migration 0015 must already be applied.

## Validation

66 gameplay, loot-table, healing, collision, concurrency and HUD-geometry tests pass using the portable TypeScript test loader. Strict TypeScript checks cover the game core and HUD geometry. A browser fixture using the actual Game, GearPanel and HUD-layout code verified crafting/equipping retain dialogs and HUD/dialog bounds at 1440×900, 390×844 and 844×390. Screenshots were inspected; the fixture substitutes authentication, network and artwork. This is not a live production test or a full application build.
