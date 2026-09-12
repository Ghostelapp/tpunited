# Trash Panda United

A playable pixel-cyberpunk alpha with server-authoritative progression and Base blockchain ownership.

## Product

- Landing page, `/game`, land, marketplace, profile and community.
- One wallet-based SIWE login and HttpOnly session across the website and game. Private Sites access is a separate hosting gate; it does not create a game account.
- Movement, collision, combat, rewards, crafting, NPC shops, weapon upgrades, interiors, dungeon runs and daily quests validated by the server.
- Real-time town multiplayer over authenticated WebSockets: shared monsters, combat, interpolated players and live chat. Movable HUD panels and touch controls.
- Seasonal leaderboard with server-side points, daily caps, eligibility, exclusions and frozen exports.
- NFT armory: unique ERC-721 weapons and armor, rarity, artwork uploads, minimum level, minting from an authorized wallet, verified imports and actual combat bonuses.
- Private player support tickets and bug reports, screenshots, replies, administrator triage and internal notes.
- English player and administrator interfaces. User-generated text is displayed as submitted.

## Start locally

Use Node.js 22.13 or newer, as specified by the package engines.

```sh
npm ci
npm run realtime:migrate:local
npm run realtime:dev
# Keep the realtime server running; in another terminal:
npm run dev
npm run typecheck
npm run game:test
npm run build
```

The app requires Worker-compatible D1 bindings and applied migrations. Image and support attachment storage requires the BUCKET R2 binding. Wallet signatures remain required locally. Platform identity headers do not grant game access. See [AUTH_FLOW.md](AUTH_FLOW.md) and [AUTH_AUDIT.md](AUTH_AUDIT.md) for the existing authentication implementation and audit history.

`npm start` runs a local Wrangler preview of the built Worker; it does not deploy a production VPS service. The optional PostgreSQL blockchain indexer is separate from the game's D1 account/API backend. `docker compose --profile blockchain up -d` starts the optional indexer infrastructure.

## Guides

- [Support and bug reports](docs/SUPPORT.md)
- [NFT armory and chat](docs/NFT_ARMORY_AND_CHAT.md)
- [Seasonal leaderboard](docs/LEADERBOARD.md)
- [Administrator guide](docs/ADMIN_GUIDE.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Real-time multiplayer and deployment](docs/REALTIME-MULTIPLAYER.md)
- [Security](docs/SECURITY.md)

Some older technical documents and original requirements retain their original Polish wording. They are historical documentation, not player-facing interface strings. The current support guide is in English.

## Blockchain setup

Deployment manifests initially contain no contract addresses. Publishing the website does not deploy contracts or sign transactions. Local EVM tests do not establish a successful Base Sepolia deployment.

NFT-only setup is available through Admin → NFT armory. Deploy or connect a collection, authorize a minter wallet, publish a definition and mint to a registered player. Every blockchain write requires wallet confirmation. Each current item is a unique 1/1 ERC-721 token. See the armory guide for transfer and metadata limitations.

For the complete land, router and marketplace deployment:

1. Prepare private environment settings from `.env.example`.
2. Set `BLOCKCHAIN_NETWORK=base-sepolia`, `TREASURY_ADDRESS` and an HTTPS `METADATA_BASE_URL`, such as the public application origin followed by `/api/metadata`.
3. Set `DEPLOYER_PRIVATE_KEY` only in a private local environment or secret manager. Never send it through chat or commit it.
4. Fund the deployment wallet with test ETH.
5. Run `npm run contracts:compile`, then `npm run contracts:deploy`.
6. Configure the returned contract addresses and deployment block in the application's runtime settings.
7. Run `npm run contracts:verify`. This checks bytecode and receipts; explorer source verification is a separate operation.
8. Test purchases, approvals, listings, transfers, fees and ownership changes with separate wallets.

The mainnet deployment script requires `CONFIRM_MAINNET_DEPLOY=I_HAVE_REVIEWED_THE_CONTRACTS`. Changing an environment variable alone does not deploy contracts. Public metadata access and external security review remain necessary before a public production launch involving real funds.

## Tests and limitations

```sh
npm run auth:test
npm run game:test
node --test scripts/leaderboard.test.mjs scripts/nft-chat.test.mjs scripts/support.test.mjs
npm run contracts:test
```

Town multiplayer shares monsters and combat through one authoritative world, with up to 30 connected accounts and a target 100 ms tick interval. Toxic Sewers remain solo and parcel presence still uses its existing polling. Party rewards, guilds, PvP and a complete MMO remain future work. Multiplayer requires the separate realtime Worker, its service binding and migration 0017; see the deployment guide. Support is an authenticated in-app inbox without email notifications or anonymous account-recovery submissions. NFT equipment changes combat stats but does not replace the character's clothing/weapon sprite.

A source ZIP contains code and bundled static assets, not the production D1 database, uploaded R2 files, installed dependencies or private runtime credentials. Export production data and uploaded files separately when moving hosts.
