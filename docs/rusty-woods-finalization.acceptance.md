# Rusty Woods finalization acceptance

This checklist closes the remaining player-facing polish gap after the combat and elite-event passes.

## Finalization targets

- [ ] Rusty Woods uses a forest-specific objective HUD instead of the Trash Town starter quest while the player is in the forest.
- [ ] Quest journal consistently names the Ironroot Golem and explains the two elite landmark events.
- [ ] Whisper Plaguewing and Hauler Sentinel drop unique named rare gear rather than generic world-drop rares.
- [ ] Unique elite gear uses existing authored equipment art and remains below epic boss gear in power.
- [ ] Forest minimap communicates Moss, Ironroot and the two elite landmarks.
- [ ] East edge of Rusty Woods reads as a deliberate route toward Junkyard Valley rather than an unfinished map boundary.
- [ ] Existing shared-world IDs 20–28 and save migration remain compatible.
- [ ] Roots of Rust progression and elite daily-event behavior remain server authoritative.
- [ ] Full Gameplay Review passes: typecheck, game tests, realtime tests, art tests, frontend build, realtime Worker build, full-app WebSocket integration.

## Post-deploy manual checks

- [ ] Desktop render: HUD, minimap markers, elite gear names and east gate read correctly.
- [ ] Mobile/touch render: forest objective HUD and minimap remain readable without overlap.
- [ ] Two-device live pass: elite finishing blow, unique loot, recovery cache and respawn synchronize correctly.
