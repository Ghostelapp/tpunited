import {AtlasFrame} from './atlas-frame';
import {BUILDINGS} from '@/packages/game-core/world';
import {Sprite} from './sprite';
export const ITEMS={scrap:[28,830,284,198],circuits:[349,830,305,198],medkit:[353,584,273,229],blade:[12,15,317,305],armor:[341,321,270,249],boots:[650,335,305,235],backpack:[35,581,280,240],battery:[1002,577,184,240]} as const;
export function ItemIcon({name,width=40}:{name:keyof typeof ITEMS;width?:number}){const [x,y,w,h]=ITEMS[name];return <Sprite sheet={5} x={x} y={y} w={w} h={h} width={width}/>}
// Nine-slice the empty inventory slot, preserving the original metal corners.
export function Frame(){return <AtlasFrame/>}
export function UIIcon({name,width=32}:{name:'bag'|'quests'|'craft'|'daily'|'settings'|'interact'|'close';width?:number}){
 const icons={bag:[979,78,43,43],quests:[332,491,33,42],craft:[333,449,34,31],daily:[1175,1034,51,45],settings:[1184,78,45,46],interact:[1021,549,34,41],close:[1048,640,42,40]} as const;const [x,y,w,h]=icons[name];return <Sprite sheet={6} x={x} y={y} w={w} h={h} width={width}/>;
}
type Decor={sheet:number;sx:number;sy:number;sw:number;sh:number;x:number;y:number;w:number;h:number};
export const DECOR:Decor[]=[];
const prop=(sx:number,sy:number,sw:number,sh:number,x:number,y:number,w:number,h:number)=>DECOR.push({sheet:7,sx,sy,sw,sh,x,y,w,h});
const foliage=(x:number,y:number,w=34,h=51)=>DECOR.push({sheet:10,sx:633,sy:692,sw:69,sh:103,x,y,w,h});
// Each business gets its own frontage. The central walking axis remains empty.
BUILDINGS.forEach(b=>{const base=b.y+b.h;prop(8,940,45,93,b.x-24,base+32,30,62);prop(8,940,45,93,b.x+b.w+24,base+32,30,62);});
for(const [x,y] of [[914,880],[1215,880],[914,1010],[1215,1010]])prop(325,984,93,49,x,y,70,37);
for(const [x,y] of [[925,825],[1205,825],[925,1045],[1205,1045]])foliage(x,y,32,48);
// Trade frontage: signs at the facade, service equipment in a side alley.
for(const [x,y] of [[1560,1010],[565,630],[1560,625]])prop(235,942,87,90,x,y,49,51);
for(const [x,y] of [[940,690],[1260,1070]])prop(917,937,111,97,x,y,70,61);
for(const [x,y] of [[910,1390],[1265,1390]])prop(16,1071,122,79,x,y,90,59);
for(const [x,y] of [[1560,1370],[565,1380]])prop(651,1080,112,70,x,y,70,44);
for(const [x,y] of [[1810,460],[2250,960],[1940,1410],[2220,1410]])prop(766,1083,80,68,x,y,68,58);
// Defined perimeter and eastern checkpoint, with one clear street approach.
for(let x=35;x<2360;x+=85)for(const y of [72,1680])prop(371,1075,91,75,x+42,y,86,62);
for(let y=80;y<1680;y+=74)for(const x of [35,2365])prop(375,1080,14,70,x,y,20,76);
for(const y of [630,875]){prop(527,985,105,49,1710,y,96,45);prop(8,940,45,93,1710,y+15,32,68);}
for(const [x,y] of [[520,320],[520,680],[520,1065],[520,1435],[1600,320],[1600,680],[1600,1065],[1600,1435]])prop(8,940,45,93,x,y,32,68);
// Small furnished pockets in the vacant verges, away from entrances and roads.
for(const [x,y] of [[310,850],[310,1150],[780,1580],[1380,1580],[1790,300]]){
 prop(325,984,93,49,x,y,70,37);
 for(const dx of [-56,56])foliage(x+dx,y-8);
 prop(8,940,45,93,x+88,y+4,30,62);
}
for(const [x,y] of [[200,940],[405,1300],[1780,1120],[2270,340],[2260,1130]]){
 prop(651,1080,112,70,x,y,70,44);prop(766,1083,80,68,x+70,y+8,52,44);
}
for(const [x,y] of [[270,1420],[1780,1570],[1830,180]]){
 prop(16,1071,122,79,x,y,96,62);prop(917,937,111,97,x+82,y-3,62,54);
}

// Rusty Woods uses the same authored atlas art as Trash Town rather than placeholder
// rectangles. Props cluster around landmarks while the main trail remains uncluttered.
for(const [x,y] of [[2510,650],[2550,850],[2700,470],[2760,1070],[2990,270],[3130,300],[3290,1280],[3470,1120],[3660,700]])foliage(x,y,38,57);
// Moss camp: salvaged benches, utility posts and supply piles.
for(const [x,y] of [[2398,680],[2492,680]])prop(325,984,93,49,x,y,62,33);
for(const [x,y] of [[2380,830],[2535,835]])prop(8,940,45,93,x,y,28,58);
prop(651,1080,112,70,2430,835,63,40);prop(766,1083,80,68,2490,842,48,41);
// Whisper Grove: old forest shrine assembled from recovered town objects.
prop(917,937,111,97,3018,292,62,54);prop(917,937,111,97,3120,292,62,54);
prop(16,1071,122,79,3058,330,92,59);
// Rust Hauler wreck: dense scrap composition made from authored salvage sprites.
prop(16,1071,122,79,3125,1330,105,68);prop(917,937,111,97,3210,1340,72,63);
prop(651,1080,112,70,3270,1360,68,42);prop(766,1083,80,68,3090,1390,58,49);
// Ironroot arena markers create a recognizable boss destination without closing it in.
for(const [x,y] of [[3420,700],[3650,710],[3420,930],[3650,925]])prop(235,942,87,90,x,y,42,44);
