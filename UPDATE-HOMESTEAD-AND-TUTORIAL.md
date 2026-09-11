# Homestead, visits and tutorial update

Apply this update over the latest in-game parcel version. It adds migration `0013_productive_katie_power.sql`. All interface text is English.

## Install and publish on your Cloudflare account

1. Back up your local project and your production D1 database before applying changes.
2. Extract the ZIP into your existing project folder. Merge folders and replace matching files; do not delete existing directories.
3. Open the project terminal in VS Code.
4. Run each command below separately. Stop if a command fails.

```powershell
npm.cmd run build
node scripts/prepare-cloudflare-testnet.mjs
npx.cmd wrangler d1 migrations apply DB --remote --config dist/server/wrangler.production.json
npx.cmd wrangler deploy --config dist/server/wrangler.production.json
```

The migration prompt should show the new 0013 migration (plus any earlier migrations you have not yet applied). Confirm with Y to apply it to your configured production D1 database. This update does not deploy new blockchain contracts or spend test ETH.

5. Refresh your game with Ctrl+F5.
6. Open GETTING STARTED. Complete the steps in town and claim the Welcome Planter.
7. Enter your own parcel and open HOMESTEAD. Build a module using earned scrap.
8. Choose visitor access and save it. Another registered player can use TRAVEL > VISIT OTHER PARCELS. For INVITED mode enter exact usernames, separated by commas.

## Implemented gameplay

- Tutorial checks the server-stored character: Scrappy quest, first kill and scrap, equipped loot and either a permitted parcel visit or central town courtyard position. The courtyard option avoids requiring a land purchase to complete the tutorial.
- Welcome Planter is an ordinary, account-unlocked decoration automatically shown at the entrance of owned parcels. It is not an NFT or a tradable item. The reward can be claimed only once per account.
- Workshop, warehouse and garden have three levels. Upgrade costs are 80, 160 and 280 scrap. These utilities are displayed in available space on the parcel and persist with the land.
- Workshop crafting costs 14 / 10 / 6 scrap for one medkit at levels 1 / 2 / 3.
- Warehouse allows storing 200 / 400 / 600 scrap. Storage balance belongs to the account, not the land, and can be withdrawn from Getting Started even after selling the parcel. Stored scrap is outside the carried game balance.
- Garden harvest yields 2 / 4 / 6 circuits, at most once every 24 hours per parcel. The first harvest is available after construction. The cooldown persists across land transfers.
- Private, public and invited-only access is enforced by the parcel API. Default access is private. The directory lists public and invited parcels; current access is rechecked at entry.
- Invitations use registered usernames and reset when land ownership/version changes. Guests cannot edit, upgrade, harvest or place NFTs.
- Resource changes use guarded database batches and player revisions, so a conflicting game update does not partially charge a purchase.

## Validation and boundaries

TypeScript and production build checked. API tests cover access, ownership changes, exact upgrade/crafting costs, harvest cooldown, vault capacity and withdrawal after sale, insufficient funds, duplicate tutorial claims and concurrent update conflicts. Existing NFT placement tests also pass.

Not deployed automatically to your external Cloudflare account. Browser and real-wallet verification on your deployment remains necessary. Parcel visits do not yet show multiple visitors moving together in real time. City events, seasons redesign, achievements album and load testing were not part of this first three-feature update.
