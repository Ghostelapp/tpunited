import {woodsMonsterProfile,type WoodsAtlasMonster} from '../../packages/game-core/woods.ts';

export const WOODS_MONSTER_SHEET=9;
type Frame=readonly [sx:number,sy:number,sw:number,sh:number];
export type WoodsMonsterPose='idle'|'move'|'attack'|'hurt'|'death';
type AtlasEntry={idle:Frame;move:readonly Frame[];attack:readonly Frame[];hurt:Frame;death:Frame;size:readonly [number,number];hover?:number};

// Runtime crops from public/assets/sheet-9.webp. Crops stop above the caption plates
// and expose the pack's real attack / hurt / death art rather than recolored town mobs.
export const WOODS_MONSTER_ATLAS:Record<WoodsAtlasMonster,AtlasEntry>={
 'sewer-eel':{
  idle:[245,30,105,105],move:[[350,45,165,92],[515,50,145,87]],
  attack:[[660,30,160,105],[815,30,160,105]],hurt:[970,35,135,100],death:[1095,35,145,100],size:[92,84],
 },
 'junk-hound':{
  idle:[210,170,132,75],move:[[350,170,145,75],[495,170,140,75]],
  attack:[[790,168,150,82]],hurt:[940,168,145,82],death:[1080,170,165,78],size:[94,64],
 },
 'neon-bat':{
  idle:[205,278,140,79],move:[[345,278,170,79],[505,278,140,79]],
  attack:[[650,278,150,82],[800,278,165,82]],hurt:[965,278,125,82],death:[1090,278,155,82],size:[92,66],hover:8,
 },
 'toxic-roach':{
  idle:[210,395,132,77],move:[[350,395,142,77],[500,395,146,77]],
  attack:[[650,395,180,77]],hurt:[920,395,150,77],death:[1070,395,175,77],size:[88,60],
 },
 'drone-wasp':{
  idle:[215,498,130,92],move:[[355,498,160,92],[215,498,130,92]],
  attack:[[520,498,175,92],[690,498,175,92]],hurt:[860,498,165,92],death:[1025,498,215,92],size:[88,68],hover:7,
 },
 'cable-serpent':{
  idle:[215,620,160,72],move:[[375,620,165,72],[215,620,160,72]],
  attack:[[540,620,205,72],[740,620,195,72]],hurt:[930,620,155,72],death:[1080,620,165,72],size:[108,54],
 },
 'scrap-golem':{
  idle:[210,716,145,101],move:[[355,716,137,101],[492,716,133,101]],
  attack:[[625,716,175,101],[790,716,165,101]],hurt:[950,716,140,101],death:[1080,716,165,101],size:[154,110],
 },
 'riot-bot':{
  idle:[210,960,112,73],move:[[338,960,112,73],[210,960,112,73]],
  attack:[[453,960,145,73],[707,960,205,73]],hurt:[915,960,121,73],death:[1040,960,205,73],size:[116,84],
 },
 'plague-pigeon':{
  idle:[211,1057,105,60],move:[[343,1057,117,60],[211,1057,105,60]],
  attack:[[471,1057,161,60],[633,1057,188,60]],hurt:[822,1057,127,60],death:[956,1057,130,60],size:[104,64],hover:6,
 },
};

export function woodsMonsterPoseFrame(id:number,pose:WoodsMonsterPose,distance=0,attackVariant=0):Frame|undefined{
 const profile=woodsMonsterProfile(id);if(!profile)return;
 const entry=WOODS_MONSTER_ATLAS[profile.atlasMonster];
 if(pose==='hurt')return entry.hurt;
 if(pose==='death')return entry.death;
 if(pose==='attack')return entry.attack[Math.min(entry.attack.length-1,Math.max(0,attackVariant))]??entry.attack[0]??entry.idle;
 if(pose==='move'&&entry.move.length)return [entry.idle,...entry.move,entry.move[0]][Math.floor(Math.max(0,distance)/20)%(entry.move.length+2)];
 return entry.idle;
}

// Backwards-compatible helper used by atlas tests and any older callers.
export function woodsMonsterAtlasFrame(id:number,walking:boolean,distance:number):Frame|undefined{
 return woodsMonsterPoseFrame(id,walking?'move':'idle',distance);
}

export function drawWoodsMonster(
 ctx:CanvasRenderingContext2D,
 image:HTMLImageElement,
 id:number,
 walking:boolean,
 distance:number,
 now:number,
 flash=false,
 pose?:WoodsMonsterPose,
 attackVariant=0,
){
 const profile=woodsMonsterProfile(id);if(!profile||!image?.complete||!image.naturalWidth)return false;
 const entry=WOODS_MONSTER_ATLAS[profile.atlasMonster];
 const resolvedPose=pose??(flash?'hurt':walking?'move':'idle');
 const frame=woodsMonsterPoseFrame(id,resolvedPose,distance,attackVariant)!;
 const [sx,sy,sw,sh]=frame,[baseW,baseH]=entry.size;
 const scale=Math.min(baseW/entry.idle[2],baseH/entry.idle[3])*profile.scale,w=sw*scale,h=sh*scale;
 const hover=entry.hover&&resolvedPose!=='death'?Math.sin(now/180+id)*entry.hover:0;
 
 ctx.save();ctx.filter=flash&&resolvedPose!=='hurt'?'brightness(2.15)':profile.filter;
 ctx.drawImage(image,sx,sy,sw,sh,-w/2,-h+6+hover,w,h);ctx.restore();
 return true;
}
