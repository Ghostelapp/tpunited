# Rusty Woods

Follow the east road out of Trash Town, past x=2400. Rusty Woods is part of the same shared outdoor world and is recommended for levels 5–10. There is no loading screen or separate solo instance. The town road blends into a broad dirt approach before the forest becomes dense, with a real opening in the eastern perimeter instead of a hard biome seam.

Moss waits at Trail Camp (2470,760). Press E to accept **Roots of Rust**: land the finishing blow on six normal forest creatures and the Ironroot Golem, then return to Moss. The one-time turn-in pays 200 Scrap, 200 XP and two medkits. Quest state remains server authoritative in the shared world.

## Forest encounters

Stable shared-world monster IDs 20–26 are unchanged, but the seven encounters now use different authored creatures from `public/assets/sheet-9.webp` instead of one slime/rat/bug art set with a shared tint:

| ID | Encounter | HP | Authored monster family | Extra forest salvage |
| --- | --- | ---: | --- | --- |
| 20 | Sap Eel | 120 | Sewer Eel | +4 Scrap, +3 XP |
| 21 | Mire Hound | 145 | Junk Hound | +6 Scrap, +4 XP |
| 22 | Bramble Bat | 80 | Neon Bat | +2 Scrap, +1 Circuit, +4 XP |
| 23 | Ash Roach | 95 | Toxic Roach | +5 Scrap, +4 XP |
| 24 | Rust Wasp | 180 | Drone Wasp | +4 Scrap, +1 Circuit, +5 XP |
| 25 | Cable Serpent | 210 | Cable Serpent | +4 Scrap, +2 Circuits, +6 XP |
| 26 | Ironroot Golem | 700 | Scrap Golem | +30 Scrap, +2 Circuits, +25 XP |

These bonuses are added on top of the existing base finishing-blow reward. Existing equipment loot chances stay intact; the Ironroot Golem retains the guaranteed boss equipment roll. Ordinary forest creatures respawn after 25 seconds and the Golem after 120 seconds.

Each monster also has a dedicated idle/movement crop, scale, visual treatment and readable habitat marker. Sap and mire encounters sit in stained pools, Bramble Bat has a root/brush den, Ash Roach uses a scorched clearing, Rust Wasp and Cable Serpent occupy mechanical nests, and the Golem arena is wrapped in Ironroot growth. These markings are decorative and do not create invisible collision.

## Map composition

Navigation is organized around four landmarks: Moss Trail Camp at the western entrance, Whisper Grove in the north, Rust Hauler Wreck in the south and Ironroot Grove around the boss. Trees form groves rather than rows, leaving the main route, ranger interaction point and all combat spawns open. Additional stumps, rocks, mushrooms and authored atlas props break up empty space without blocking traversal.

The forest still uses the existing authoritative server combat archetypes for movement and skill timing, so stable saves and multiplayer simulation remain compatible. The visual species, habitat, health profile and salvage reward provide encounter identity without changing IDs 20–26 or requiring a D1 migration. The Ironroot Golem continues to use the telegraphed ground-slam boss mechanic.

## Deployment and validation

No D1 migration or contract deployment is required. Frontend and realtime Worker should be deployed from the same revision because both clients and server share the forest encounter definitions. Automated coverage includes migration idempotency, entry corridor clearance, tree collision, spawn accessibility, unique encounter profiles, monster-atlas crop bounds, species salvage rewards, Moss quest copy/reward, shared boss kill attribution, respawn and sewer isolation.

A rendered desktop/mobile playtest and a live two-device visual combat pass remain the final acceptance checks after deployment.
