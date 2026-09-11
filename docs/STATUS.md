# Status implementacji

| Część | Stan |
|---|---|
| Landing pixel cyberpunk, mobile, regiony, roadmap | Zaimplementowane |
| Świat Trash Town, sprite animacje, kamera, kolizje | Zaimplementowane |
| Serwerowa walka, loot, trzy zadania, medkity, crafting, sklep NPC i ulepszanie broni | Zaimplementowane; testy logiki przechodzą |
| Postęp i konto | D1 + podpis SIWE + wspólna sesja HttpOnly |
| Profil, historia Scrap, czat, obecność | Zaimplementowane |
| Backend email/password | Usunięty; PostgreSQL służy wyłącznie opcjonalnemu indexerowi |
| LAND NFT, assets, router, marketplace | Kompilują się; 13 scenariuszy lokalnego EVM przechodzi |
| UI transakcji / allowance / explorer | Implementacja pod kontrakty z konfiguracji |
| Wdrożenie Base Sepolia | Brak portfela wdrożeniowego i finansowania testnet |
| Zakup Base Sepolia A → B → gra → budowanie | Niezweryfikowany, wymaga deploymentu |
| Indexer | Implementacja D1 na żądanie + proces PostgreSQL; brak live-chain testu |
| Budowanie | Grid, place/move/rotate/remove, koszty i owner-check; wymaga zakupionego LAND |
| Handel | LAND list/buy/cancel; oferty i kategorie innych aktywów nieukończone |
| Multiplayer | Polling obecności i czatu; bez wspólnego serwera walki |
| Administracja | Tylko chronione metryki ekonomii; bez panelu administracji sprzedażą |
| Mainnet | Konfiguracja i guard; bez deploymentu / audytu |

Walidacja: kompilacja Solidity, TypeScript, build aplikacji, lint, 10 testów game-core, 13 testów kontraktów, wykonanie migracji w czystej bazie SQLite. Próba testów przeglądarkowych została zablokowana przez niedostępny transport narzędzia przeglądarki. Nie zgłaszano wizualnej ani portfelowej walidacji E2E.

Dalsza rozbudowa: toksyczne slime’y, szybkie szczury i pancerne robaki mają różne HP/prędkość/obrażenia. Bolt kupuje obwody i sprzedaje apteczki za Scrap. Wrench wzmacnia broń do poziomu 3. Zadania Spare Parts i Rat Problem mają niezależne, jednorazowe nagrody. Testy kosztów, limitów, wymaganego dystansu i niepowtarzalności nagród przechodzą.

## Movement and supplied artwork update
- Replaced stale-snapshot attraction with bounded input batches, acknowledgement, replay of unacknowledged movement and exponential visual correction. Retries reuse a batch ID; the server does not apply the latest acknowledged batch twice.
- Client and server share collision substeps and normalized 190 px/s movement. Server elapsed-time credit caps submitted motion; prediction stops after one second of unacknowledged input.
- Keyboard overrides click destinations; blocked click targets stop. Walking frames use individual source bounds and distance-based timing; standing has a stable pose. Canvas resolution capped at 2× DPR.
- Added 35 original town-atlas props, plaza/road tiles, item-atlas icons, and nine-slice original UI frames for HUD, quests, hotbar, minimap and dialogs. All source sheets remain unchanged.
- Verification: 14 game rules/movement tests including delayed acknowledgements at 30/60/144 FPS, turns/releases, collision tunnelling and time-budget abuse. Typecheck/lint/build passed. No new browser session or measured device FPS; supplied recording inspected as reference.
- Click movement remains direct steering, not obstacle pathfinding. Extended network outages stop prediction until acknowledgement. Simultaneous control of one character in several tabs is not supported.


## Town surface and creature movement polish
- One cached, low-contrast asphalt material uses a mirrored interior crop with matching boundaries. Connected streets, curbs, crossings, parking bays and square use that common surface; removed framed-tile collage and rectangular tint patches. Minimap shows the same road network.
- Corrected clipped lamp/clutter crops, market-header labels, monster sprite labels and incomplete right/bottom HUD/minimap frame edges. Added 54 placements (89 props total) and five surrounding buildings with shared collision.
- Creatures patrol, acquire/lose chase with hysteresis, return within a home leash, steer around collision with small substeps, and separate softly. Rendering smoothly follows authoritative positions each frame with direction-aware, distance-driven gait and stable sprite anchors. Respawns reset interpolation.
- Validation: 17 game tests, including patrol/speed, melee stopping/leash and collision steering; TypeScript and production build. No browser FPS measurement or browser visual verification in this pass.


## Daily contracts and finished town edges
- Added a continuous decorated perimeter, checkpoint ends, edge lighting/service strips and camera limits to keep the view inside the world.
- Three automatically active daily contracts: defeat five monsters, craft one medkit, search two unique salvage caches. Explicit one-time claim rewards in-game Scrap/XP. Server UTC date resets daily progress while retaining story/economy progress; old saves initialize lazily on their next action.
- Four discoverable salvage caches near the town edges. E searches within 85 world units; each gives 20 Scrap, one circuit and 10 XP once per account/day. Visual searched state and contextual prompts reflect saved progress.
- Daily panel opens with L, its toolbar button, the quest HUD or journal link. It shows task progress, rewards, collected state and reset timezone.
- Validation: 21 game tests passed, including migration/midnight reset, duplicate/incomplete claim rejection, proximity/daily cache rewards and successful-event counting. Typecheck/build passed. Browser visual QA was not run.

## Building interiors
- All 11 town buildings have proximity-checked E entrances and a south E exit returning to the corresponding street door. Room identity and coordinates persist in the existing player save. Invalid/remote entry, remote exit and inter-room entry are rejected by the game rules.
- Interiors have a themed room surface, supplied furniture/props, shared furniture/wall collision, stable camera, location heading and contextual exit prompts. They reuse one room layout with building-specific accents and equipment; they are not separate authored floor plans.
- Workshop/garage Wrench, store/market Bolt, clinic Patch and city-hall Scrappy provide existing services at interior-local positions. Existing outdoor services remain available.
- Street monsters do not simulate combat against an interior player; indoor attacks and street-cache looting are blocked. Presence is filtered by room. Pending motion resets on a confirmed transition and packets carry the originating scene.
- Validation: 25 game tests, including all entrances/exits, room collisions/replay, service isolation, remote-transition rejection and indoor combat isolation. Typecheck/build passed; no browser visual or end-to-end session this pass.

## Loot, equipment and Toxic Sewers
- Six gear definitions across weapon/armor slots and common/rare/epic rarity. Server-awarded monster drops persist in a 40-item stash. Owned items can be equipped/removed; unequipped items can be salvaged once. Equipment modifies authoritative attack damage and damage mitigation, not movement speed or the hero sprite costume.
- Regular enemies have a two-thirds drop chance with deterministic server-time-derived variety (not cryptographic rarity). Garbage King awards an epic; a full stash converts overflow to Scrap with a message. No token/NFT minting or real-money valuation is attached to gear.
- Solo Toxic Sewers entrance at the eastern hatch, scene 11: four connected chambers/corridors, seven enemies, a 450-HP Garbage King, 1.1-second telegraphed 145-unit ground slam, epic loot and 150 Scrap/150 XP/two medkits completion reward plus ordinary kill loot.
- Unfinished runs and enemy HP persist across exits/reloads; dungeon enemies do not respawn mid-run. Re-entering after a clear starts a fresh run. Death returns to town under existing rescue rules. Dungeon rendering hides other players because combat is per-account.
- Stash panel exposes equipped stats, rarity and salvage values. Journal describes hatch location, objectives, rewards and inventory-cap behavior. Supplied monster, item and sewer atlases are reused; no new raster assets generated.
- Validation: 29 game tests passed, including gear ownership/salvage idempotency, all-room reachability, hatch proximity/resume, one-time boss rewards/run restart, telegraph/dodge and armor mitigation. Typecheck/build passed. Browser visual/E2E QA was not performed.

## Mobile layout and creature navigation repair
- Replaced the SVG nine-slice frame grid with fixed CSS metal borders/corners to eliminate intrinsic SVG sizing artifacts shown in the iPhone capture.
- Mobile/coarse-pointer game surface uses dynamic viewport height, compact fixed-height HUD, 88×62 minimap, collapsed quest HUD with existing journal/daily buttons, 42px utility controls and 45–54px action controls. Safe-area-aware bottom controls and smaller camera zoom expose more world. Gear/dialog content scrolls within the dynamic viewport.
- Analog touch joystick supports pointer capture, dead zone, clamped diagonal input and independent action touches; release/cancel/blur/visibility/panel transitions stop movement. Gameplay selection/callout/context menu is suppressed. Medkit count and action accessible labels remain visible/available.
- Creature rendering interpolates between authoritative positions over measured snapshot intervals; fixed idle bug crop avoids atlas label fragments. Server routes around obstacles using a cached 32-unit clearance grid, line-of-sight path smoothing and periodic moving-target replanning. Melee and boss slam obey line of sight.
- Validation: 32 game tests and typecheck/build pass, including routing around the clinic, connected dungeon corridors and rejection of through-wall attacks. Phone screenshot supplied by user was reviewed; no live iOS/browser visual or touch test was available/performed, so device-specific behavior remains unverified.

## 2026-09-09 — town layout and original atlas UI
- Replanned civic, residential, market and industrial blocks around a clear square and connected streets. Frontage props, benches, lamps and signage use the supplied atlases.
- Restored original sheet-6 frame edges with an absolute, ResizeObserver-sized canvas, plus original toolbar, interaction, crafting and dialog icons. Compact phone HUD remains in place.
- Existing outdoor saves migrate to the square without losing progress; interiors remain unchanged. Street creatures use eastern homes and a city-side leash.
- Validation: 33 game-core tests pass, including clinic routing, wall-protected melee, doorway access and save migration. No device/browser visual verification performed for this revision.

## 2026-09-09 — HUD positioning and combat feedback
- Fixed shared frame CSS overriding message positioning. Added opt-in pointer/touch HUD positioning for player, quests, actions, messages, toolbar, joystick, minimap and boss bar, with viewport clamping, separate desktop/mobile local preferences and reset.
- Colored supplied toolbar icons and backgrounds; added original-asset furnished verge pockets, stalls and salvage areas outside the main walking routes.
- Added overhead player health and floating server-confirmed damage, capped to health actually removed. Feedback clears on subsequent actions and scene changes.
- Validation: typecheck and all 34 game tests passed, including damage/cooldown/overkill feedback. Device/browser interaction testing not performed.

## 2026-09-09 — administration, registration and community campaigns
- Added /admin with server-enforced owner/explicit ADMIN_USER_IDS access; owner recognition is anchored to the existing Site owner and trusted platform identity, never the first registrant. Account suspension is enforced by all existing identity-guarded game APIs; owner/self suspension is rejected.
- Added persisted landing draft/publish fields and section visibility, live announcements, maintenance and registration controls, account search/pagination, live database metrics and an admin activity log. Public content excludes drafts. Content revision checks reject stale overwrites.
- Added explicit /register onboarding after ChatGPT sign-in: a reserved game name, consent to create the account, pending state and activation only after a signed wallet link. Existing character identity/progress are retained. This uses Sites authentication; it is NOT a standalone email/password service. Private Site access is unchanged.
- Added /campaigns with scheduled social tasks, evidence submission, manual administrator approval/rejection/resubmission and one approved point award per account/task. No X/Discord OAuth verification is claimed; clicking a link does not award points.
- Added native test-ETH Base Sepolia airdrops: draft terms, immutable launch-time eligibility snapshot with point threshold/recipient cap, per-user claims, CSV of displayed allocations, administrator-wallet signed individual transfers, server payment reservation and submitted hash persistence, exact recipient/value/sender validation with two confirmations and unique transaction attribution. Campaign launch does not send funds. No server private keys, ERC-20 distribution, automatic mass payment or mainnet claim is introduced. Standard direct EOA transfers are required for payment receipt matching; account-abstraction execution is not verified by this flow.
- Four new endpoints and seven new tables are covered by the generated schema-only D1 migration 0003. Six route-level SQLite tests exercise real API handlers with mocked platform identity/RPC: access control, registration, draft isolation/revisions, social deduplication, frozen eligibility and payout reservation/receipt matching. All 34 game-core tests also pass. Typecheck passed. No browser, physical-device or real-wallet transaction test was performed.
- The separate PostgreSQL backend and earlier v10 exported ZIP/instruction do not include these capabilities. No real campaign or payment has been launched by the agent.
- API references: https://developers.cloudflare.com/d1/worker-api/d1-database/ ; https://viem.sh/docs/actions/public/getTransactionReceipt ; https://viem.sh/docs/actions/public/verifyMessage .

## Landing artwork crop correction
- Corrected full atlas bounds for the hero panda, small shack and LAND deed; replaced the clipped apartment showcase with the complete scrap house.
- Landing-only nested SVG atlas viewports clip neighboring atlas cells while fitting the full selected object responsively. Mobile cards now reserve a full-width artwork row; labels and descriptions no longer compete with a narrow floated image.
- Original atlas files and gameplay sprite rendering are unchanged. Source sheets inspected; typecheck/build validation, without browser/device visual QA.

## Aktualizacja auth (zastępuje historyczny opis logowania v11)

Wspólny AuthProvider, SIWE, serwerowe sesje, globalne wylogowanie, role DB i zachowanie identyfikatorów graczy. Szczegóły, wyniki testów i bramki produkcyjne: `AUTH_AUDIT.md` i `AUTH_FLOW.md` w katalogu głównym. WalletConnect ma integrację SDK, ale nie został aktywowany bez project ID Reown. Nie potwierdzono rzeczywistego E2E z portfelem i telefonem.
