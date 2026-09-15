# Rusty Woods elite events · acceptance

## Automated / implementation checks

- [x] Original shared-world IDs 20–26 remain unchanged.
- [x] Append-only elite IDs 27–28 seed only when missing from an older shared save.
- [x] Whisper Plaguewing uses the real Plague Pigeon sheet-9 family.
- [x] Hauler Sentinel uses the real Riot Bot sheet-9 family.
- [x] Both elites expose idle, movement, attack, hurt and death atlas poses.
- [x] Plague Drop and Sentinel Charge are server-authoritative skills with distinct telegraphs and spacing.
- [x] Elite spawns and landmark recovery points are walkable and do not add hidden collision.
- [x] Elite respawn is five minutes and stale windup/navigation state is cleared on respawn.
- [x] Whisper Plaguewing guarantees the rare Scavenger Hood.
- [x] Hauler Sentinel guarantees the rare Neon Blaster.
- [x] Full stashes salvage guaranteed elite gear instead of losing it.
- [x] Elite kills do not replace standard-creature progress in Roots of Rust.
- [x] Whisper Grove Purge and Rust Hauler Recovery unlock only while their associated elite is defeated.
- [x] Landmark recovery rewards are claimable once per character per UTC day.
- [x] Repeat claims during the same UTC day do not pay twice.
- [x] Shared-world finishing blows award the elite kill/rare item once while all clients receive the same monster state.
- [x] No D1 migration or contract deployment is required.

## Post-deploy visual / device acceptance

- [ ] Desktop: elite art, labels, health bars, telegraphs and recovery cache prompts render correctly.
- [ ] Mobile/touch: elite arenas and cache interaction remain readable without covering core controls.
- [ ] Two devices: both clients see the same elite movement, windup, death and five-minute respawn state.
- [ ] Two devices: only the finishing player receives the guaranteed rare item.
- [ ] Two devices: both eligible characters can independently recover the landmark reward while the elite is down.
- [ ] Verify Whisper Grove and Rust Hauler Wreck composition at normal gameplay zoom after production deployment.
