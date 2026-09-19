# Trash Town scale and streetscape refresh

Building widths increase by 12% and most heights by 22%. Northern roofs are
capped below the perimeter. Entrance centres and baseline positions stay fixed;
the shared building definitions also update collision widths and the minimap.
Existing saved characters caught in widened bases or new furniture return to the
town spawn once, with progression preserved. Indoor positions are retained.

Town/dungeon monster artwork is 30% larger, with matching shadows and raised HP
bars. Forest monster art and combat balance are unchanged.

New authored places use the existing pixel-art atlas:

- Western street market: two stalls, notice board and refuse bin.
- Salvager Park: paved walking paths, planted verges and larger benches.
- Service plaza: vending machine and terminal scenery.
- Freight yard: loading bays, crate stacks, dumpster and safety markings.

New substantial furniture has ground-footprint collisions shared by client
movement, server simulation and monster pathfinding. Existing decorative props
remain cosmetic. Stalls and terminals are scenery, not new shops or services.
Building entrances, services, caches, sewer access and main roads remain usable.

## Validation

`npm run game:test` includes a reachability flood-fill for every town entrance,
service, cache and the sewer, plus furniture collision and saved-state migration
checks. CI also runs realtime and integration tests.

Optional static visual review (not a full browser session): install
`@napi-rs/canvas` separately and run:

```sh
CANVAS_MODULE=/path/to/node_modules/@napi-rs/canvas node --import ./scripts/register-test-typescript.mjs scripts/preview-city.mjs
```

The generated overview and square images are in `docs/previews/city-*.webp`.
Deploy both workers with `scripts/deploy-testnet.ps1` so authoritative collision
geometry and client rendering use the same version. No database migration is
introduced by this change.
