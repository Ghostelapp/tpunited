# Rusty Woods

Follow the east road out of Trash Town, past x=2400. Rusty Woods is part of the same shared outdoor world and is recommended for levels 5–10. There is no loading screen or separate solo instance. The town road blends into a broad dirt approach before the forest becomes dense, with a real opening in the eastern perimeter instead of a hard biome seam.

Moss waits at Trail Camp (2470,760). Press E to accept **Roots of Rust**: land the finishing blow on six normal forest creatures and the Ironroot Golem, then return to Moss. The one-time turn-in pays 200 Scrap, 200 XP and two medkits. Quest state remains server authoritative in the shared world.

## Forest encounters

Stable shared-world monster IDs 20–26 are unchanged. Every encounter uses a different authored creature from `public/assets/sheet-9.webp`, including idle, movement, attack, hurt and death presentation.

| ID | Encounter | HP | Combat identity | Extra forest salvage |
| --- | --- | ---: | --- | --- |
| 20 | Sap Eel | 120 | Keeps a short gap and marks a delayed **Sap Shock** circle | +4 Scrap, +3 XP |
| 21 | Mire Hound | 145 | Telegraphs a line, then lunges through it with **Mire Charge** | +6 Scrap, +4 XP |
| 22 | Bramble Bat | 80 | Fastest forest hunter; commits to a quick **Bramble Dive** | +2 Scrap, +1 Circuit, +4 XP |
| 23 | Ash Roach | 95 | Holds medium range and fires delayed **Ash Spit** | +5 Scrap, +4 XP |
| 24 | Rust Wasp | 180 | Maintains long range and fires a narrow **Rust Burst** | +4 Scrap, +1 Circuit, +5 XP |
| 25 | Cable Serpent | 210 | Controls nearby space with a wide **Cable Storm** ring | +4 Scrap, +2 Circuits, +6 XP |
| 26 | Ironroot Golem | 700 | Three-phase boss with ground slams and root eruptions | +30 Scrap, +2 Circuits, +25 XP |

Every skill is scheduled and resolved by the authoritative simulation. Client telegraphs are presentation of server state, not client-side damage authority. Dodge invulnerability is respected by the forest skill resolver. Ranged creatures keep more space, while the Bat and Hound commit to impact movement. Existing equipment loot chances stay intact and the Ironroot Golem retains its guaranteed boss equipment roll.

Ordinary forest creatures respawn after 25 seconds and the Golem after 120 seconds. Respawn clears stale windups, slams, navigation paths and skill-cycle state so a creature cannot reappear with an attack left over from before death.

## Ironroot Golem phases

The Golem now has three deterministic health phases:

- **Phase 1 · AWAKENED** — original ground-slam pattern, 145 radius, 28 base damage, 4.5 s skill cooldown.
- **Phase 2 · ROOTBREAK** — movement speed increases, slam radius/damage increase, and targeted **Root Burst** eruptions alternate with slams.
- **Phase 3 · OVERGROWN** — faster movement, shorter cooldowns, 178-radius / 34-damage slams and larger/faster root eruptions.

The client displays the active phase beside the boss name and scales the slam telegraph to the server-side phase radius. Root Burst uses a separate target-circle telegraph and the Scrap Golem secondary attack pose.

## Combat presentation

`components/tpu/woods-monsters.ts` maps the seven encounters to the real Monster Pack 2 atlas. Each family now exposes authored attack, hurt and death crops in addition to idle/movement frames. During windup the matching attack pose is shown, recent hits use the hurt frame, and defeated forest monsters briefly render their death pose before fading out.

Skill telegraphs use encounter-specific colors and geometry: circles for delayed target attacks, lines plus impact circles for charges/dives/ranged bursts, and a double ring for Cable Storm. These visuals are intentionally non-blocking and do not alter collision geometry.

## Map composition

Navigation is organized around four landmarks: Moss Trail Camp at the western entrance, Whisper Grove in the north, Rust Hauler Wreck in the south and Ironroot Grove around the boss. Trees form groves rather than rows, leaving the main route, ranger interaction point and all combat spawns open. Additional stumps, rocks, mushrooms and authored atlas props break up empty space without blocking traversal.

## Deployment and validation

No D1 migration or contract deployment is required. Stable monster IDs 20–26 and existing save data remain compatible. Frontend and realtime Worker should be deployed from the same revision because both clients and server share the forest combat definitions.

Automated coverage includes migration idempotency, corridor/tree/spawn accessibility, atlas crop bounds for idle/move/attack/hurt/death, unique skill profiles, skill scheduling, damage vs dodge, three boss phases, Root Burst, enlarged phase-three slam, species salvage, shared boss kill attribution, respawn and sewer isolation.

A rendered desktop/mobile playtest and a live two-device Rusty Woods combat pass remain the final post-deploy acceptance checks.
