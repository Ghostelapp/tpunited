import {makeTerrain} from '../components/tpu/terrain.ts';
import {DECOR} from '../components/tpu/world-decor.ts';
import {BUILDINGS,NPCS} from '../packages/game-core/world.ts';
// Optional visual review: install @napi-rs/canvas separately, or set CANVAS_MODULE.
import {createRequire} from 'node:module';
import {writeFileSync} from 'node:fs';
import {woodsObjects} from '../components/tpu/woods.ts';
import {WOODS_ALL_SPAWNS,WOODS_TREES} from '../packages/game-core/woods.ts';
import {drawWoodsMonster} from '../components/tpu/woods-monsters.ts';
const require=createRequire(import.meta.url);
const {createCanvas,loadImage}=require(process.env.CANVAS_MODULE||'@napi-rs/canvas');
const props=await loadImage('public/assets/forest/props-v2.webp'),monsters=await loadImage('public/assets/sheet-9.webp');
globalThis.document={createElement:()=>createCanvas(1,1)};
const town=await loadImage('public/assets/sheet-7.webp'),terrainArt=await loadImage('public/assets/sheet-10.webp'),npcArt=await loadImage('public/assets/sheet-8.webp');
const terrain=makeTerrain(terrainArt);
for(const [name,x,y,w,h,scale] of [['woods-layout',2150,70,4050,1570,.5],['woods-transition',1750,210,1900,1100,1],['woods-grove',4300,550,1900,1150,1],['woods-south-wall',1550,700,1900,1000,1]]){
 const canvas=createCanvas(Math.round(w*scale),Math.round(h*scale)),g=canvas.getContext('2d');
 g.scale(scale,scale);g.translate(-x,-y);g.drawImage(terrain,0,0);
 const objects=woodsObjects(g,props,{x:3300,y:900});
 for(const b of BUILDINGS)objects.push({y:b.y+b.h,draw:()=>g.drawImage(town,b.sx,b.sy,b.sw,b.sh,b.x,b.y,b.w,b.h)});
 for(const d of DECOR)objects.push({y:d.y,draw:()=>g.drawImage(d.sheet===10?terrainArt:town,d.sx,d.sy,d.sw,d.sh,d.x-d.w/2,d.y-d.h,d.w,d.h)});
 for(const n of NPCS)objects.push({y:n.y,draw:()=>g.drawImage(npcArt,n.sx,n.sy,n.sw,n.sh,n.x-25,n.y-70,50,70)});
 for(const m of WOODS_ALL_SPAWNS)objects.push({y:m.y,draw:()=>{g.save();g.translate(m.x,m.y);drawWoodsMonster(g,monsters,m.id,true,20,10000);g.restore();}});
 objects.sort((a,b)=>a.y-b.y).forEach(o=>o.draw());
 writeFileSync(`docs/previews/${name}.webp`,canvas.toBuffer('image/webp',85));
}
console.log(`${WOODS_TREES.length} trees; 4 previews rendered`);
