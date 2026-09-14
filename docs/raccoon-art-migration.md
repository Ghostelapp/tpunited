# Raccoon identity migration

The species is a raccoon: grey/brown fur, a dark eye mask, pointed muzzle, and
ringed tail. The product name remains **Trash Panda United**.

## Artwork and rendering

- Updated the hero, founder/admin, NPC, building, terrain, item and UI atlases,
  city illustration, SVG header mark, favicon and eight equipment SVGs.
- Updated landing copy and the web/PDF litepaper.
- Original promotional atlases retain their 1254px dimensions.
- Runtime player and admin atlases are separate: four columns, three rows
  (idle, walk, attack), 384px cells, feet pivot (192, 352). Transparent padding
  keeps neighboring sprites and tails outside each other's frames.
- Both outfits use the same renderer, animation timing and scale. Local and
  remote players use it in town and on parcels.
- Both ADMIN and SUPER_ADMIN receive the exclusive outfit; the server supplies
  appearance flags in game snapshots and parcel presence responses.
- Runtime image URLs are versioned to refresh cached artwork.

## Rebuilding artwork

Run `python scripts/prepare-raccoon-art.py` with Pillow, numpy and scipy installed.
The three inputs in `art/source` are source material, not files served in game.
The script removes the baked checkerboard from the player sheet, separates admin
attack effects, packs the runtime atlases, updates the monster badge and creates
self-contained cropped equipment SVGs. It writes PNG/WebP files atomically.

Run `python scripts/build-litepaper.py` with ReportLab and Pillow to rebuild the
PDF. The script also uses the DejaVu fonts installed on the build machine.

## Validation

- `npm run art:test`: frame bounds, stable foot position and attack transitions.
- `npm run typecheck`, `npm run realtime:test`, `npm run build`.
- Verified all 24 runtime cells are nonempty with transparent padding and that
  WebP alpha and visible pixel data match their PNG sources exactly.
- Inspected the frame previews and rendered eight-page litepaper.
- `raccoon-animation-preview.gif` previews both outfits in all three states.
- Live browser verification remains a deployment smoke test; the Chromium
  download failed in this environment. The automated build is not evidence of
  deployment to Cloudflare.
