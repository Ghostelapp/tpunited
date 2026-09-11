# Navigation and parcel visits — continuation after migration 0013

- Header and town branding navigate directly to `/`, including a full document transition out of the game.
- Parcel header includes the same home destination and a separate TOWN action.
- Game-window emblem and the travel window's BACK TO HOME link remain available while the modal blocks the page behind it.
- Travel refresh reloads both owned land and invitations. Errors are shown separately; failed invitation requests no longer look like an empty directory.
- Stale directory responses are discarded after a newer request, account change or leaving the travel window.
- Players can enter a parcel number (1–100). Existing `/api/parcel` access checks remain authoritative; private/invited-only access is not bypassed.
- Travel links to the existing player marketplace. This update does not add a new trading backend.

No database migration or contract deployment is required. Continue from Homestead/tutorial migration 0013. Next larger milestones remain player trading beyond LAND, shared parcel presence, and real-wallet end-to-end verification.

This source update must be built and deployed to the external Cloudflare installation before it appears there.
