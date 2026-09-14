import {woodsMonsterProfile} from '../../packages/game-core/woods.ts';

export const WOODS_MONSTER_SHEET=9;
type Frame=readonly [sx:number,sy:number,sw:number,sh:number];
type AtlasMonster='sewer-eel'|'junk-hound'|'neon-bat'|'toxic-roach'|'drone-wasp'|'cable-serpent'|'scrap-golem';
type AtlasEntry={idle:Frame;move:readonly Frame[];size:readonly [number,number];hover?:number};

// Runtime crops from public/assets/sheet-9.webp. The source pack contains labels
// below every pose; these rectangles intentionally stop above those labels.
export const WOODS_MONSTER_ATLAS:Record<AtlasMonster,AtlasEntry>={
 'sewer-eel':{idle:[245,30,105,105],move:[[350,45,165,92],[515,50,145,87]],size:[92,84]},
 'junk-hound':{idle:[210,170,132,75],move:[[350,170,145,75],[495,170,140,75]],size:[94,64]},
 'neon-bat':{idle:[205,278,140,79],move:[[345,278,170,79],[505,278,140,79]],size:[92,66],hover:8},
 'toxic-roach':{idle:[210,395,132,77],move:[[350,395,142,77],[500,395,146,77]],size:[88,60]},
 'drone-wasp':{idle:[215,498,130,92],move:[[355,498,160,92],[215,498,130,92]],size:[88,68],hover:7},
 'cable-serpent':{idle:[215,620,160,72],move:[[375,620,165,72],[215,620,160,72]],size:[108,54]},
 'scrap-golem':{idle:[210,716,145,101],move:[[355,716,137,101],[492,716,133,101]],size:[154,110]},
};

export function woodsMonsterAtlasFrame(id:number,walking:boolean,distance:number):Frame|undefined{
 const profile=woodsMonsterProfile(id);if(!profile)return;
 const entry=WOODS_MONSTER_ATLAS[profile.atlasMonster];
 if(!walking||!entry.move.length)return entry.idle;
 return entry.move[Math.floor(distance/14)%entry.move.length];
}

export function drawWoodsMonster(
 ctx:CanvasRenderingContext2D,
 image:HTMLImageElement,
 id:number,
 walking:boolean,
 distance:number,
 now:number,
 flash=false,
){
 const profile=woodsMonsterProfile(id);if(!profile||!image?.complete||!image.naturalWidth)return false;
 const entry=WOODS_MONSTER_ATLAS[profile.atlasMonster],frame=woodsMonsterAtlasFrame(id,walking,distance)!;
 const [sx,sy,sw,sh]=frame,[baseW,baseH]=entry.size,w=baseW*profile.scale,h=baseH*profile.scale;
 const hover=entry.hover?Math.sin(now/180+id)*entry.hover:0;
 ctx.save();ctx.filter=flash?'brightness(2.15)':profile.filter;
 ctx.drawImage(image,sx,sy,sw,sh,-w/2,-h+6+hover,w,h);ctx.restore();
 return true;
}
