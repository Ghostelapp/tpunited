# Rusty Woods

Follow the east road out of Trash Town, past x=2400. Rusty Woods is part of the same shared outdoor world and is recommended for levels 5–10. There is no loading screen or separate solo instance. The town road blends into a broad dirt approach before the forest becomes dense, with a real opening in the eastern perimeter instead of a hard biome seam.

Moss waits at Trail Camp (2470,760). Press E to accept **Roots of Rust**: land the finishing blow on six standard forest creatures and the Ironroot Golem, then return to Moss. The one-time turn-in pays 200 Scrap, 200 XP and two medkits. Optional elites do not replace those six standard-creature kills.

While the player is inside Rusty Woods, the main HUD switches from the Trash Town starter objective to **Roots of Rust**, showing current creature/Golem progress plus that day's elite landmark recovery count. The forest minimap marks Trail Camp, Whisper Grove, Rust Hauler Wreck, Ironroot Grove and the Junkyard Valley expedition gate.

## Standard forest encounters

Stable shared-world monster IDs 20–26 are unchanged. Every encounter uses a different authored creature from `public/assets/sheet-9.webp`, including idle, movement, attack, hurt and death presentation.

| ID | Encounter | HP | Combat identity | Extra forest salvage |
| --- | --- | ---: | --- | --- |
| 20 | Sap Eel | 120 | Delayed **Sap Shock** circle | +4 Scrap, +3 XP |
| 21 | Mire Hound | 145 | Line telegraph into **Mire Charge** | +6 Scrap, +4 XP |
| 22 | Bramble Bat | 80 | Fast **Bramble Dive** | +2 Scrap, +1 Circuit, +4 XP |
| 23 | Ash Roach | 95 | Medium-range **Ash Spit** | +5 Scrap, +4 XP |
| 24 | Rust Wasp | 180 | Long-range **Rust Burst** | +4 Scrap, +1 Circuit, +5 XP |
| 25 | Cable Serpent | 210 | Wide **Cable Storm** ring | +4 Scrap, +2 Circuits, +6 XP |
| 26 | Ironroot Golem | 700 | Three-phase boss with slams and root eruptions | +30 Scrap, +2 Circuits, +25 XP |

Every skill is scheduled and resolved by the authoritative simulation. Client telegraphs only visualize server state. Dodge invulnerability is respected by the same resolver. Standard creatures respawn after 25 seconds and the Golem after 120 seconds.

## Elite landmark events

Two optional shared-world elite encounters turn Whisper Grove and Rust Hauler Wreck into active destinations. They use append-only IDs 27–28, so existing IDs 20–26 and old saves remain compatible.

| ID | Elite | HP | Landmark | Signature skill | Guaranteed unique rare drop | Respawn |
| --- | --- | ---: | --- | --- | --- | ---: |
| 27 | **Whisper Plaguewing** | 360 | Whisper Grove | **Plague Drop** | **Whisper Mantle** (+6 Armor) | 5 min |
| 28 | **Hauler Sentinel** | 480 | Rust Hauler Wreck | **Sentinel Charge** | **Hauler Arc Blaster** (+16 Damage) | 5 min |

Whisper Plaguewing uses the real Plague Pigeon family from sheet 9 and fights as a mobile ranged elite. Hauler Sentinel uses the authored Riot Bot family and combines ranged spacing with a powered line charge. Both have elite labels, wider health bars, authored attack/hurt/death poses and larger landmark arena markings.

The finishing player receives the normal kill reward plus elite salvage. Elite gear is deliberately stronger than ordinary rare world drops while staying below the Garbage King/Ironroot epic tier:

- Whisper Plaguewing: base kill reward + **18 Scrap, 2 Circuits, 18 XP**, plus guaranteed **Whisper Mantle**.
- Hauler Sentinel: base kill reward + **24 Scrap, 3 Circuits, 24 XP**, plus guaranteed **Hauler Arc Blaster**.

The two named rewards reuse the existing authored equipment art, so no placeholder icon is introduced. If the stash is already full, guaranteed elite gear is automatically salvaged for Scrap instead of silently disappearing.

## Landmark recovery caches

After the associated elite is defeated, its landmark cache becomes recoverable until that shared elite respawns. Press **E** at the glowing cache to collect the event reward. Each character may claim each landmark reward once per UTC day while the elite is down.

- **Whisper Grove Purge**: +40 Scrap, +2 Circuits, +45 XP.
- **Rust Hauler Recovery**: +55 Scrap, +3 Circuits, +60 XP.

The cache is locked while the elite is alive, changes to a bright recovery prompt while the shared elite is defeated, and becomes visually faded after the character has claimed that day's reward. The kill itself is shared-world authoritative; the finishing blow and guaranteed rare item belong to one player, while every nearby player can independently recover their own eligible landmark cache reward before respawn.

## Ironroot Golem phases

The Golem keeps three deterministic health phases:

- **Phase 1 · AWAKENED** — 145-radius ground slam, 28 base damage and 4.5 s skill cooldown.
- **Phase 2 · ROOTBREAK** — faster movement, stronger slam and targeted **Root Burst** alternating with slams.
- **Phase 3 · OVERGROWN** — fastest movement, shorter cooldowns, 178-radius / 34-damage slams and larger root eruptions.

The client displays the active phase beside the boss name and scales telegraphs to the authoritative phase values.

## Map composition and region handoff

Navigation is organized around Moss Trail Camp, Whisper Grove, Rust Hauler Wreck, Ironroot Grove and the eastern **Junkyard Valley Gate**. Trees form groves rather than rows and keep the main trail, NPC interaction point, normal spawns, elite arenas and expedition route walkable.

The main dirt road now continues beyond Ironroot Grove to a signed expedition checkpoint at the east side of the current world. This deliberately communicates where the next region will connect without pretending Junkyard Valley is already playable or adding a loading/teleport flow that does not exist yet.

Whisper Grove uses infected green arena details; Rust Hauler uses cyan mechanical markings. Both are deliberately readable before aggro without adding invisible collision. `components/tpu/woods-monsters.ts` maps all nine forest families to real sheet-9 atlas crops. Every forest monster exposes idle/movement/attack/hurt/death presentation.

## Deployment and validation

No D1 migration or contract deployment is required. Existing monster IDs 20–26 are unchanged; IDs 27–28 are appended by `seedWoods` only when missing. Frontend and realtime Worker must be deployed from the same revision because both share encounter, combat and event definitions.

Automated coverage includes migration idempotency, corridor/tree/spawn/gate accessibility, atlas crop bounds, unique skill profiles, damage vs dodge, Golem phases, elite skills, five-minute elite respawn, named unique rare drops and their balance tier, shared finishing-blow attribution, once-per-day event recovery and prevention of duplicate claims.

A rendered desktop/mobile playtest and a live two-device elite fight + landmark recovery pass remain the final post-deploy acceptance checks.
