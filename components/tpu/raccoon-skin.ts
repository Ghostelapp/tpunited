export const RACCOON_SKIN_URL = '/assets/raccoon-player.webp?v=raccoon-20260914-2';

// Four columns, three rows (idle, walk, attack). Each 384px cell has its
// feet anchored at (192, 352), including the tail and weapon effects.
export function drawRaccoonSkin(
 ctx: CanvasRenderingContext2D,
 image: HTMLImageElement,
 walking: boolean,
 distance: number,
 attackAge = Infinity,
 time = Date.now(),
) {
 const attacking = attackAge >= 0 && attackAge < 350;
 const row = attacking ? 2 : walking ? 1 : 0;
 const frame = attacking
  ? Math.min(3, Math.floor(attackAge / 87.5))
  : Math.floor(Math.max(0, walking ? distance / 20 : time / 300)) % 4;
 ctx.drawImage(image, frame * 384, row * 384, 384, 384, -60, -110, 120, 120);
}
