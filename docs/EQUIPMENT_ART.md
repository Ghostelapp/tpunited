# Equipment artwork and NFTs

Eight self-contained artwork files live in `public/assets/equipment`. They embed the original supplied pixel-art atlas in SVG wrappers; no external image server is needed. These are newly integrated existing illustrations, not newly generated drawings.

## Create an NFT item
1. Open Admin → NFT armory and connect or deploy the collection.
2. Choose a Game Equipment Template. This fills artwork, name, description, slot, rarity, damage, armor and minimum level.
3. Adjust the values. Weapons require positive damage and zero armor; armor requires positive armor and zero damage.
4. Save a draft, review it, then publish and lock its definition.
5. Mint to a registered player with the authorized wallet, or import an already minted token.
6. The player can equip the verified item in the NFT Armory. Templates alone do not create tokens or grant ownership.

The metadata endpoint resolves artwork to an absolute URL and includes an Artwork trait for templates. A public deployment is required for external marketplaces to fetch metadata and artwork. Some marketplaces have different SVG rendering support; upload PNG artwork instead when required by the target marketplace. Existing published tokens retain their artwork and stats.

## Extend the catalog
Add a self-contained image in public/assets/equipment and a template in packages/game-core/equipment-art.ts. The shared allowlist permits only registered template paths in the NFT API. Custom artwork can still use the existing upload or HTTPS URL field. Current gameplay supports weapon and armor slots: boots, hoods and gauntlets occupy armor, not additional simultaneous slots.
