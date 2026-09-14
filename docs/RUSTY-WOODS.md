# Rusty Woods
Follow the east road out of Trash Town, past x=2400. Rusty Woods is part of the shared outdoor world, recommended for levels 5–10. There is no loading screen or separate solo instance.

Moss waits at the trail camp (2470,760). Press E to accept Roots of Rust: land finishing blows on six forest creatures and the Ironroot Guardian, then return to Moss for a one-time reward of 200 Scrap, 200 XP and two medkits. The quest journal shows progress.

Seven enemies populate the forest: two Sap Slimes (120 HP), two Bramble Rats (80 HP), two Rust Beetles (180 HP) and the Ironroot Guardian (700 HP). Forest variants use the existing enemy animations with a forest tint and names. The Guardian uses a telegraphed ground slam and drops existing epic equipment. Ordinary enemies respawn after 25 seconds; the Guardian after 120 seconds. Finishing blows grant loot and quest credit, with no party reward duplication. Two extra salvage caches reset daily.

The shared world's saved monster list is extended by stable IDs 20–26 on its next tick; existing health and respawn timers are preserved. No D1 schema migration is required. Deploy the realtime Worker and frontend together because the world boundary and collision geometry changed. Trees share collision geometry with movement and navigation. Existing sewer completion and mastery rewards remain sewer-only.

Automated coverage includes migration idempotency, entry path, tree collision, quest proximity and one-time rewards, shared boss kill attribution, respawn and sewer isolation. A rendered browser check and live two-device acceptance remain necessary to assess visual polish and real-world latency.
